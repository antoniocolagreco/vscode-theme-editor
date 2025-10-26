const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("node:path")
const fs = require("node:fs").promises

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173")
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
