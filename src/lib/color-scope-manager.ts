import type { ColorStyle } from "@/types"

/**
 * Updates a color reference while maintaining scope integrity.
 *
 * This function ensures that the scopes Set in ColorStyle objects
 * stays synchronized when color associations are modified in the UI.
 *
 * @param oldColorStyle - The previous ColorStyle (if any)
 * @param newColorStyle - The new ColorStyle to assign
 * @param scope - The scope identifier (e.g., "editor.background", "comment (fg)")
 *
 * @example
 * // When changing editor.background from one color to another
 * updateColorReference(oldColor, newColor, "editor.background")
 *
 * @example
 * // When assigning a color for the first time
 * updateColorReference(undefined, newColor, "editor.foreground")
 */
export function updateColorReference(
  oldColorStyle: ColorStyle | undefined,
  newColorStyle: ColorStyle,
  scope: string
): void {
  // Remove scope from old color if it exists
  if (oldColorStyle && oldColorStyle !== newColorStyle) {
    oldColorStyle.scopes.delete(scope)
  }

  // Add scope to new color
  newColorStyle.scopes.add(scope)
}

/**
 * Removes a scope reference from a ColorStyle.
 *
 * Use this when deleting a color association or cleaning up references.
 *
 * @param colorStyle - The ColorStyle to remove the scope from
 * @param scope - The scope identifier to remove
 *
 * @example
 * // When removing a token color
 * removeColorReference(colorStyle, "comment (fg)")
 */
export function removeColorReference(colorStyle: ColorStyle | undefined, scope: string): void {
  if (colorStyle) {
    colorStyle.scopes.delete(scope)
  }
}

/**
 * Gets all scopes using a specific color.
 *
 * This is optimized to use the pre-computed scopes Set instead of
 * scanning the entire theme structure.
 *
 * @param colorStyle - The ColorStyle to get scopes for
 * @returns Array of scope identifiers using this color
 */
export function getScopesForColor(colorStyle: ColorStyle): string[] {
  return Array.from(colorStyle.scopes)
}
