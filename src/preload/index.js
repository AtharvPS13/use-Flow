const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Workspaces
  loadWorkspaces: () => ipcRenderer.invoke('load-workspaces'),
  saveWorkspaces: (data) => ipcRenderer.send('save-workspaces', data),
  startWorkspace: (ws) => ipcRenderer.send('start-workspace', ws),
  stopWorkspace: (ws) => ipcRenderer.send('stop-workspace', ws),


  // File/folder picking
  pickFile: () => ipcRenderer.invoke('pick-file'),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),

  // App blocking
  addBlockedAction: (id, app) =>
    ipcRenderer.send('appblock:add-workspace', { workspaceId: id, appName: app }),
  removeBlockedAction: (id, app) =>
    ipcRenderer.send('appblock:remove-workspace', { workspaceId: id, appName: app }),
  syncBlockedActions: (apps) => ipcRenderer.invoke('syncBlockedActions', apps),

  // 🚀 New: open any app by name (e.g., "firefox", "code", "gedit")
  openApp: (appName) => ipcRenderer.send('open-app', appName),
})