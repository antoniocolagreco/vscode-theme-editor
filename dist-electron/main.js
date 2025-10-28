var __commonJSMin = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), __require = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function.");
}), require_main = /* @__PURE__ */ __commonJSMin((() => {
	var { app: e, BrowserWindow: n, ipcMain: r, dialog: i } = __require("electron"), a = __require("node:path"), o = __require("node:fs").promises, s;
	function c() {
		if (process.platform !== "linux") return !1;
		let e = process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || "";
		return [
			"hyprland",
			"i3",
			"sway",
			"bspwm",
			"dwm",
			"xmonad"
		].some((t) => e.toLowerCase().includes(t));
	}
	function l() {
		if (s = new n({
			width: 1280,
			height: 720,
			webPreferences: {
				preload: a.join(__dirname, "preload.cjs"),
				contextIsolation: !0,
				nodeIntegration: !1
			}
		}), process.env.VITE_DEV_SERVER_URL) s.loadURL(process.env.VITE_DEV_SERVER_URL), s.webContents.openDevTools();
		else {
			let t = a.join(e.getAppPath(), "dist", "index.html");
			s.loadFile(t);
		}
	}
	e.whenReady().then(l), e.on("window-all-closed", () => {
		process.platform !== "darwin" && e.quit();
	}), e.on("activate", () => {
		n.getAllWindows().length === 0 && l();
	}), r.handle("saveFile", async (e, t, n) => {
		let r = a.isAbsolute(t) ? t : a.join(__dirname, "..", t);
		return await o.writeFile(r, n, "utf-8"), r;
	}), r.handle("loadFile", async (e, t) => {
		let n = a.isAbsolute(t) ? t : a.join(__dirname, "..", t);
		return await o.readFile(n, "utf-8");
	}), r.handle("readFile", async (e, t) => {
		let n = a.isAbsolute(t) ? t : a.join(__dirname, "..", t);
		return await o.readFile(n, "utf-8");
	}), r.handle("listFiles", async () => {
		let e = a.join(__dirname, "..", "themes");
		return (await o.readdir(e)).filter((e) => e.endsWith(".json"));
	}), r.handle("openFileDialog", async () => {
		let e = await i.showOpenDialog(s, {
			properties: ["openFile"],
			filters: [{
				name: "JSON Files",
				extensions: ["json"]
			}, {
				name: "All Files",
				extensions: ["*"]
			}]
		});
		if (e.canceled || e.filePaths.length === 0) return null;
		let t = e.filePaths[0], n = await o.readFile(t, "utf-8");
		return {
			filePath: t,
			content: n
		};
	}), r.handle("getWindowCapabilities", () => ({
		canMinimize: !c() && (s?.minimizable ?? !1),
		canMaximize: !c() && (s?.maximizable ?? !1)
	})), r.handle("windowMinimize", () => {
		s?.minimizable && !c() && s.minimize();
	}), r.handle("windowMaximize", () => {
		s?.maximizable && (s.isMaximized() ? s.unmaximize() : s.maximize());
	}), r.handle("windowClose", () => {
		s && s.close();
	});
}));
export default require_main();
