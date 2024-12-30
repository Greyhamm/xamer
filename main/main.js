const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('../backend/config/database');

class MainProcess {
  constructor() {
    this.mainWindow = null;
    this.expressApp = express();
    this.setupExpress();
    this.setupDatabase();
  }

  setupExpress() {
    // Middleware
    this.expressApp.use(cors());
    this.expressApp.use(express.json());
    
    // Serve renderer static files first
    this.expressApp.use('/renderer', express.static(path.join(__dirname, '..', 'renderer')));

    // Serve uploads
    this.expressApp.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    // Serve other static files
    // Removed serving the parent directory to prevent MIME type issues
    // this.expressApp.use(express.static(path.join(__dirname, '..')));
    
    const port = process.env.PORT || 3000;
    this.server = this.expressApp.listen(port, () => {
        console.log(`Express server running on port ${port}`);
    });
  }

  async setupDatabase() {
    try {
      await connectDB();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true
      }
    });

    // In development, use a local file path
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
      // Enable DevTools
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    }
  }

  init() {
    app.whenReady().then(() => {
      this.createWindow();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', (event) => {
      if (this.server) {
        event.preventDefault();
        this.server.close(() => {
          console.log('Express server closed');
          process.exit(0);
        });
      }
    });
  }
}

const mainProcess = new MainProcess();
mainProcess.init();