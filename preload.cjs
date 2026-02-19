const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  toggleMiniMode: (isMini) => ipcRenderer.send('toggle-mini-mode', isMini),
  windowControl: (action) => ipcRenderer.send('window-control', action)
});
