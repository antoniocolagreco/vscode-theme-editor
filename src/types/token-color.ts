import type { ColorStyle } from "./color-style"
import type { FontStyle } from "./font-style"

export interface TokenColor {
  foreground?: ColorStyle
  background?: ColorStyle
  fontStyle?: FontStyle
}
