import type { ColorStyle } from "./color-style"
import type { FontStyle } from "./font-style"

export interface SemanticTokenColor {
  foreground?: ColorStyle
  fontStyle?: FontStyle
}
