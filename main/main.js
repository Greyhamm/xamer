// main/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const examRoutes = require('../backend/routes/exam');
const codeExecutionRoutes = require('../backend/routes/codeExecution');
const mediaRoutes = require('../backend/routes/media');
const authRoutes = require('../backend/routes/auth');
const ipcAsyncHandler = require('../backend/utils/ipcAsyncHandler');
const dotenv = require('dotenv');
dotenv.config();

// Import controllers
const { ExamController } = require('../backend/controllers/ExamController');
const examController = new ExamController();

// Initialize Express App
const expressApp = express();
const EXPRESS_PORT = process.env.PORT || 3000;

// Middleware
expressApp.use(cors());
expressApp.use(bodyParser.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/electron_exam_app';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Routes
expressApp.use('/api/auth', authRoutes);
expressApp.use('/api', examRoutes);
expressApp.use('/api', codeExecutionRoutes);
expressApp.use('/api', mediaRoutes);
expressApp.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Start Express Server and Store the Server Instance
const server = expressApp.listen(EXPRESS_PORT, () => {
  console.log(`Express server running on http://localhost:${EXPRESS_PORT}`);
});

// Function to Create the Main Window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Uncomment the following line to open DevTools by default
  // win.webContents.openDevTools();
}

// When Electron is Ready, Create the Window
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Handle the 'before-quit' Event to Close the Express Server
app.on('before-quit', (event) => {
  console.log('App is quitting. Closing Express server...');
  
  server.close(() => {
    console.log('Express server closed.');
    process.exit(0);
  });

  // Force quit if the server doesn't close within a timeout
  setTimeout(() => {
    console.warn('Forcing app to quit.');
    process.exit(1);
  }, 10000);
});

// Adjust 'window-all-closed' Behavior
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('create-exam', ipcAsyncHandler(async (event, examData) => {
  console.log('Creating exam with data:', examData);
  return await examController.createExam({
    body: examData,
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

ipcMain.handle('publish-exam', ipcAsyncHandler(async (event, examId) => {
  console.log('Publishing exam:', examId);
  return await examController.publishExam({
    params: { id: examId },
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

ipcMain.handle('get-exams', ipcAsyncHandler(async (event) => {
  console.log('Fetching exams for user:', event.sender.userId);
  return await examController.getExams({
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

ipcMain.handle('get-exam-by-id', ipcAsyncHandler(async (event, examId) => {
  console.log('Fetching exam:', examId);
  return await examController.getExam({
    params: { id: examId },
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

ipcMain.handle('get-exam-stats', ipcAsyncHandler(async (event) => {
  console.log('Fetching exam stats for user:', event.sender.userId);
  return await examController.getStats({
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

ipcMain.handle('get-recent-exams', ipcAsyncHandler(async (event) => {
  console.log('Fetching recent exams for user:', event.sender.userId);
  return await examController.getRecentExams({
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

ipcMain.handle('get-recent-submissions', ipcAsyncHandler(async (event) => {
  console.log('Fetching recent submissions for user:', event.sender.userId);
  return await examController.getRecentSubmissions({
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

// Handle exam submissions
ipcMain.handle('submit-exam', ipcAsyncHandler(async (event, { examId, answers }) => {
  console.log('Submitting exam:', examId);
  return await examController.submitExam({
    body: { examId, answers },
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

// Handle grading submissions
ipcMain.handle('grade-submission', ipcAsyncHandler(async (event, { submissionId, grades }) => {
  console.log('Grading submission:', submissionId);
  return await examController.gradeSubmission({
    params: { id: submissionId },
    body: { grades },
    user: {
      userId: event.sender.userId,
      role: event.sender.role
    }
  });
}));

// Export the app for testing purposes
module.exports = app;