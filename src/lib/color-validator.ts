/**
 * Validates if a string is a valid color value
 * Accepts: hex (#RGB, #RRGGBB, #RRGGBBAA), rgb(), rgba(), hsl(), hsla()
 */
export function isValidColor(value: string): boolean {
  if (!value || typeof value !== "string") {
    return false
  }

  const trimmed = value.trim()

  // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(trimmed) || /^#([0-9A-Fa-f]{8})$/.test(trimmed)) {
    return true
  }

  // RGB/RGBA colors: rgb(r, g, b) or rgba(r, g, b, a)
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(trimmed)) {
    return true
  }

  // HSL/HSLA colors: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/.test(trimmed)) {
    return true
  }

  return false
}

/**
 * Returns a user-friendly error message for invalid color values
 */
export function getColorValidationMessage(): string {
  return "Invalid color format. Use hex (#RGB, #RRGGBB, #RRGGBBAA), rgb(), rgba(), hsl(), or hsla()"
}
