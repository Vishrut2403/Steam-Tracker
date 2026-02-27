const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  mainWindow.loadFile(
    path.join(__dirname, '../frontend/dist/index.html')
  );

  mainWindow.on('closed', () => {
    if (backendProcess) {
      backendProcess.kill();
    }
    mainWindow = null;
  });
}

app.whenReady().then(() => {

  backendProcess = spawn(
    'node',
    [path.join(__dirname, '../backend/dist/server.js')],
    { stdio: 'inherit' }
  );

  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});