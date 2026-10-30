// Electron Preload Script for SEN Desktop
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendToMain: (channel, data) => {
    const validChannels = ['toggle-overlay', 'set-always-on-top'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receiveFromMain: (channel, func) => {
    const validChannels = ['overlay-status', 'open-sen-settings'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
