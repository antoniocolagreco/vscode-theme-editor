import type { ColorStyle, SemanticTokenColor, TokenColor, UIColor, VSCodeTheme } from "@/types"

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
): ColorStyle {
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
        colors.set(key, { colorStyle })
      }
    }
  }

  return colors
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
    const tokenColorObj: TokenColor = {}

    if (settings.foreground) {
      tokenColorObj.foreground = findOrCreateColorStyle(colorStyles, settings.foreground)
    }

    if (settings.background) {
      tokenColorObj.background = findOrCreateColorStyle(colorStyles, settings.background)
    }

    if (settings.fontStyle) {
      tokenColorObj.fontStyle = settings.fontStyle as never
    }

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
    if (typeof value === "object" && value !== null) {
      const semanticToken: SemanticTokenColor = {}

      if (typeof value.foreground === "string") {
        semanticToken.foreground = findOrCreateColorStyle(colorStyles, value.foreground)
      }

      if (typeof value.fontStyle === "string") {
        semanticToken.fontStyle = value.fontStyle as never
      }

      semanticTokenColors.set(key, semanticToken)
    }
  }

  return semanticTokenColors
}

export function parseThemeFromJSON(jsonContent: string): VSCodeTheme {
  const parsed: ParsedTheme = JSON.parse(jsonContent)

  // Extract all unique colors first and sort them by value
  const allColors = new Set<string>()

  if (parsed.colors) {
    Object.values(parsed.colors).forEach(color => {
      if (typeof color === "string") {
        allColors.add(color)
      }
    })
  }

  if (parsed.tokenColors) {
    parsed.tokenColors.forEach(token => {
      if (token.settings?.foreground) {
        allColors.add(token.settings.foreground)
      }
      if (token.settings?.background) {
        allColors.add(token.settings.background)
      }
    })
  }

  if (parsed.semanticTokenColors) {
    Object.values(parsed.semanticTokenColors).forEach(settings => {
      if (typeof settings === "object") {
        Object.values(settings).forEach(value => {
          if (typeof value === "string") {
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
