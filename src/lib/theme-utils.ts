import type { ColorStyle } from "@/types/color-style"
import type { VSCodeTheme } from "@/types/vs-code-theme"

/**
 * Extracts all unique colors from a theme and creates ColorStyle entries
 */
export function extractColorsFromTheme(theme: Partial<VSCodeTheme>): Map<string, ColorStyle> {
  const colorMap = new Map<string, ColorStyle>()
  let colorIndex = 1

  function addColor(colorValue: string): ColorStyle {
    // Check if color already exists
    for (const [_key, colorStyle] of colorMap) {
      if (colorStyle.value === colorValue) {
        return colorStyle
      }
    }

    // Create new color style
    const colorStyle: ColorStyle = {
      name: `Color ${colorIndex}`,
      value: colorValue,
      scopes: new Set(),
    }
    colorMap.set(colorStyle.name, colorStyle)
    colorIndex++
    return colorStyle
  }

  function processColorValue(value: string | ColorStyle | undefined): void {
    if (!value) {
      return
    }
    if (typeof value === "string") {
      addColor(value)
    } else {
      colorMap.set(value.name, value)
    }
  }

  // Extract from UI colors
  if (theme.colors) {
    for (const [_scope, uiColor] of theme.colors) {
      if (typeof uiColor === "string") {
        addColor(uiColor)
      } else if (uiColor.colorStyle) {
        colorMap.set(uiColor.colorStyle.name, uiColor.colorStyle)
      }
    }
  }

  // Extract from token colors
  if (theme.tokenColors) {
    for (const [_scope, tokenColor] of theme.tokenColors) {
      processColorValue(tokenColor.foreground)
      processColorValue(tokenColor.background)
    }
  }

  // Extract from semantic token colors
  if (theme.semanticTokenColors) {
    for (const [_scope, semanticColor] of theme.semanticTokenColors) {
      processColorValue(semanticColor.foreground)
    }
  }

  return colorMap
}

/**
 * Gets default foreground color based on theme type
 */
export function getDefaultForeground(themeType?: "dark" | "light" | "hc"): string {
  return themeType === "light" ? "#000000" : "#ffffff"
}

/**
 * Gets default background color based on theme type
 */
export function getDefaultBackground(themeType?: "dark" | "light" | "hc"): string {
  return themeType === "light" ? "#ffffff" : "#000000"
}
