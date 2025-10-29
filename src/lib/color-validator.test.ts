import { describe, expect, it } from "vitest"
import { getColorValidationMessage, isValidColor } from "./color-validator"

describe("color-validator", () => {
  describe("isValidColor", () => {
    it("should accept hex3 format (#RGB)", () => {
      expect(isValidColor("#fff")).toBe(true)
      expect(isValidColor("#000")).toBe(true)
      expect(isValidColor("#a1b")).toBe(true)
      expect(isValidColor("#FFF")).toBe(true)
    })

    it("should accept hex6 format (#RRGGBB)", () => {
      expect(isValidColor("#ffffff")).toBe(true)
      expect(isValidColor("#000000")).toBe(true)
      expect(isValidColor("#a1b2c3")).toBe(true)
      expect(isValidColor("#FFFFFF")).toBe(true)
    })

    it("should accept hex8 format (#RRGGBBAA)", () => {
      expect(isValidColor("#ffffffff")).toBe(true)
      expect(isValidColor("#00000000")).toBe(true)
      expect(isValidColor("#a1b2c3d4")).toBe(true)
      expect(isValidColor("#FFFFFFFF")).toBe(true)
      expect(isValidColor("#ffffff80")).toBe(true)
    })

    it("should reject rgba format", () => {
      expect(isValidColor("rgba(255, 255, 255, 0.5)")).toBe(false)
      expect(isValidColor("rgba(0, 0, 0, 1)")).toBe(false)
    })

    it("should reject rgb format", () => {
      expect(isValidColor("rgb(255, 255, 255)")).toBe(false)
      expect(isValidColor("rgb(0, 0, 0)")).toBe(false)
    })

    it("should reject hsl format", () => {
      expect(isValidColor("hsl(0, 0%, 100%)")).toBe(false)
      expect(isValidColor("hsl(180, 50%, 50%)")).toBe(false)
    })

    it("should reject hsla format", () => {
      expect(isValidColor("hsla(0, 0%, 100%, 0.5)")).toBe(false)
      expect(isValidColor("hsla(180, 50%, 50%, 1)")).toBe(false)
    })

    it("should reject invalid hex formats", () => {
      expect(isValidColor("#ff")).toBe(false) // too short
      expect(isValidColor("#fffff")).toBe(false) // 5 chars
      expect(isValidColor("#fffffff")).toBe(false) // 7 chars
      expect(isValidColor("ffffff")).toBe(false) // missing #
      expect(isValidColor("#gggggg")).toBe(false) // invalid chars
    })

    it("should reject empty or invalid inputs", () => {
      expect(isValidColor("")).toBe(false)
      expect(isValidColor("   ")).toBe(false)
      expect(isValidColor("red")).toBe(false)
      expect(isValidColor("transparent")).toBe(false)
    })

    it("should handle whitespace", () => {
      expect(isValidColor("  #ffffff  ")).toBe(true)
      expect(isValidColor("\t#fff\n")).toBe(true)
    })
  })

  describe("getColorValidationMessage", () => {
    it("should return hex-only error message", () => {
      const message = getColorValidationMessage()
      expect(message).toContain("hex")
      expect(message).toContain("#RGB")
      expect(message).toContain("#RRGGBB")
      expect(message).toContain("#RRGGBBAA")
      expect(message).not.toContain("rgba")
      expect(message).not.toContain("rgb")
      expect(message).not.toContain("hsl")
    })
  })
})
