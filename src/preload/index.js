const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  loadWorkspaces: () => ipcRenderer.invoke('load-workspaces'),
  saveWorkspaces: (data) => ipcRenderer.send('save-workspaces', data),
  startWorkspace: (workspace) => ipcRenderer.send('start-workspace', workspace),

  pickFile: () => ipcRenderer.invoke('pick-file'),
  pickFileOrFolder: () => ipcRenderer.invoke('pick-file-or-folder')
})

contextBridge.exposeInMainWorld('utils', {
  platform: process.platform,
  log: (msg) => console.log('[Renderer]:', msg)

// ---- App Blocker API ----
contextBridge.exposeInMainWorld('appBlocker', {
  list:    () => ipcRenderer.invoke('appblock:list'),
  add:     (name) => ipcRenderer.invoke('appblock:add', name),
  remove:  (name) => ipcRenderer.invoke('appblock:remove', name),
  pause:   () => ipcRenderer.invoke('appblock:pause'),
  resume:  () => ipcRenderer.invoke('appblock:resume'),
  clear:   () => ipcRenderer.invoke('appblock:clear'),
})

// ---- General Electron API ----
contextBridge.exposeInMainWorld('electronAPI', {
  // Old "openApp" from your vanilla project
  openApp: (appPath) => ipcRenderer.send('open-app', appPath),

  // Workspace-related APIs
  loadWorkspaces: () => {
    console.log('Loading workspaces...')
    return ipcRenderer.invoke('load-workspaces')
  },

  saveWorkspaces: (data) => {
    console.log('Saving workspaces:', data.length)
    return ipcRenderer.send('save-workspaces', data)
  },

  startWorkspace: (workspace) => {
    console.log('Starting workspace:', workspace.name)
    return ipcRenderer.send('start-workspace', workspace)
  },

  pickFile: () => {
    console.log('Opening file picker...')
    return ipcRenderer.invoke('pick-file')
  }
})

// ---- Utilities ----
contextBridge.exposeInMainWorld('utils', {
  platform: process.platform,
  log: (message) => {
    console.log('[Renderer]:', message)
  }
})
