const { contextBridge, ipcRenderer } = require('electron');
syncBlockedActions: (apps) => ipcRenderer.invoke('syncBlockedActions', apps),


contextBridge.exposeInMainWorld('electronAPI', {
  loadWorkspaces: () => ipcRenderer.invoke('load-workspaces'),
  saveWorkspaces: (data) => ipcRenderer.send('save-workspaces', data),
  pickFile: () => ipcRenderer.invoke('pick-file'),
  startWorkspace: (ws) => ipcRenderer.send('start-workspace', ws),
  addBlockedAction: (id, app) => ipcRenderer.send('appblock:add-workspace', { workspaceId: id, appName: app }),
  removeBlockedAction: (id, app) => ipcRenderer.send('appblock:remove-workspace', { workspaceId: id, appName: app }),
  
  // NEW: sync blocked apps when Start button clicked
  syncBlockedActions: (apps) => ipcRenderer.invoke('syncBlockedActions', apps),
});
