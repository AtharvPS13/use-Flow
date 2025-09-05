const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

const dataPath = path.join(app.getPath('userData'), 'workspaces.json')
console.log('workspaces are being stored at : ', dataPath)

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
    icon: path.join(__dirname, '../assets/icon.png'), // Optional: add an icon
    show: false // Don't show until ready
  })

  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Open DevTools in development
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers
ipcMain.on('save-workspaces', (_, data) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    console.log('Workspaces saved successfully')
  } catch (error) {
    console.error('Error saving workspaces:', error)
  }
})

ipcMain.handle('load-workspaces', () => {
  try {
    if (!fs.existsSync(dataPath)) {
      console.log('No workspaces file found, returning empty array')
      return []
    }
    const raw = fs.readFileSync(dataPath, 'utf8')
    const workspaces = JSON.parse(raw)
    console.log('Workspaces loaded:', workspaces.length)
    return workspaces
  } catch (error) {
    console.error('Error loading workspaces:', error)
    return []
  }
})

ipcMain.handle('pick-file', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
      title: 'Select File or Directory',
      buttonLabel: 'Select'
    })

    if (result.canceled) return null
    console.log('File selected:', result.filePaths[0])
    return result.filePaths[0]
  } catch (error) {
    console.error('Error picking file:', error)
    return null
  }
})

ipcMain.on('start-workspace', (_, workspace) => {
  console.log('Starting workspace:', workspace.name)

  workspace.actions.forEach((action, index) => {
    setTimeout(() => {
      try {
        if (action.type === 'chrome') {
          // Cross-platform Chrome launch
          const command =
            process.platform === 'win32'
              ? `start chrome "${action.value}"`
              : process.platform === 'darwin'
                ? `open -a "Google Chrome" "${action.value}"`
                : `google-chrome "${action.value}"`

          exec(command, (error) => {
            if (error) console.error('Chrome launch error:', error)
            else console.log('Opened Chrome tab:', action.value)
          })
        } else if (action.type === 'vscode') {
          // VS Code launch
          exec(`code "${action.value}"`, (error) => {
            if (error) console.error('VS Code launch error:', error)
            else console.log('Opened VS Code:', action.value)
          })
        } else if (action.type === 'terminal') {
          // Cross-platform terminal launch
          const command =
            process.platform === 'win32'
              ? `start cmd /K "${action.value}"`
              : process.platform === 'darwin'
                ? `osascript -e 'tell application "Terminal" to do script "${action.value}"'`
                : `gnome-terminal -- bash -c "${action.value}; exec bash"`

          exec(command, (error) => {
            if (error) console.error('Terminal launch error:', error)
            else console.log('Opened terminal with command:', action.value)
          })
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error)
      }
    }, index * 500) // Stagger launches by 500ms
  })
})
