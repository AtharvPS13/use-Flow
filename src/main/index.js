const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { exec } = require('child_process')
const path = require('path')
const blocker = require("../../src/main/appblocker.js");
const fs = require('fs')

const dataPath = path.join(app.getPath('userData'), 'workspaces.json')
console.log('Workspaces stored at:', dataPath)

//LIST OF BLOCKED APPS
const BLOCKED_APPS = [
    'firefox',
    'spotify',
    'discord'
];

async function syncBlocklistWithDaemon() {
  try {
    console.log("Connecting to app-blocker daemon to sync list...");
    // This is the only part that can fail if the service isn't running.
    await blocker.clear(); 
    console.log("Connected! Cleared existing daemon blocklist.");

    // If we connected, proceed to add the apps.
    for (const appName of BLOCKED_APPS) {
      await blocker.add(appName);
      console.log(`Added "${appName}" to daemon blocklist.`);
    }

    const finalList = await blocker.list();
    console.log("Sync complete. Current daemon blocklist:", finalList);
    return true; // Indicate success

  } catch (err) {
    // This block runs if we failed to connect.
    console.error("Failed to connect to app-blocker daemon.", err.message);
    dialog.showErrorBox(
        "Background Service Not Running",
        "Could not connect to the app-blocker service.\n\nPlease run the following command in your terminal:\n\nsudo systemctl start app-blocker.service"
    );
    return false; // Indicate failure
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
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  })

  win.once('ready-to-show', () => win.show())

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)
//Interacts with app.jsx
ipcMain.handle('appblock:list', async () => await blocker.list());
ipcMain.handle('appblock:add',  async (e, name) => await blocker.add(name));
ipcMain.handle('appblock:remove', async (e, name) => await blocker.remove(name));
ipcMain.handle('appblock:pause', async () => await blocker.pause());
ipcMain.handle('appblock:resume', async () => await blocker.resume());
ipcMain.handle('appblock:clear', async () => await blocker.clear());

// REPLACE your old app.whenReady() block with this (APP EVENT HANDLERS NEW)
app.whenReady().then(async () => {
    // Try to connect and sync.
    const success = await syncBlocklistWithDaemon();

    // Only open the app window if the background service is running.
    if (success) {
        createWindow();
    } else {
        // If the service isn't running, quit the app after showing the error.
        app.quit();
    }
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Save workspaces
ipcMain.on('save-workspaces', (_, data) => {
  try {
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    console.log('Workspaces saved:', data.length)
  } catch (error) {
    console.error('Error saving workspaces:', error)
  }
})

// Load workspaces
ipcMain.handle('load-workspaces', () => {
  try {
    if (!fs.existsSync(dataPath)) return []
    const raw = fs.readFileSync(dataPath, 'utf8')
    const workspaces = JSON.parse(raw)
    console.log('Workspaces loaded:', workspaces.length)
    return workspaces
  } catch (error) {
    console.error('Error loading workspaces:', error)
    return []
  }
})

// Pick a single file (VS Code)
ipcMain.handle('pick-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// Pick file or folder (generic)
ipcMain.handle('pick-file-or-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// Start workspace
ipcMain.on('start-workspace', (_, workspace) => {
  console.log('Starting workspace:', workspace.name)

  workspace.actions.forEach((action, index) => {
    setTimeout(() => {
      try {
        if (action.type === 'chrome') {
          const command =
            process.platform === 'win32'
              ? `start chrome "${action.value}"`
              : process.platform === 'darwin'
              ? `open -a "Google Chrome" "${action.value}"`
              : `google-chrome "${action.value}"`
          exec(command, (error) => {
            if (error) console.error('Chrome error:', error)
            else console.log('Opened Chrome:', action.value)
          })
        } else if (action.type === 'vscode') {
          exec(`code "${action.value}"`, (error) => {
            if (error) console.error('VS Code error:', error)
            else console.log('Opened VS Code:', action.value)
          })
        } else if (action.type === 'terminal') {
          const command =
            process.platform === 'win32'
              ? `start cmd /K "${action.value}"`
              : process.platform === 'darwin'
              ? `osascript -e 'tell application "Terminal" to do script "${action.value}"'`
              : `gnome-terminal -- bash -c "${action.value}; exec bash"`
          exec(command, (error) => {
            if (error) console.error('Terminal error:', error)
            else console.log('Opened terminal with command:', action.value)
          })
        } else if (action.type === 'file') {
          // Open file or folder using default app
          const command =
            process.platform === 'win32'
              ? `start "" "${action.value}"`
              : process.platform === 'darwin'
              ? `open "${action.value}"`
              : `xdg-open "${action.value}"`
          exec(command, (error) => {
            if (error) console.error('Open file/folder error:', error)
            else console.log('Opened file/folder:', action.value)
          })
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error)
      }
    }, index * 500)
  })
})

// ADD THIS NEW SECTION
// This clears the blocklist on exit, which is good practice.
app.on('will-quit', async () => {
  try {
    console.log("App is quitting. Clearing the daemon's blocklist...");
    await blocker.clear();
    console.log("Daemon blocklist has been cleared.");
  } catch (err) {
    // Ignore errors here, as the daemon might already be stopped.
  }
});