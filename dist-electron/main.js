var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function.");
});
var require_main = /* @__PURE__ */ __commonJSMin((() => {
	var { app, BrowserWindow, ipcMain, dialog } = __require("electron");
	var path = __require("node:path");
	var fs = __require("node:fs").promises;
	var mainWindow;
	function isTilingWM() {
		if (process.platform !== "linux") return false;
		const session = process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || "";
		return [
			"hyprland",
			"i3",
			"sway",
			"bspwm",
			"dwm",
			"xmonad"
		].some((wm) => session.toLowerCase().includes(wm));
	}
	function createWindow() {
		mainWindow = new BrowserWindow({
			width: 1280,
			height: 720,
			webPreferences: {
				preload: path.join(__dirname, "preload.cjs"),
				contextIsolation: true,
				nodeIntegration: false
			}
		});
		if (process.env.VITE_DEV_SERVER_URL) {
			mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
			mainWindow.webContents.openDevTools();
		} else {
			const indexPath = path.join(app.getAppPath(), "dist", "index.html");
			mainWindow.loadFile(indexPath);
		}
	}
	app.whenReady().then(createWindow);
	app.on("window-all-closed", () => {
		if (process.platform !== "darwin") app.quit();
	});
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
	ipcMain.handle("saveFile", async (_event, filename, content) => {
		const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, "..", filename);
		await fs.writeFile(filePath, content, "utf-8");
		return filePath;
	});
	ipcMain.handle("loadFile", async (_event, filename) => {
		const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, "..", filename);
		return await fs.readFile(filePath, "utf-8");
	});
	ipcMain.handle("readFile", async (_event, filename) => {
		const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, "..", filename);
		return await fs.readFile(filePath, "utf-8");
	});
	ipcMain.handle("listFiles", async () => {
		const themesDir = path.join(__dirname, "..", "themes");
		return (await fs.readdir(themesDir)).filter((file) => file.endsWith(".json"));
	});
	ipcMain.handle("openFileDialog", async () => {
		const result = await dialog.showOpenDialog(mainWindow, {
			properties: ["openFile"],
			filters: [{
				name: "JSON Files",
				extensions: ["json"]
			}, {
				name: "All Files",
				extensions: ["*"]
			}]
		});
		if (result.canceled || result.filePaths.length === 0) return null;
		const filePath = result.filePaths[0];
		const content = await fs.readFile(filePath, "utf-8");
		return {
			filePath,
			content
		};
	});
	ipcMain.handle("getWindowCapabilities", () => {
		return {
			canMinimize: !isTilingWM() && (mainWindow?.minimizable ?? false),
			canMaximize: !isTilingWM() && (mainWindow?.maximizable ?? false)
		};
	});
	ipcMain.handle("windowMinimize", () => {
		if (mainWindow?.minimizable && !isTilingWM()) mainWindow.minimize();
	});
	ipcMain.handle("windowMaximize", () => {
		if (mainWindow?.maximizable) if (mainWindow.isMaximized()) mainWindow.unmaximize();
		else mainWindow.maximize();
	});
	ipcMain.handle("windowClose", () => {
		if (mainWindow) mainWindow.close();
	});
}));
export default require_main();
