const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const dataPath = path.join(app.getPath('userData'), 'workspaces.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);

ipcMain.on('save-workspaces', (_, data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
});

ipcMain.handle('load-workspaces', () => {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath);
  return JSON.parse(raw);
});

ipcMain.handle('pick-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.on('start-workspace', (_, workspace) => {
  workspace.actions.forEach((a) => {
    if (a.type === 'chrome') {
      exec(`start chrome "${a.value}"`);
    } else if (a.type === 'vscode') {
      exec(`code "${a.value}"`);
    } else if (a.type === 'terminal') {
      exec(`start cmd /K "${a.value}"`);
    }
  });
});
