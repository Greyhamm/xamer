// main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Enable live reload for Electron and the renderer process
try {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  });
} catch (_) {
  console.log('Electron-reload not enabled');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Correct path to preload.js
      nodeIntegration: true, // For simplicity; consider security implications
      contextIsolation: false, // For simplicity; consider security implications
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
