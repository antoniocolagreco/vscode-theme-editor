import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { ColorStyle } from "@/types/color-style"
import type { VSCodeTheme } from "@/types/vs-code-theme"
import { listThemeFiles, loadThemeFromFile, saveThemeToFile } from "./file-service"

// Helper to create ColorStyle objects
function createColorStyle(name: string, value: string, scopes: string[] = []): ColorStyle {
  return {
    name,
    value,
    scopes: new Set(scopes),
  }
}

describe("file-service", () => {
  const mockElectronAPI = {
    readFile: vi.fn(),
    saveFile: vi.fn(),
    loadFile: vi.fn(),
    listFiles: vi.fn(),
    openFileDialog: vi.fn(),
  }

  beforeEach(() => {
    window.electronAPI = mockElectronAPI
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete window.electronAPI
  })

  describe("loadThemeFromFile", () => {
    it("should throw error when Electron API is not available", async () => {
      delete window.electronAPI

      await expect(loadThemeFromFile("theme.json")).rejects.toThrow("Electron API not available")
    })

    it("should load and parse a complete theme file", async () => {
      const primaryColor = {
        name: "primary",
        value: "#ff0000",
        scopes: new Set(["editor.background"]),
      }
      const secondaryColor = { name: "secondary", value: "#00ff00", scopes: new Set() }
      const commentColor = { name: "comment", value: "#888888", scopes: new Set() }
      const variableColor = { name: "variable", value: "#ffffff", scopes: new Set() }

      const mockFileContent = JSON.stringify({
        $schema: "vscode://schemas/color-theme",
        name: "Test Theme",
        type: "dark",
        colorStyles: {
          primary: primaryColor,
          secondary: secondaryColor,
          comment: commentColor,
          variable: variableColor,
        },
        colors: {
          "editor.background": { colorStyle: primaryColor },
        },
        tokenColors: {
          comment: { foreground: commentColor },
        },
        semanticHighlighting: true,
        semanticTokenColors: {
          variable: { foreground: variableColor },
        },
      })

      mockElectronAPI.readFile.mockResolvedValue(mockFileContent)

      const result = await loadThemeFromFile("test-theme.json")

      expect(mockElectronAPI.readFile).toHaveBeenCalledWith("test-theme.json")
      expect(result.$schema).toBe("vscode://schemas/color-theme")
      expect(result.name).toBe("Test Theme")
      expect(result.type).toBe("dark")
      expect(result.colorStyles?.size).toBe(4)
      expect(result.colors.size).toBe(1)
      expect(result.tokenColors.size).toBe(1)
      expect(result.semanticHighlighting).toBe(true)
      expect(result.semanticTokenColors?.size).toBe(1)
    })

    it("should load theme with default values when optional fields are missing", async () => {
      const mockFileContent = JSON.stringify({})

      mockElectronAPI.readFile.mockResolvedValue(mockFileContent)

      const result = await loadThemeFromFile("minimal-theme.json")

      expect(result).toEqual({
        $schema: "vscode://schemas/color-theme",
        name: "Untitled Theme",
        type: "dark",
        colorStyles: new Map(),
        colors: new Map(),
        tokenColors: new Map(),
        semanticHighlighting: undefined,
        semanticTokenColors: undefined,
      })
    })

    it("should load theme without semanticTokenColors when not present", async () => {
      const mockFileContent = JSON.stringify({
        name: "Theme Without Semantic",
        type: "light",
        colorStyles: {},
        colors: {},
        tokenColors: {},
      })

      mockElectronAPI.readFile.mockResolvedValue(mockFileContent)

      const result = await loadThemeFromFile("no-semantic.json")

      expect(result.semanticTokenColors).toBeUndefined()
      expect(result.name).toBe("Theme Without Semantic")
      expect(result.type).toBe("light")
    })

    it("should throw error when file content is invalid JSON", async () => {
      mockElectronAPI.readFile.mockResolvedValue("invalid json {")

      await expect(loadThemeFromFile("invalid.json")).rejects.toThrow()
    })

    it("should handle file read errors", async () => {
      mockElectronAPI.readFile.mockRejectedValue(new Error("File not found"))

      await expect(loadThemeFromFile("missing.json")).rejects.toThrow("File not found")
    })
  })

  describe("saveThemeToFile", () => {
    it("should throw error when Electron API is not available", async () => {
      delete window.electronAPI

      const theme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "Test",
        type: "dark",
        colorStyles: new Map(),
        colors: new Map(),
        tokenColors: new Map(),
      }

      await expect(saveThemeToFile("theme.json", theme)).rejects.toThrow(
        "Electron API not available"
      )
    })

    it("should save a complete theme to file", async () => {
      const primaryColor = createColorStyle("primary", "#ff0000", ["editor.background"])
      const secondaryColor = createColorStyle("secondary", "#00ff00")
      const commentColor = createColorStyle("comment", "#888888")
      const variableColor = createColorStyle("variable", "#ffffff")

      const theme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "Save Test Theme",
        type: "dark",
        colorStyles: new Map([
          ["primary", primaryColor],
          ["secondary", secondaryColor],
          ["comment", commentColor],
          ["variable", variableColor],
        ]),
        colors: new Map([["editor.background", { colorStyle: primaryColor }]]),
        tokenColors: new Map([["comment", { foreground: commentColor }]]),
        semanticHighlighting: true,
        semanticTokenColors: new Map([["variable", { foreground: variableColor }]]),
      }

      mockElectronAPI.saveFile.mockResolvedValue("/path/to/theme.json")

      await saveThemeToFile("theme.json", theme)

      expect(mockElectronAPI.saveFile).toHaveBeenCalledWith("theme.json", expect.any(String))

      const savedContent = mockElectronAPI.saveFile.mock.calls[0][1]
      const parsed = JSON.parse(savedContent)

      expect(parsed.$schema).toBe("vscode://schemas/color-theme")
      expect(parsed.name).toBe("Save Test Theme")
      expect(parsed.type).toBe("dark")
      expect(parsed.semanticHighlighting).toBe(true)
    })

    it("should save theme with empty Maps as empty objects", async () => {
      const theme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "Empty Theme",
        type: "light",
        colorStyles: new Map(),
        colors: new Map(),
        tokenColors: new Map(),
      }

      mockElectronAPI.saveFile.mockResolvedValue("/path/to/empty.json")

      await saveThemeToFile("empty.json", theme)

      const savedContent = mockElectronAPI.saveFile.mock.calls[0][1]
      const parsed = JSON.parse(savedContent)

      expect(parsed.colorStyles).toEqual({})
      expect(parsed.colors).toEqual({})
      expect(parsed.tokenColors).toEqual({})
    })

    it("should save theme without semanticTokenColors when undefined", async () => {
      const theme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "No Semantic Theme",
        type: "dark",
        colorStyles: new Map(),
        colors: new Map(),
        tokenColors: new Map(),
        semanticTokenColors: undefined,
      }

      mockElectronAPI.saveFile.mockResolvedValue("/path/to/theme.json")

      await saveThemeToFile("theme.json", theme)

      const savedContent = mockElectronAPI.saveFile.mock.calls[0][1]
      const parsed = JSON.parse(savedContent)

      expect(parsed.semanticTokenColors).toBeUndefined()
    })

    it("should handle undefined colorStyles gracefully", async () => {
      const theme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "Partial Theme",
        type: "dark",
        colorStyles: new Map(),
        colors: new Map(),
        tokenColors: new Map(),
      }

      mockElectronAPI.saveFile.mockResolvedValue("/path/to/theme.json")

      await saveThemeToFile("theme.json", theme)

      const savedContent = mockElectronAPI.saveFile.mock.calls[0][1]
      const parsed = JSON.parse(savedContent)

      expect(parsed.colorStyles).toEqual({})
    })

    it("should handle file save errors", async () => {
      const theme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "Test",
        type: "dark",
        colorStyles: new Map(),
        colors: new Map(),
        tokenColors: new Map(),
      }

      mockElectronAPI.saveFile.mockRejectedValue(new Error("Disk full"))

      await expect(saveThemeToFile("theme.json", theme)).rejects.toThrow("Disk full")
    })
  })

  describe("listThemeFiles", () => {
    it("should throw error when Electron API is not available", async () => {
      delete window.electronAPI

      await expect(listThemeFiles()).rejects.toThrow("Electron API not available")
    })

    it("should return list of theme files", async () => {
      const mockFiles = ["theme1.json", "theme2.json", "dracula.json"]
      mockElectronAPI.listFiles.mockResolvedValue(mockFiles)

      const result = await listThemeFiles()

      expect(mockElectronAPI.listFiles).toHaveBeenCalled()
      expect(result).toEqual(mockFiles)
    })

    it("should return empty array when no files exist", async () => {
      mockElectronAPI.listFiles.mockResolvedValue([])

      const result = await listThemeFiles()

      expect(result).toEqual([])
    })

    it("should handle file listing errors", async () => {
      mockElectronAPI.listFiles.mockRejectedValue(new Error("Permission denied"))

      await expect(listThemeFiles()).rejects.toThrow("Permission denied")
    })
  })

  describe("integration scenarios", () => {
    it("should successfully round-trip a theme (save and load)", async () => {
      const accentColor = createColorStyle("accent", "#0099ff", ["editor.foreground"])
      const stringColor = createColorStyle("string", "#00ff00")

      const originalTheme: VSCodeTheme = {
        $schema: "vscode://schemas/color-theme",
        name: "Round Trip Theme",
        type: "dark",
        colorStyles: new Map([
          ["accent", accentColor],
          ["string", stringColor],
        ]),
        colors: new Map([["editor.foreground", { colorStyle: accentColor }]]),
        tokenColors: new Map([["string", { foreground: stringColor }]]),
        semanticHighlighting: false,
      }

      let savedContent = ""
      mockElectronAPI.saveFile.mockImplementation((_path, content) => {
        savedContent = content
        return Promise.resolve("/path/to/theme.json")
      })

      await saveThemeToFile("round-trip.json", originalTheme)

      mockElectronAPI.readFile.mockResolvedValue(savedContent)

      const loadedTheme = await loadThemeFromFile("round-trip.json")

      expect(loadedTheme.name).toBe(originalTheme.name)
      expect(loadedTheme.type).toBe(originalTheme.type)
      expect(loadedTheme.semanticHighlighting).toBe(originalTheme.semanticHighlighting)
      expect(loadedTheme.colorStyles?.size).toBe(2)
      expect(loadedTheme.colors.size).toBe(1)
      expect(loadedTheme.tokenColors.size).toBe(1)
    })
  })
})
