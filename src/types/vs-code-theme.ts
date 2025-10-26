import type { ColorStyle } from "./color-style"
import type { SemanticTokenColor } from "./semantic-token-color"
import type { ThemeType } from "./theme-type"
import type { TokenColor } from "./token-color"
import type { UIColor } from "./ui-color"

export interface VSCodeTheme {
  $schema: string
  name: string
  type?: ThemeType
  colorStyles?: Map<string, ColorStyle>
  colors: Map<string, UIColor>
  tokenColors: Map<string, TokenColor>
  semanticHighlighting?: boolean
  semanticTokenColors?: Map<string, SemanticTokenColor>
}
