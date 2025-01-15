const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const examRoutes = require('../backend/routes/exam');
const codeExecutionRoutes = require('../backend/routes/codeExecution');
const mediaRoutes = require('../backend/routes/media');
const authRoutes = require('../backend/routes/auth');
const submissionRoutes = require('../backend/routes/submission');
const ipcAsyncHandler = require('../backend/utils/ipcAsyncHandler');
const dotenv = require('dotenv');
dotenv.config();
const classRoutes = require('../backend/routes/class');
// Import controllers
const { ExamController } = require('../backend/controllers/ExamController');
const examController = new ExamController();


// Initialize Express App
const expressApp = express();
const EXPRESS_PORT = process.env.PORT || 3000;

// Middleware
expressApp.use(cors());
expressApp.use(bodyParser.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/electron_exam_app';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Routes
expressApp.use('/api/auth', authRoutes);
expressApp.use('/api', examRoutes);
expressApp.use('/api', codeExecutionRoutes);
expressApp.use('/api/media', mediaRoutes); 
expressApp.use('/api', classRoutes);
expressApp.use('/api/submissions', submissionRoutes);

// Serve static files from uploads directory
expressApp.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Start Express Server
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
      worldSafeExecuteJavaScript: true,
      sandbox: true
    }
  });

  // Set CSP headers
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com;",
          "style-src 'self' 'unsafe-inline' https://unpkg.com;",
          "font-src 'self' https://unpkg.com;",
          "connect-src 'self' http://localhost:3000 https://unpkg.com;",
          "img-src 'self' http://localhost:3000/uploads/ blob: data:;",
          "worker-src 'self' blob: data:;",
          "child-src 'self' blob: data:;"
        ].join(' ')
      }
    });
  });

  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Uncomment to open DevTools by default
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
// IPC Handlers
ipcMain.handle('create-exam', ipcAsyncHandler(async (event, data) => {
  console.log('Create exam data received in IPC handler:', data);
  
  if (!data.userData || !data.userData.userId) {
      throw new Error('User not authenticated');
  }

  try {
      const result = await examController.createExam({
          body: {
              title: data.title,
              questions: data.questions,
              status: data.status,
              classId: data.classId, // Ensure classId is passed through
              userData: data.userData
          },
          user: {
              userId: data.userData.userId,
              role: data.userData.role
          }
      });

      console.log('Exam creation result:', {
          id: result._id,
          title: result.title,
          classId: result.class?._id,
          status: result.status
      });

      // Ensure the result is serializable
      return JSON.parse(JSON.stringify(result));
  } catch (error) {
      console.error('Create exam error in IPC handler:', error);
      throw error;
  }
}));



ipcMain.handle('publish-exam', ipcAsyncHandler(async (event, data) => {
  console.log('Publishing exam:', data);
  
  if (!data.userData || !data.userData.userId) {
      throw new Error('User not authenticated');
  }

  try {
      const result = await examController.publishExam({
          body: {
              examId: data.examId,
              userData: data.userData
          }
      });

      return JSON.parse(JSON.stringify(result));
  } catch (error) {
      console.error('Publish exam error:', error);
      throw error;
  }
}));

// Helper function to get user info
async function getUserFromEvent(event) {
  // Get the stored user data from the sender
  const userId = event.sender.userId;
  const role = event.sender.role;
  
  if (!userId) {
      console.error('No user ID found in event sender');
      return null;
  }

  return { userId, role };
}

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



ipcMain.handle('get-exam-stats', ipcAsyncHandler(async (event, data) => {
  // Ensure we have userData
  if (!data?.userData) {
    throw new ErrorResponse('User data is required', 401);
  }

  return await examController.getStats({
    user: {
      userId: data.userData.userId,
      role: data.userData.role
    }
  });
}));

ipcMain.handle('get-recent-exams', ipcAsyncHandler(async (event, data) => {
  // Ensure we have userData
  if (!data?.userData) {
    throw new ErrorResponse('User data is required', 401);
  }

  return await examController.getRecentExams({
    user: {
      userId: data.userData.userId,
      role: data.userData.role
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