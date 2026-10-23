const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "kurent",
  Object.freeze({
    desktop: true,
    exit: () => ipcRenderer.invoke("kurent:exit"),
    toggleFullscreen: () => ipcRenderer.invoke("kurent:fullscreen"),
  }),
);
