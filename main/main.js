// main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const examRoutes = require('../backend/routes/examRoutes');
const codeExecutionRoutes = require('../backend/routes/codeExecutionRoutes');

// Enable live reload for Electron and the renderer process
try {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  });
} catch (_) {
  console.log('Electron-reload not enabled');
}

// Initialize Express App
const expressApp = express();
const EXPRESS_PORT = 3000;

// Middleware
expressApp.use(cors());
expressApp.use(bodyParser.json());

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/electron_exam_app'; // Replace with your MongoDB URI
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Exam Routes
expressApp.use('/api', examRoutes);
expressApp.use('/api', codeExecutionRoutes);

// Start Express Server
expressApp.listen(EXPRESS_PORT, () => {
  console.log(`Express server running on http://localhost:${EXPRESS_PORT}`);
});

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
}

app.whenReady().then(() => {
  createWindow();

  // macOS specific behavior
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
