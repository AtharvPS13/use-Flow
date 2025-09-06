const { contextBridge, ipcRenderer } = require('electron');
syncBlockedActions: (apps) => ipcRenderer.invoke('syncBlockedActions', apps),


contextBridge.exposeInMainWorld('electronAPI', {
  loadWorkspaces: () => ipcRenderer.invoke('load-workspaces'),
  saveWorkspaces: (data) => ipcRenderer.send('save-workspaces', data),
  pickFile: () => ipcRenderer.invoke('pick-file'),
  startWorkspace: (ws) => ipcRenderer.send('start-workspace', ws),
  stopWorkspace: (workspaceId) => {
    // Get the blocked apps from the workspace data
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace && workspace.blockedActions) {
      // Send unblock request to main process
      ipcRenderer.send('stop-workspace', workspace.blockedActions);
    }
  },
  addBlockedAction: (id, app) => ipcRenderer.send('appblock:add-workspace', { workspaceId: id, appName: app }),
  removeBlockedAction: (id, app) => ipcRenderer.send('appblock:remove-workspace', { workspaceId: id, appName: app }),
  
  // NEW: sync blocked apps when Start button clicked
  syncBlockedActions: (apps) => ipcRenderer.invoke('syncBlockedActions', apps),
});
