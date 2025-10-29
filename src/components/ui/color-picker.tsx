import Color from "color"
import type { HTMLAttributes } from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

const DEFAULT_VALUE = "#000000ff"

export const ColorPicker = ({
  value,
  defaultValue = DEFAULT_VALUE,
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const [hexColor, setHexColor] = useState(DEFAULT_VALUE)
  const [alpha, setAlpha] = useState(1)
  const timeoutRef = useRef<number | undefined>(undefined)

  // Sync with external value changes and extract alpha
  useEffect(() => {
    if (value) {
      try {
        const valueWithTransparency = value.length === 7 ? `${value}ff` : value
        const color = Color(valueWithTransparency)
        const hex = color.hex()
        setHexColor(hex)
        setAlpha(color.alpha())
      } catch {
        setHexColor(DEFAULT_VALUE)
        setAlpha(1)
      }
    }
  }, [value])

  const notifyChange = (hex: string, alphaValue: number) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the onChange callback
    timeoutRef.current = setTimeout(() => {
      if (!onChange) {
        return
      }

      try {
        const color = Color(hex).alpha(alphaValue)
        // Return hex8 format (#RRGGBBAA) for transparency, hex6 (#RRGGBB) for opaque
        const hexValue = alphaValue < 1 ? color.hexa() : color.hex()
        onChange(hexValue)
      } catch (error) {
        console.error("Invalid color value:", error)
      }
    }, 300)
  }

  const handleColorChange = (newHex: string) => {
    setHexColor(newHex)
    notifyChange(newHex, alpha)
  }

  const handleAlphaChange = (newAlpha: number) => {
    setAlpha(newAlpha)
    notifyChange(hexColor, newAlpha)
  }

  const handleTextInput = (inputValue: string) => {
    try {
      const color = Color(inputValue)
      const hex = color.hex()
      const newAlpha = color.alpha()
      setHexColor(hex)
      setAlpha(newAlpha)
      notifyChange(hex, newAlpha)
    } catch {
      // Invalid color, just update the display but don't notify
      setHexColor(inputValue)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Display value: always show hex format (8 digits if alpha < 1)
  const displayValue = alpha < 1 ? Color(hexColor).alpha(alpha).hexa() : hexColor

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className='flex items-center gap-2'>
        <div className='relative h-12 w-12 shrink-0'>
          {/* Checkered background for transparency preview */}
          <div
            className='absolute inset-0 rounded border-2 border-slate-200 dark:border-slate-700'
            style={{
              backgroundImage:
                "repeating-conic-gradient(#80808040 0% 25%, transparent 0% 50%) 50% / 8px 8px",
            }}
          />
          {/* Color preview with alpha */}
          <button
            type='button'
            className='absolute inset-0 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer'
            style={{ backgroundColor: displayValue }}
            onClick={() => document.getElementById("color-picker-input")?.click()}
            aria-label='Open color picker'
          />
          {/* Hidden native color picker */}
          <input
            id='color-picker-input'
            className='absolute inset-0 opacity-0 cursor-pointer'
            onChange={e => handleColorChange(e.target.value)}
            type='color'
            value={hexColor}
          />
        </div>
        <Input
          className='flex-1'
          onChange={e => handleTextInput(e.target.value)}
          type='text'
          value={displayValue}
        />
      </div>
      <div className='flex items-center gap-2'>
        <label htmlFor='alpha-slider' className='text-sm font-medium min-w-16'>
          Opacity
        </label>
        <input
          id='alpha-slider'
          type='range'
          min='0'
          max='100'
          value={Math.round(alpha * 100)}
          onChange={e => handleAlphaChange(Number.parseInt(e.target.value, 10) / 100)}
          className='flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer'
        />
        <span className='text-sm text-muted-foreground min-w-12 text-right'>
          {Math.round(alpha * 100)}%
        </span>
      </div>
    </div>
  )
}
