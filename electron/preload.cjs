const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (filename, content) => ipcRenderer.invoke("saveFile", filename, content),
  loadFile: filename => ipcRenderer.invoke("loadFile", filename),
  readFile: filename => ipcRenderer.invoke("readFile", filename),
  listFiles: () => ipcRenderer.invoke("listFiles"),
  openFileDialog: () => ipcRenderer.invoke("openFileDialog"),
  // Window capabilities and controls
  getWindowCapabilities: () => ipcRenderer.invoke("getWindowCapabilities"),
  windowMinimize: () => ipcRenderer.invoke("windowMinimize"),
  windowMaximize: () => ipcRenderer.invoke("windowMaximize"),
  windowClose: () => ipcRenderer.invoke("windowClose"),
})
