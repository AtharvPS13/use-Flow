const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadWorkspaces: () => ipcRenderer.invoke("load-workspaces"),
  saveWorkspaces: (data) => ipcRenderer.send("save-workspaces", data),
  startWorkspace: (workspace) => ipcRenderer.send("start-workspace", workspace),
  pickFile: () => ipcRenderer.invoke("pick-file")   // 👈 new API
});
