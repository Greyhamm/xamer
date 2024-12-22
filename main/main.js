// main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const examRoutes = require('../backend/routes/examRoutes');
const codeExecutionRoutes = require('../backend/routes/codeExecutionRoutes');
const mediaRoutes = require('../backend/routes/media');

// Initialize Express App
const expressApp = express();
const EXPRESS_PORT = process.env.PORT || 3000;

// Middleware
expressApp.use(cors());
expressApp.use(bodyParser.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/electron_exam_app'; // Replace with your MongoDB URI
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Exam Routes
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
    // Prevent the default close behavior to handle cleanup
    event.preventDefault();

    // Quit the app, which will trigger the 'before-quit' event
    app.quit();
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
