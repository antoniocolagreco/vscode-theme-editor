import type { ReactNode } from "react"
import { createContext, useContext, useState } from "react"
import type { VSCodeTheme } from "@/types/vs-code-theme"

interface ThemeContextValue {
  theme: VSCodeTheme | null
  setTheme: (theme: VSCodeTheme | null) => void
  currentFilePath: string | null
  setCurrentFilePath: (path: string | null) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<VSCodeTheme | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentFilePath, setCurrentFilePath }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
