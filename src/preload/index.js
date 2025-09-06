const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadWorkspaces: () => ipcRenderer.invoke('load-workspaces'),
  saveWorkspaces: (data) => ipcRenderer.send('save-workspaces', data),
  pickFile: () => ipcRenderer.invoke('pick-file'),
  startWorkspace: (workspace) => ipcRenderer.send('start-workspace', workspace),

  // App-blocker APIs
  addBlockedAction: (workspaceId, appName) => ipcRenderer.send('appblock:add-workspace', { workspaceId, appName }),
  removeBlockedAction: (workspaceId, appName) => ipcRenderer.send('appblock:remove-workspace', { workspaceId, appName }),
  listBlockedActions: () => ipcRenderer.invoke('appblock:list'),
});
