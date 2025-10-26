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

// Helper function to sort entries by specificity (more specific first)
function sortBySpecificity<T>(entries: Array<[string, T]>): Array<[string, T]> {
  return entries.sort(([keyA], [keyB]) => {
    const depthA = (keyA.match(/\./g) || []).length
    const depthB = (keyB.match(/\./g) || []).length
    if (depthA !== depthB) {
      return depthB - depthA
    }
    return keyA.localeCompare(keyB)
  })
}

// Convert colors Map to VS Code format: { scope: colorValue }
function serializeColors(colors: Map<string, import("@/types").UIColor>): Record<string, string> {
  const result: Record<string, string> = {}
  const sorted = sortBySpecificity(Array.from(colors))
  for (const [scope, uiColor] of sorted) {
    result[scope] = uiColor.colorStyle.value
  }
  return result
}

// Convert tokenColors Map to VS Code format: array of { name, scope, settings }
function serializeTokenColors(tokenColors: Map<string, import("@/types").TokenColor>): Array<{
  name: string
  scope: string | string[]
  settings: {
    foreground?: string
    background?: string
    fontStyle?: string
  }
}> {
  const result: Array<{
    name: string
    scope: string | string[]
    settings: {
      foreground?: string
      background?: string
      fontStyle?: string
    }
  }> = []

  const sorted = sortBySpecificity(Array.from(tokenColors))
  for (const [scope, tokenColor] of sorted) {
    const settings: {
      foreground?: string
      background?: string
      fontStyle?: string
    } = {}

    if (tokenColor.foreground) {
      settings.foreground = tokenColor.foreground.value
    }
    if (tokenColor.background) {
      settings.background = tokenColor.background.value
    }
    if (tokenColor.fontStyle) {
      settings.fontStyle = tokenColor.fontStyle
    }

    result.push({
      name: "",
      scope: scope,
      settings,
    })
  }

  return result
}

// Convert semanticTokenColors Map to VS Code format: { scope: { foreground?, fontStyle? } }
function serializeSemanticTokenColors(
  semanticTokenColors: Map<string, import("@/types").SemanticTokenColor> | undefined
):
  | Record<
      string,
      {
        foreground?: string
        fontStyle?: string
      }
    >
  | undefined {
  if (!semanticTokenColors) {
    return undefined
  }

  const result: Record<
    string,
    {
      foreground?: string
      fontStyle?: string
    }
  > = {}

  const sorted = sortBySpecificity(Array.from(semanticTokenColors))
  for (const [scope, semanticToken] of sorted) {
    const settings: {
      foreground?: string
      fontStyle?: string
    } = {}

    if (semanticToken.foreground) {
      settings.foreground = semanticToken.foreground.value
    }
    if (semanticToken.fontStyle) {
      settings.fontStyle = semanticToken.fontStyle
    }

    result[scope] = settings
  }

  return result
}

export async function saveThemeToFile(filePath: string, theme: VSCodeTheme): Promise<void> {
  if (!window.electronAPI) {
    throw new Error("Electron API not available")
  }

  const colors = serializeColors(theme.colors)
  const tokenColors = serializeTokenColors(theme.tokenColors)
  const semanticTokenColors = serializeSemanticTokenColors(theme.semanticTokenColors)

  // Serialize colorStyles (custom field for our editor)
  const colorStyles: Record<string, { name: string; value: string }> = {}
  if (theme.colorStyles) {
    const sorted = sortBySpecificity(Array.from(theme.colorStyles))
    for (const [key, colorStyle] of sorted) {
      colorStyles[key] = {
        name: colorStyle.name,
        value: colorStyle.value,
      }
    }
  }

  // Build final VS Code theme format with custom colorStyles field
  const serialized = {
    $schema: theme.$schema,
    name: theme.name,
    type: theme.type,
    colorStyles, // Custom field for our editor
    colors,
    tokenColors,
    semanticHighlighting: theme.semanticHighlighting,
    ...(semanticTokenColors && { semanticTokenColors }),
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
