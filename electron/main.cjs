const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("node:path")
const fs = require("node:fs").promises

let mainWindow

// Detect if running on a tiling window manager (Hyprland, i3, sway, etc.)
function isTilingWM() {
  if (process.platform !== "linux") {
    return false
  }
  const session = process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || ""
  const tilingWMs = ["hyprland", "i3", "sway", "bspwm", "dwm", "xmonad"]
  return tilingWMs.some(wm => session.toLowerCase().includes(wm))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Remove menu bar completely (File, Edit, View, etc.)
  mainWindow.removeMenu()

  // vite-plugin-electron injects VITE_DEV_SERVER_URL in dev mode
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // In production, use app.getAppPath() to get the correct base path
    const indexPath = path.join(app.getAppPath(), "dist", "index.html")
    mainWindow.loadFile(indexPath)
  }
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers
ipcMain.handle("saveFile", async (_event, filename, content) => {
  // Use absolute path if provided, otherwise resolve relative to project root
  const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, "..", filename)
  await fs.writeFile(filePath, content, "utf-8")
  return filePath
})

ipcMain.handle("loadFile", async (_event, filename) => {
  // Use absolute path if provided, otherwise resolve relative to project root
  const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, "..", filename)
  const content = await fs.readFile(filePath, "utf-8")
  return content
})

ipcMain.handle("readFile", async (_event, filename) => {
  // Use absolute path if provided, otherwise resolve relative to project root
  const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, "..", filename)
  const content = await fs.readFile(filePath, "utf-8")
  return content
})

ipcMain.handle("listFiles", async () => {
  const themesDir = path.join(__dirname, "..", "themes")
  const files = await fs.readdir(themesDir)
  return files.filter(file => file.endsWith(".json"))
})

ipcMain.handle("openFileDialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "JSON Files", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const content = await fs.readFile(filePath, "utf-8")
  return { filePath, content }
})

// Check window manager capabilities
ipcMain.handle("getWindowCapabilities", () => {
  return {
    canMinimize: !isTilingWM() && (mainWindow?.minimizable ?? false),
    canMaximize: !isTilingWM() && (mainWindow?.maximizable ?? false),
  }
})

// Window controls
ipcMain.handle("windowMinimize", () => {
  if (mainWindow?.minimizable && !isTilingWM()) {
    mainWindow.minimize()
  }
})

ipcMain.handle("windowMaximize", () => {
  if (mainWindow?.maximizable) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle("windowClose", () => {
  if (mainWindow) {
    mainWindow.close()
  }
})
