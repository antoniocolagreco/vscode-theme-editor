import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

export function UIThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system' enableSystem>
      {children}
    </NextThemesProvider>
  )
}
