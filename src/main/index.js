// const { app, BrowserWindow, ipcMain, dialog } = require('electron');
// const { exec } = require('child_process');
// const path = require('path');
// const fs = require('fs');
// const blocker = require('../../src/main/appblocker.js');

// const dataPath = path.join(app.getPath('userData'), 'workspaces.json');

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     minWidth: 800,
//     minHeight: 600,
//     webPreferences: {
//       preload: path.join(__dirname, '../preload/index.js'),
//       nodeIntegration: false,
//       contextIsolation: true
//     },
//     icon: path.join(__dirname, '../assets/icon.png'),
//     show: false
//   });

//   win.once('ready-to-show', () => win.show());

//   if (process.env.VITE_DEV_SERVER_URL) {
//     win.loadURL(process.env.VITE_DEV_SERVER_URL);
//     win.webContents.openDevTools();
//   } else {
//     win.loadFile(path.join(__dirname, '../renderer/index.html'));
//   }
// }

// // App events
// app.whenReady().then(() => {
//   createWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// // Workspaces
// ipcMain.on('save-workspaces', (_, data) => {
//   try {
//     const dir = path.dirname(dataPath);
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
//   } catch (err) {
//     console.error('Error saving workspaces:', err);
//   }
// });

// ipcMain.handle('load-workspaces', () => {
//   try {
//     if (!fs.existsSync(dataPath)) return [];
//     const raw = fs.readFileSync(dataPath, 'utf8');
//     return JSON.parse(raw).map(w => ({ ...w, blockedActions: w.blockedActions || [] }));
//   } catch (err) {
//     console.error('Error loading workspaces:', err);
//     return [];
//   }
// });

// ipcMain.handle('pick-file', async () => {
//   const result = await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] });
//   if (result.canceled) return null;
//   return result.filePaths[0];
// });

// ipcMain.on('start-workspace', (_, workspace) => {
//   workspace.actions.forEach((action, index) => {
//     setTimeout(() => {
//       try {
//         let command = '';
//         if (action.type === 'chrome') {
//           command = process.platform === 'win32'
//             ? `start chrome "${action.value}"`
//             : process.platform === 'darwin'
//               ? `open -a "Google Chrome" "${action.value}"`
//               : `google-chrome "${action.value}"`;
//         } else if (action.type === 'vscode') {
//           command = `code "${action.value}"`;
//         } else if (action.type === 'terminal') {
//           command = process.platform === 'win32'
//             ? `start cmd /K "${action.value}"`
//             : process.platform === 'darwin'
//               ? `osascript -e 'tell application "Terminal" to do script "${action.value}"'`
//               : `gnome-terminal -- bash -c "${action.value}; exec bash"`;
//         }
//         exec(command, (err) => {
//           if (err) console.error(`${action.type} launch error:`, err);
//         });
//       } catch (err) {
//         console.error(`Error executing action ${action.type}:`, err);
//       }
//     }, index * 500);
//   });
// });

// ipcMain.handle('syncBlockedActions', async (_, blockedApps) => {
//   try {
//     // Try to sync the blocked apps
//     await blocker.clear();
//     for (const appName of blockedApps) {
//       await blocker.add(appName);
//     }
//     const finalList = await blocker.list();
//     console.log('Blocked apps synced:', finalList);
//     return true;
//   } catch (err) {
//     dialog.showErrorBox(
//       "Background Service Not Running",
//       "Could not connect to the app-blocker service.\n\nPlease run:`\n\nsudo systemctl start app-blocker.service"
//     );
//     return false;
//   }
// });

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const blocker = require('../../src/main/appblocker.js');

const dataPath = path.join(app.getPath('userData'), 'workspaces.json');
const BLOCKED_APPS = require('../../src/main/apps.json');

async function unblockAllApps() {
  try {
    const blockedApps = await blocker.list();  // Get the list of currently blocked apps
    for (const appName of blockedApps) {
      await blocker.remove(appName);  // Unblock each app
    }
    console.log('All blocked apps have been unblocked.');
  } catch (err) {
    console.error('Error unblocking apps:', err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  win.once('ready-to-show', () => win.show());

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// App events
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Workspaces
ipcMain.on('save-workspaces', (_, data) => {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving workspaces:', err);
  }
});

ipcMain.handle('load-workspaces', () => {
  try {
    if (!fs.existsSync(dataPath)) return [];
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw).map(w => ({ ...w, blockedActions: w.blockedActions || [] }));
  } catch (err) {
    console.error('Error loading workspaces:', err);
    return [];
  }
});

ipcMain.handle('pick-file', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Starting a workspace
ipcMain.on('start-workspace', (_, workspace) => {
  workspace.actions.forEach((action, index) => {
    setTimeout(() => {
      try {
        let command = '';
        if (action.type === 'chrome') {
          command = process.platform === 'win32'
            ? `start chrome "${action.value}"`
            : process.platform === 'darwin'
              ? `open -a "Google Chrome" "${action.value}"`
              : `google-chrome "${action.value}"`;
        } else if (action.type === 'vscode') {
          command = `code "${action.value}"`;
        } else if (action.type === 'terminal') {
          command = process.platform === 'win32'
            ? `start cmd /K "${action.value}"`
            : process.platform === 'darwin'
              ? `osascript -e 'tell application "Terminal" to do script "${action.value}"'`
              : `gnome-terminal -- bash -c "${action.value}; exec bash"`;
        }
        exec(command, (err) => {
          if (err) console.error(`${action.type} launch error:`, err);
        });
      } catch (err) {
        console.error(`Error executing action ${action.type}:`, err);
      }
    }, index * 500);
  });

  // Sync blocked apps
  if (workspace.blockedActions?.length > 0) {
    ipcMain.handle('syncBlockedActions', async (_, blockedApps) => {
      try {
        await blocker.clear();
        for (const appName of blockedApps) {
          await blocker.add(appName);
        }
        const finalList = await blocker.list();
        console.log('Daemon blocklist synced:', finalList);
        return true;
      } catch (err) {
        dialog.showErrorBox(
          "Background Service Not Running",
          "Could not connect to the app-blocker service.\n\nPlease run:\n\nsudo systemctl start app-blocker.service"
        );
        return false;
      }
    });
    ipcMain.invoke('syncBlockedActions', workspace.blockedActions);
  }
});

// Unblock all apps on quit
app.on('will-quit', async () => {
  try {
    await unblockAllApps();
  } catch (err) {
    console.error('Error unblocking apps during quit:', err);
  }
});