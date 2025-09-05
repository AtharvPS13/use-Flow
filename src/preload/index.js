const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Load workspaces from JSON file
  loadWorkspaces: () => {
    console.log('Loading workspaces...')
    return ipcRenderer.invoke('load-workspaces')
  },

  // Save workspaces to JSON file
  saveWorkspaces: (data) => {
    console.log('Saving workspaces:', data.length)
    return ipcRenderer.send('save-workspaces', data)
  },

  // Start a workspace (launch all its actions)
  startWorkspace: (workspace) => {
    console.log('Starting workspace:', workspace.name)
    return ipcRenderer.send('start-workspace', workspace)
  },

  // Pick a file or directory using native dialog
  pickFile: () => {
    console.log('Opening file picker...')
    return ipcRenderer.invoke('pick-file')
  }
})

// Optional: Add some utility functions
contextBridge.exposeInMainWorld('utils', {
  // Get platform info
  platform: process.platform,

  // Log function for debugging
  log: (message) => {
    console.log('[Renderer]:', message)
  }
})
