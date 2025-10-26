import type { ColorStyle, SemanticTokenColor, TokenColor, UIColor, VSCodeTheme } from "@/types"
import { isValidColor } from "./color-validator"

interface ParsedTheme {
  $schema?: string
  name?: string
  type?: "dark" | "light" | "hc"
  colors?: Record<string, string>
  tokenColors?: Array<{
    scope?: string | string[]
    settings?: {
      foreground?: string
      background?: string
      fontStyle?: string
    }
  }>
  semanticHighlighting?: boolean
  semanticTokenColors?: Record<string, Record<string, string>>
}

function findOrCreateColorStyle(
  colorStyles: Map<string, ColorStyle>,
  colorValue: string
): ColorStyle | null {
  // Validate color before processing
  if (!isValidColor(colorValue)) {
    console.warn(`Invalid color value skipped: "${colorValue}"`)
    return null
  }

  const existing = Array.from(colorStyles.values()).find(cs => cs.value === colorValue)
  if (existing) {
    return existing
  }

  const newStyle: ColorStyle = {
    name: `Color ${colorStyles.size + 1}`,
    value: colorValue,
  }
  colorStyles.set(newStyle.name, newStyle)
  return newStyle
}

function parseUIColors(
  parsed: ParsedTheme,
  colorStyles: Map<string, ColorStyle>
): Map<string, UIColor> {
  const colors = new Map<string, UIColor>()

  if (parsed.colors && typeof parsed.colors === "object") {
    for (const [key, value] of Object.entries(parsed.colors)) {
      if (typeof value === "string") {
        const colorStyle = findOrCreateColorStyle(colorStyles, value)
        if (colorStyle) {
          colors.set(key, { colorStyle })
        }
      }
    }
  }

  return colors
}

function createTokenColorObject(
  settings: { foreground?: string; background?: string; fontStyle?: string },
  colorStyles: Map<string, ColorStyle>
): TokenColor {
  const tokenColorObj: TokenColor = {}

  // Parse foreground color
  if (settings.foreground) {
    const foreground = findOrCreateColorStyle(colorStyles, settings.foreground)
    if (foreground) {
      tokenColorObj.foreground = foreground
    }
  }

  // Parse background color
  if (settings.background) {
    const background = findOrCreateColorStyle(colorStyles, settings.background)
    if (background) {
      tokenColorObj.background = background
    }
  }

  // Parse font style
  if (settings.fontStyle) {
    tokenColorObj.fontStyle = settings.fontStyle as never
  }

  return tokenColorObj
}

function parseTokenColors(
  parsed: ParsedTheme,
  colorStyles: Map<string, ColorStyle>
): Map<string, TokenColor> {
  const tokenColors = new Map<string, TokenColor>()

  if (!Array.isArray(parsed.tokenColors)) {
    return tokenColors
  }

  for (const tokenColor of parsed.tokenColors) {
    const scope = Array.isArray(tokenColor.scope)
      ? tokenColor.scope.join(", ")
      : tokenColor.scope || "default"

    const settings = tokenColor.settings || {}
    const tokenColorObj = createTokenColorObject(settings, colorStyles)

    tokenColors.set(scope, tokenColorObj)
  }

  return tokenColors
}

function parseSemanticTokenColors(
  parsed: ParsedTheme,
  colorStyles: Map<string, ColorStyle>
): Map<string, SemanticTokenColor> | undefined {
  if (!parsed.semanticTokenColors || typeof parsed.semanticTokenColors !== "object") {
    return undefined
  }

  const semanticTokenColors = new Map<string, SemanticTokenColor>()

  for (const [key, value] of Object.entries(parsed.semanticTokenColors)) {
    if (typeof value !== "object" || value === null) {
      continue
    }

    const semanticToken: SemanticTokenColor = {}

    // Parse foreground color
    if (typeof value.foreground === "string") {
      const foreground = findOrCreateColorStyle(colorStyles, value.foreground)
      if (foreground) {
        semanticToken.foreground = foreground
      }
    }

    // Parse font style
    if (typeof value.fontStyle === "string") {
      semanticToken.fontStyle = value.fontStyle as never
    }

    semanticTokenColors.set(key, semanticToken)
  }

  return semanticTokenColors
}

export function parseThemeFromJSON(jsonContent: string): VSCodeTheme {
  const parsed: ParsedTheme = JSON.parse(jsonContent)

  // Extract all unique VALID colors first and sort them by value
  const allColors = new Set<string>()

  if (parsed.colors) {
    Object.values(parsed.colors).forEach(color => {
      if (typeof color === "string" && isValidColor(color)) {
        allColors.add(color)
      }
    })
  }

  if (parsed.tokenColors) {
    parsed.tokenColors.forEach(token => {
      if (token.settings?.foreground && isValidColor(token.settings.foreground)) {
        allColors.add(token.settings.foreground)
      }
      if (token.settings?.background && isValidColor(token.settings.background)) {
        allColors.add(token.settings.background)
      }
    })
  }

  if (parsed.semanticTokenColors) {
    Object.values(parsed.semanticTokenColors).forEach(settings => {
      if (typeof settings === "object") {
        Object.values(settings).forEach(value => {
          if (typeof value === "string" && isValidColor(value)) {
            allColors.add(value)
          }
        })
      }
    })
  }

  // Sort colors by value and create ColorStyles with sequential names
  const colorStyles = new Map<string, ColorStyle>()
  const sortedColors = Array.from(allColors).sort((a, b) => a.localeCompare(b))
  sortedColors.forEach((color, index) => {
    const colorStyle: ColorStyle = {
      name: `Color ${index + 1}`,
      value: color,
    }
    colorStyles.set(colorStyle.name, colorStyle)
  })

  // Parse each section
  const colors = parseUIColors(parsed, colorStyles)
  const tokenColors = parseTokenColors(parsed, colorStyles)
  const semanticTokenColors = parseSemanticTokenColors(parsed, colorStyles)

  return {
    $schema: parsed.$schema || "vscode://schemas/color-theme",
    name: parsed.name || "Untitled Theme",
    type: parsed.type || "dark",
    colorStyles,
    colors,
    tokenColors,
    semanticHighlighting: parsed.semanticHighlighting || false,
    semanticTokenColors,
  }
}
