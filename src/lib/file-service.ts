import type { VSCodeTheme } from "@/types/vs-code-theme"

export async function loadThemeFromFile(filePath: string): Promise<VSCodeTheme> {
  if (!window.electronAPI) {
    throw new Error("Electron API not available")
  }

  const content = await window.electronAPI.readFile(filePath)
  const parsed = JSON.parse(content)

  // Convert objects to Maps for internal use
  const theme: VSCodeTheme = {
    $schema: parsed.$schema || "vscode://schemas/color-theme",
    name: parsed.name || "Untitled Theme",
    type: parsed.type || "dark",
    colorStyles: new Map(Object.entries(parsed.colorStyles || {})),
    colors: new Map(Object.entries(parsed.colors || {})),
    tokenColors: new Map(Object.entries(parsed.tokenColors || {})),
    semanticHighlighting: parsed.semanticHighlighting,
    semanticTokenColors: parsed.semanticTokenColors
      ? new Map(Object.entries(parsed.semanticTokenColors))
      : undefined,
  }

  return theme
}

export async function saveThemeToFile(filePath: string, theme: VSCodeTheme): Promise<void> {
  if (!window.electronAPI) {
    throw new Error("Electron API not available")
  }

  // Convert Maps to objects for JSON serialization
  const serialized = {
    $schema: theme.$schema,
    name: theme.name,
    type: theme.type,
    colorStyles: Object.fromEntries(theme.colorStyles || new Map()),
    colors: Object.fromEntries(theme.colors),
    tokenColors: Object.fromEntries(theme.tokenColors),
    semanticHighlighting: theme.semanticHighlighting,
    semanticTokenColors: theme.semanticTokenColors
      ? Object.fromEntries(theme.semanticTokenColors)
      : undefined,
  }

  const content = JSON.stringify(serialized, null, 2)
  await window.electronAPI.saveFile(filePath, content)
}

export async function listThemeFiles(): Promise<string[]> {
  if (!window.electronAPI) {
    throw new Error("Electron API not available")
  }

  return await window.electronAPI.listFiles()
}
