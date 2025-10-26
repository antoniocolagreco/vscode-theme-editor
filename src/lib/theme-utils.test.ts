import { describe, expect, it } from "vitest"
import type { VSCodeTheme } from "@/types"
import { extractColorsFromTheme, getDefaultBackground, getDefaultForeground } from "./theme-utils"

describe("extractColorsFromTheme", () => {
  it("should extract colors from UI colors", () => {
    const theme: Partial<VSCodeTheme> = {
      colors: new Map([
        ["editor.background", { colorStyle: { name: "Dark BG", value: "#1e1e1e", scopes: new Set() } }],
        ["editor.foreground", { colorStyle: { name: "Light Text", value: "#d4d4d4", scopes: new Set() } }],
      ]),
    }

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(2)
    expect(colors.get("Dark BG")?.value).toBe("#1e1e1e")
    expect(colors.get("Light Text")?.value).toBe("#d4d4d4")
  })

  it("should extract colors from token colors", () => {
    const theme: Partial<VSCodeTheme> = {
      tokenColors: new Map([
        [
          "comment",
          {
            foreground: { name: "Comment Green", value: "#6A9955", scopes: new Set() },
            background: { name: "Highlight", value: "#2A2A2A", scopes: new Set() },
          },
        ],
      ]),
    }

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(2)
    expect(colors.get("Comment Green")?.value).toBe("#6A9955")
    expect(colors.get("Highlight")?.value).toBe("#2A2A2A")
  })

  it("should extract colors from semantic token colors", () => {
    const theme: Partial<VSCodeTheme> = {
      semanticTokenColors: new Map([
        ["variable", { foreground: { name: "Variable Blue", value: "#9CDCFE", scopes: new Set() } }],
        ["function", { foreground: { name: "Function Yellow", value: "#DCDCAA", scopes: new Set() } }],
      ]),
    }

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(2)
    expect(colors.get("Variable Blue")?.value).toBe("#9CDCFE")
    expect(colors.get("Function Yellow")?.value).toBe("#DCDCAA")
  })

  it("should not create duplicates for same color value", () => {
    const theme: Partial<VSCodeTheme> = {
      colors: new Map([
        ["editor.background", { colorStyle: { name: "Dark", value: "#1e1e1e", scopes: new Set() } }],
        ["sidebar.background", { colorStyle: { name: "Dark", value: "#1e1e1e", scopes: new Set() } }],
      ]),
    }

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(1)
    expect(colors.get("Dark")?.value).toBe("#1e1e1e")
  })

  it("should handle empty theme", () => {
    const theme: Partial<VSCodeTheme> = {}

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(0)
  })

  it("should handle theme with no color styles", () => {
    const theme: Partial<VSCodeTheme> = {
      colors: new Map(),
      tokenColors: new Map(),
      semanticTokenColors: new Map(),
    }

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(0)
  })

  it("should extract colors from all sections combined", () => {
    const theme: Partial<VSCodeTheme> = {
      colors: new Map([["editor.background", { colorStyle: { name: "BG", value: "#1e1e1e", scopes: new Set() } }]]),
      tokenColors: new Map([["comment", { foreground: { name: "Comment", value: "#6A9955", scopes: new Set() } }]]),
      semanticTokenColors: new Map([
        ["variable", { foreground: { name: "Variable", value: "#9CDCFE", scopes: new Set() } }],
      ]),
    }

    const colors = extractColorsFromTheme(theme)

    expect(colors.size).toBe(3)
    expect(Array.from(colors.keys())).toEqual(["BG", "Comment", "Variable"])
  })
})

describe("getDefaultForeground", () => {
  it("should return white for dark themes", () => {
    expect(getDefaultForeground("dark")).toBe("#ffffff")
  })

  it("should return white for high contrast themes", () => {
    expect(getDefaultForeground("hc")).toBe("#ffffff")
  })

  it("should return black for light themes", () => {
    expect(getDefaultForeground("light")).toBe("#000000")
  })

  it("should return white when theme type is undefined", () => {
    expect(getDefaultForeground(undefined)).toBe("#ffffff")
  })
})

describe("getDefaultBackground", () => {
  it("should return black for dark themes", () => {
    expect(getDefaultBackground("dark")).toBe("#000000")
  })

  it("should return black for high contrast themes", () => {
    expect(getDefaultBackground("hc")).toBe("#000000")
  })

  it("should return white for light themes", () => {
    expect(getDefaultBackground("light")).toBe("#ffffff")
  })

  it("should return black when theme type is undefined", () => {
    expect(getDefaultBackground(undefined)).toBe("#000000")
  })
})
