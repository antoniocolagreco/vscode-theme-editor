import { describe, expect, it } from "vitest"
import { parseThemeFromJSON } from "./theme-parser"

describe("parseThemeFromJSON", () => {
  it("should parse a minimal theme", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      type: "dark",
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.name).toBe("Test Theme")
    expect(theme.type).toBe("dark")
    expect(theme.$schema).toBe("vscode://schemas/color-theme")
    expect(theme.colors.size).toBe(0)
    expect(theme.tokenColors.size).toBe(0)
    expect(theme.colorStyles?.size || 0).toBe(0)
  })

  it("should parse UI colors and create color styles", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "statusBar.background": "#1e1e1e",
      },
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.colors.size).toBe(3)
    expect(theme.colorStyles?.size || 0).toBe(2) // Only 2 unique colors

    const editorBg = theme.colors.get("editor.background")
    const statusBarBg = theme.colors.get("statusBar.background")

    expect(editorBg?.colorStyle.value).toBe("#1e1e1e")
    expect(statusBarBg?.colorStyle.value).toBe("#1e1e1e")
    // Should reuse the same colorStyle
    expect(editorBg?.colorStyle).toBe(statusBarBg?.colorStyle)
  })

  it("should parse token colors from array format", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      tokenColors: [
        {
          scope: "comment",
          settings: {
            foreground: "#6A9955",
            fontStyle: "italic",
          },
        },
        {
          scope: ["keyword", "storage.type"],
          settings: {
            foreground: "#569CD6",
          },
        },
      ],
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.tokenColors.size).toBe(2)

    const comment = theme.tokenColors.get("comment")
    expect(comment?.foreground?.value).toBe("#6A9955")
    expect(comment?.fontStyle).toBe("italic")

    const keyword = theme.tokenColors.get("keyword, storage.type")
    expect(keyword?.foreground?.value).toBe("#569CD6")
  })

  it("should parse semantic token colors", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      semanticHighlighting: true,
      semanticTokenColors: {
        variable: {
          foreground: "#9CDCFE",
        },
        "function.declaration": {
          foreground: "#DCDCAA",
          fontStyle: "bold",
        },
      },
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.semanticHighlighting).toBe(true)
    expect(theme.semanticTokenColors?.size).toBe(2)

    const variable = theme.semanticTokenColors?.get("variable")
    expect(variable?.foreground?.value).toBe("#9CDCFE")

    const funcDecl = theme.semanticTokenColors?.get("function.declaration")
    expect(funcDecl?.foreground?.value).toBe("#DCDCAA")
    expect(funcDecl?.fontStyle).toBe("bold")
  })

  it("should reuse color styles across all sections", () => {
    const sharedColor = "#FF0000"
    const json = JSON.stringify({
      name: "Test Theme",
      colors: {
        "editor.background": sharedColor,
      },
      tokenColors: [
        {
          scope: "keyword",
          settings: {
            foreground: sharedColor,
          },
        },
      ],
      semanticTokenColors: {
        variable: {
          foreground: sharedColor,
        },
      },
    })

    const theme = parseThemeFromJSON(json)

    // Should have only 1 color style despite being used 3 times
    expect(theme.colorStyles?.size || 0).toBe(1)

    const uiColor = theme.colors.get("editor.background")?.colorStyle
    const tokenColor = theme.tokenColors.get("keyword")?.foreground
    const semanticColor = theme.semanticTokenColors?.get("variable")?.foreground

    expect(uiColor).toBe(tokenColor)
    expect(tokenColor).toBe(semanticColor)
    expect(uiColor?.value).toBe(sharedColor)
  })

  it("should handle missing optional fields", () => {
    const json = JSON.stringify({
      name: "Minimal Theme",
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.$schema).toBe("vscode://schemas/color-theme")
    expect(theme.type).toBe("dark")
    expect(theme.semanticHighlighting).toBe(false)
    expect(theme.semanticTokenColors).toBeUndefined()
  })

  it("should handle token colors without settings", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      tokenColors: [
        {
          scope: "comment",
        },
      ],
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.tokenColors.size).toBe(1)
    const comment = theme.tokenColors.get("comment")
    expect(comment).toBeDefined()
    expect(comment?.foreground).toBeUndefined()
    expect(comment?.background).toBeUndefined()
  })

  it("should throw error for invalid JSON", () => {
    expect(() => parseThemeFromJSON("invalid json")).toThrow()
  })

  it("should handle empty theme object", () => {
    const json = JSON.stringify({})

    const theme = parseThemeFromJSON(json)

    expect(theme.name).toBe("Untitled Theme")
    expect(theme.type).toBe("dark")
    expect(theme.colors.size).toBe(0)
  })

  it("should skip invalid color values", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "italic", // Invalid - not a color
        "statusBar.background": "bold", // Invalid - not a color
      },
      tokenColors: [
        {
          scope: "comment",
          settings: {
            foreground: "#6A9955",
            background: "underline", // Invalid - not a color
          },
        },
        {
          scope: "keyword",
          settings: {
            foreground: "invalid-color", // Invalid
          },
        },
      ],
    })

    const theme = parseThemeFromJSON(json)

    // Should only have 2 valid colors: #1e1e1e and #6A9955
    expect(theme.colorStyles?.size || 0).toBe(2)
    expect(theme.colors.size).toBe(1) // Only editor.background is valid
    expect(theme.tokenColors.size).toBe(2)

    const comment = theme.tokenColors.get("comment")
    expect(comment?.foreground?.value).toBe("#6A9955")
    expect(comment?.background).toBeUndefined() // Invalid color skipped

    const keyword = theme.tokenColors.get("keyword")
    expect(keyword?.foreground).toBeUndefined() // Invalid color skipped
  })

  it("should accept valid color formats", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      colors: {
        hex3: "#fff",
        hex6: "#ffffff",
        hex8: "#ffffffff",
        rgb: "rgb(255, 255, 255)",
        rgba: "rgba(255, 255, 255, 0.5)",
        hsl: "hsl(0, 0%, 100%)",
        hsla: "hsla(0, 0%, 100%, 0.5)",
      },
    })

    const theme = parseThemeFromJSON(json)

    expect(theme.colors.size).toBe(7)
    expect(theme.colorStyles?.size || 0).toBe(7)
  })
})
