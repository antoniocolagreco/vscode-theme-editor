/**
 * Validates if a string is a valid color value
 * Accepts ONLY hex formats: #RGB, #RRGGBB, #RRGGBBAA
 * No rgb(), rgba(), hsl(), or hsla() formats allowed
 */
export function isValidColor(value: string): boolean {
  if (!value || typeof value !== "string") {
    return false
  }

  const trimmed = value.trim()

  // Hex colors only: #RGB, #RRGGBB, #RRGGBBAA
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(trimmed) || /^#([0-9A-Fa-f]{8})$/.test(trimmed)) {
    return true
  }

  return false
}

/**
 * Returns a user-friendly error message for invalid color values
 */
export function getColorValidationMessage(): string {
  return "Invalid color format. Use hex only: #RGB, #RRGGBB, or #RRGGBBAA"
}
