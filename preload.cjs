const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  toggleMiniMode: (isMini) => ipcRenderer.send('toggle-mini-mode', isMini),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  onMiniDockState: (handler) => {
    const listener = (_event, state) => handler(state);
    ipcRenderer.on('mini-dock-state', listener);
    return () => ipcRenderer.removeListener('mini-dock-state', listener);
  },
  requestMiniDockExpand: () => ipcRenderer.send('mini-dock-expand'),
  requestMiniDockCollapse: () => ipcRenderer.send('mini-dock-collapse'),
  requestMiniDockUndock: () => ipcRenderer.send('mini-dock-undock')
});
