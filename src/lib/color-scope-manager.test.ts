import { beforeEach, describe, expect, it } from "vitest"
import type { ColorStyle } from "@/types"
import {
  getScopesForColor,
  removeColorReference,
  updateColorReference,
} from "./color-scope-manager"

describe("color-scope-manager", () => {
  describe("updateColorReference", () => {
    let oldColor: ColorStyle
    let newColor: ColorStyle

    beforeEach(() => {
      oldColor = {
        name: "oldColor",
        value: "#ff0000",
        scopes: new Set(["editor.background", "editor.foreground"]),
      }
      newColor = {
        name: "newColor",
        value: "#00ff00",
        scopes: new Set(["panel.background"]),
      }
    })

    it("should add scope to new color when old color is undefined", () => {
      const scope = "editor.lineHighlightBackground"

      updateColorReference(undefined, newColor, scope)

      expect(newColor.scopes.has(scope)).toBe(true)
      expect(newColor.scopes.size).toBe(2)
    })

    it("should add scope to new color and remove from old color", () => {
      const scope = "editor.background"

      expect(oldColor.scopes.has(scope)).toBe(true)
      expect(newColor.scopes.has(scope)).toBe(false)

      updateColorReference(oldColor, newColor, scope)

      expect(oldColor.scopes.has(scope)).toBe(false)
      expect(newColor.scopes.has(scope)).toBe(true)
      expect(oldColor.scopes.size).toBe(1)
      expect(newColor.scopes.size).toBe(2)
    })

    it("should not remove scope from old color when old and new are the same", () => {
      const scope = "editor.background"
      const initialSize = oldColor.scopes.size

      updateColorReference(oldColor, oldColor, scope)

      expect(oldColor.scopes.has(scope)).toBe(true)
      expect(oldColor.scopes.size).toBe(initialSize)
    })

    it("should handle adding new scope not previously in either color", () => {
      const scope = "statusBar.background"

      expect(oldColor.scopes.has(scope)).toBe(false)
      expect(newColor.scopes.has(scope)).toBe(false)

      updateColorReference(oldColor, newColor, scope)

      expect(oldColor.scopes.has(scope)).toBe(false)
      expect(newColor.scopes.has(scope)).toBe(true)
    })

    it("should handle empty scopes in old color", () => {
      const emptyColor: ColorStyle = {
        name: "emptyColor",
        value: "#000000",
        scopes: new Set(),
      }
      const scope = "editor.selectionBackground"

      updateColorReference(emptyColor, newColor, scope)

      expect(emptyColor.scopes.size).toBe(0)
      expect(newColor.scopes.has(scope)).toBe(true)
    })

    it("should handle multiple consecutive updates to same scope", () => {
      const scope = "editor.background"
      const thirdColor: ColorStyle = {
        name: "thirdColor",
        value: "#0000ff",
        scopes: new Set(),
      }

      updateColorReference(oldColor, newColor, scope)
      expect(oldColor.scopes.has(scope)).toBe(false)
      expect(newColor.scopes.has(scope)).toBe(true)

      updateColorReference(newColor, thirdColor, scope)
      expect(newColor.scopes.has(scope)).toBe(false)
      expect(thirdColor.scopes.has(scope)).toBe(true)
    })
  })

  describe("removeColorReference", () => {
    let colorStyle: ColorStyle

    beforeEach(() => {
      colorStyle = {
        name: "testColor",
        value: "#ff0000",
        scopes: new Set(["editor.background", "editor.foreground", "panel.background"]),
      }
    })

    it("should remove scope from color style", () => {
      const scope = "editor.background"

      expect(colorStyle.scopes.has(scope)).toBe(true)
      expect(colorStyle.scopes.size).toBe(3)

      removeColorReference(colorStyle, scope)

      expect(colorStyle.scopes.has(scope)).toBe(false)
      expect(colorStyle.scopes.size).toBe(2)
    })

    it("should handle removing non-existent scope", () => {
      const scope = "nonExistent.scope"
      const initialSize = colorStyle.scopes.size

      removeColorReference(colorStyle, scope)

      expect(colorStyle.scopes.size).toBe(initialSize)
    })

    it("should handle undefined color style", () => {
      expect(() => removeColorReference(undefined, "editor.background")).not.toThrow()
    })

    it("should handle removing all scopes one by one", () => {
      const scopes = Array.from(colorStyle.scopes)

      scopes.forEach(scope => {
        removeColorReference(colorStyle, scope)
      })

      expect(colorStyle.scopes.size).toBe(0)
    })

    it("should handle empty scopes set", () => {
      const emptyColor: ColorStyle = {
        name: "emptyColor",
        value: "#000000",
        scopes: new Set(),
      }

      removeColorReference(emptyColor, "editor.background")

      expect(emptyColor.scopes.size).toBe(0)
    })
  })

  describe("getScopesForColor", () => {
    it("should return array of scopes from color style", () => {
      const colorStyle: ColorStyle = {
        name: "testColor",
        value: "#ff0000",
        scopes: new Set(["editor.background", "editor.foreground", "panel.background"]),
      }

      const result = getScopesForColor(colorStyle)

      expect(result).toBeInstanceOf(Array)
      expect(result).toHaveLength(3)
      expect(result).toContain("editor.background")
      expect(result).toContain("editor.foreground")
      expect(result).toContain("panel.background")
    })

    it("should return empty array for empty scopes", () => {
      const colorStyle: ColorStyle = {
        name: "emptyColor",
        value: "#000000",
        scopes: new Set(),
      }

      const result = getScopesForColor(colorStyle)

      expect(result).toBeInstanceOf(Array)
      expect(result).toHaveLength(0)
    })

    it("should return new array instance each time", () => {
      const colorStyle: ColorStyle = {
        name: "testColor",
        value: "#ff0000",
        scopes: new Set(["editor.background"]),
      }

      const result1 = getScopesForColor(colorStyle)
      const result2 = getScopesForColor(colorStyle)

      expect(result1).not.toBe(result2)
      expect(result1).toEqual(result2)
    })

    it("should handle single scope", () => {
      const colorStyle: ColorStyle = {
        name: "singleScope",
        value: "#123456",
        scopes: new Set(["editor.lineHighlightBackground"]),
      }

      const result = getScopesForColor(colorStyle)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe("editor.lineHighlightBackground")
    })

    it("should preserve scope values without modification", () => {
      const specialScopes = ["comment (fg)", "string.quoted (fg)", "keyword.control (fg)"]
      const colorStyle: ColorStyle = {
        name: "tokenColor",
        value: "#abcdef",
        scopes: new Set(specialScopes),
      }

      const result = getScopesForColor(colorStyle)

      expect(result).toHaveLength(specialScopes.length)
      specialScopes.forEach(scope => {
        expect(result).toContain(scope)
      })
    })
  })

  describe("integration scenarios", () => {
    it("should handle complete color reassignment workflow", () => {
      const color1: ColorStyle = {
        name: "primary",
        value: "#ff0000",
        scopes: new Set(["editor.background"]),
      }
      const color2: ColorStyle = {
        name: "secondary",
        value: "#00ff00",
        scopes: new Set(),
      }
      const scope = "editor.background"

      // Move scope from color1 to color2
      updateColorReference(color1, color2, scope)

      expect(getScopesForColor(color1)).toHaveLength(0)
      expect(getScopesForColor(color2)).toContain(scope)
    })

    it("should handle adding and removing scopes in sequence", () => {
      const colorStyle: ColorStyle = {
        name: "dynamic",
        value: "#123456",
        scopes: new Set(),
      }

      // Add scope
      updateColorReference(undefined, colorStyle, "scope1")
      expect(getScopesForColor(colorStyle)).toContain("scope1")

      // Add another scope
      updateColorReference(undefined, colorStyle, "scope2")
      expect(getScopesForColor(colorStyle)).toHaveLength(2)

      // Remove first scope
      removeColorReference(colorStyle, "scope1")
      expect(getScopesForColor(colorStyle)).toHaveLength(1)
      expect(getScopesForColor(colorStyle)).toContain("scope2")

      // Remove second scope
      removeColorReference(colorStyle, "scope2")
      expect(getScopesForColor(colorStyle)).toHaveLength(0)
    })

    it("should handle multiple colors sharing and transferring scopes", () => {
      const red: ColorStyle = {
        name: "red",
        value: "#ff0000",
        scopes: new Set(["scope1", "scope2"]),
      }
      const green: ColorStyle = {
        name: "green",
        value: "#00ff00",
        scopes: new Set(["scope3"]),
      }
      const blue: ColorStyle = {
        name: "blue",
        value: "#0000ff",
        scopes: new Set(),
      }

      // Transfer scope1 from red to green
      updateColorReference(red, green, "scope1")
      expect(getScopesForColor(red)).toEqual(["scope2"])
      expect(getScopesForColor(green)).toContain("scope1")
      expect(getScopesForColor(green)).toContain("scope3")

      // Transfer scope3 from green to blue
      updateColorReference(green, blue, "scope3")
      expect(getScopesForColor(green)).toContain("scope1")
      expect(getScopesForColor(green)).not.toContain("scope3")
      expect(getScopesForColor(blue)).toContain("scope3")
    })
  })
})
