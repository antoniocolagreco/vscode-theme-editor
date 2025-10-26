import { clsx } from "clsx"

interface ColorCircleProps {
  color: string
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  title?: string
  className?: string
  ariaLabel?: string
}

export function ColorCircle({
  color,
  size = "md",
  onClick,
  title,
  className,
  ariaLabel,
}: ColorCircleProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const isValidHex = /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)
  const displayColor = isValidHex ? color : "#e5e7eb"

  if (onClick) {
    return (
      <button
        type='button'
        className={clsx(
          "rounded-full border-2 border-gray-300 transition-all duration-200 cursor-pointer hover:border-gray-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400",
          sizes[size],
          className
        )}
        style={{ backgroundColor: displayColor }}
        onClick={onClick}
        title={title || color}
        aria-label={ariaLabel || title || color}
      />
    )
  }

  return (
    <div
      className={clsx(
        "rounded-full border-2 border-gray-300 transition-all duration-200",
        sizes[size],
        className
      )}
      style={{ backgroundColor: displayColor }}
      title={title || color}
    />
  )
}
