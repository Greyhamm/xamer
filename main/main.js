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
const authRoutes = require('../backend/routes/auth'); // Add this line
const dotenv = require('dotenv');
dotenv.config();

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
expressApp.use('/api/auth', authRoutes); // Add this line
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
    width: 1200, // Increased width for better UI
    height: 800, // Increased height for better UI
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Correct path to preload.js
      nodeIntegration: false, // Disabled for security
      contextIsolation: true, // Enabled
    },
  });

  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Uncomment the following line to open DevTools by default
  // win.webContents.openDevTools();

  // Handle the Window's 'close' Event
  win.on('close', (event) => {
    // Perform any cleanup if necessary
  });
}

// When Electron is Ready, Create the Window
app.whenReady().then(() => {
  createWindow();

  // On macOS, recreate a window when the dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Handle the 'before-quit' Event to Close the Express Server
app.on('before-quit', (event) => {
  console.log('App is quitting. Closing Express server...');
  
  // Close the Express server gracefully
  server.close(() => {
    console.log('Express server closed.');
    // Exit the process after the server has closed
    process.exit(0);
  });

  // Force quit if the server doesn't close within a timeout
  setTimeout(() => {
    console.warn('Forcing app to quit.');
    process.exit(1);
  }, 10000); // 10 seconds timeout
});

// Adjust 'window-all-closed' Behavior
app.on('window-all-closed', function () {
  // On macOS, it's common for applications to stay open until the user explicitly quits
  // However, since we want to quit when the window is closed, override the default behavior
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle API Methods

ipcMain.handle('create-exam', async (event, examData) => {
  try {
    // Replace with actual logic to create an exam, e.g., interacting with the database
    const ExamController = require('../backend/controllers/ExamController');
    const response = await ExamController.createExam({ ...examData, user: event.sender.user });
    return { success: true, data: response };
  } catch (error) {
    console.error('Create exam error:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('publish-exam', async (event, examId) => {
  try {
    const ExamController = require('../backend/controllers/ExamController');
    const response = await ExamController.publishExam(examId, event.sender.user);
    return { success: true, data: response };
  } catch (error) {
    console.error('Publish exam error:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-exams', async (event) => {
  try {
    const ExamController = require('../backend/controllers/ExamController');
    const exams = await ExamController.getExams(event.sender.user);
    return { success: true, data: exams };
  } catch (error) {
    console.error('Get exams error:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-exam-by-id', async (event, examId) => {
  try {
    const ExamController = require('../backend/controllers/ExamController');
    const exam = await ExamController.getExam(examId, event.sender.user);
    return { success: true, data: exam };
  } catch (error) {
    console.error('Get exam by ID error:', error);
    return { success: false, message: error.message };
  }
});

// Added Handlers

ipcMain.handle('get-exam-stats', async (event) => {
  try {
    const ExamController = require('../backend/controllers/ExamController');
    const stats = await ExamController.getStats(event.sender.user);
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching exam stats:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-recent-exams', async (event) => {
  try {
    const ExamController = require('../backend/controllers/ExamController');
    const recentExams = await ExamController.getRecentExams(event.sender.user);
    return { success: true, data: recentExams };
  } catch (error) {
    console.error('Error fetching recent exams:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-recent-submissions', async (event) => {
  try {
    const ExamController = require('../backend/controllers/ExamController');
    const recentSubmissions = await ExamController.getRecentSubmissions(event.sender.user);
    return { success: true, data: recentSubmissions };
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return { success: false, message: error.message };
  }
});

// Example Implementations (Replace with actual database calls)

async function getExamStatsFromDatabase() {
  // Fetch and return exam statistics from your database
  return {
    totalExams: 50,
    publishedExams: 30,
    pendingGrading: 5,
    totalSubmissions: 200
  };
}

async function getRecentExamsFromDatabase() {
  // Fetch and return recent exams from your database
  return [
    { id: 1, title: 'Math Exam 1', status: 'published', questions: [], createdAt: '2023-09-01' },
    { id: 2, title: 'Science Exam 1', status: 'draft', questions: [], createdAt: '2023-09-05' }
  ];
}

async function getRecentSubmissionsFromDatabase() {
  // Fetch and return recent submissions from your database
  return [
    {
      _id: 101,
      exam: { title: 'Math Exam 1' },
      student: { username: 'john_doe' },
      submittedAt: '2023-09-10',
      status: 'graded'
    },
    {
      _id: 102,
      exam: { title: 'Science Exam 1' },
      student: { username: 'jane_smith' },
      submittedAt: '2023-09-12',
      status: 'pending'
    }
  ];
}
