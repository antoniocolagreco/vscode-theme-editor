import Color from "color"
import type { HTMLAttributes } from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onChange?: (value: [number, number, number, number]) => void
}

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const [localValue, setLocalValue] = useState(value || defaultValue)
  const timeoutRef = useRef<number | undefined>(undefined)

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setLocalValue(value)
    }
  }, [value])

  const handleColorChange = (hexValue: string) => {
    setLocalValue(hexValue)

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
        const color = Color(hexValue)
        const [r, g, b] = color.rgb().array()
        const alpha = color.alpha()
        onChange([r, g, b, alpha])
      } catch (error) {
        console.error("Invalid color value:", error)
      }
    }, 300)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className='flex items-center gap-2'>
        <input
          className='h-12 w-12 cursor-pointer rounded border-2 border-slate-200 dark:border-slate-700'
          onChange={e => handleColorChange(e.target.value)}
          type='color'
          value={localValue}
        />
        <Input
          className='flex-1'
          onChange={e => handleColorChange(e.target.value)}
          type='text'
          value={localValue}
        />
      </div>
    </div>
  )
}
