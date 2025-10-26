# Color Scope Management

## Overview

Each `ColorStyle` object maintains a `scopes` field (a `Set<string>`) that tracks all the locations where that color is used in the theme. This provides O(1) lookup performance and ensures data integrity.

## Automatic Population

The `scopes` field is automatically populated during theme parsing (`theme-parser.ts`):

### UI Colors

Scope format: `"scopeName"`

```typescript
// Example: "editor.background", "activityBar.foreground"
colorStyle.scopes.add(key)
```

### Token Colors

Scope format: `"scopeName (fg)"` or `"scopeName (bg)"`

```typescript
// Example: "comment (fg)", "string (bg)"
foreground.scopes.add(`${scope} (fg)`)
background.scopes.add(`${scope} (bg)`)
```

### Semantic Token Colors

Scope format: `"scopeName (semantic)"`

```typescript
// Example: "variable (semantic)", "function (semantic)"
foreground.scopes.add(`${key} (semantic)`)
```

## Manual Updates (Future Pages)

When implementing pages that allow users to modify color associations (UI colors, token colors, semantic tokens), **you must maintain scope integrity** using the utilities in `color-scope-manager.ts`.

### Updating a Color Reference

```typescript
import { updateColorReference } from "@/lib/color-scope-manager"

// When changing which color is assigned to a scope
function changeEditorBackground(newColorStyle: ColorStyle) {
  const oldColorStyle = theme.colors.get("editor.background")?.colorStyle
  
  // Update the reference
  updateColorReference(oldColorStyle, newColorStyle, "editor.background")
  
  // Update the theme object
  theme.colors.set("editor.background", { colorStyle: newColorStyle })
}
```

### Removing a Color Reference

```typescript
import { removeColorReference } from "@/lib/color-scope-manager"

// When deleting a color association
function deleteTokenColor(scope: string) {
  const tokenColor = theme.tokenColors.get(scope)
  
  if (tokenColor?.foreground) {
    removeColorReference(tokenColor.foreground, `${scope} (fg)`)
  }
  
  if (tokenColor?.background) {
    removeColorReference(tokenColor.background, `${scope} (bg)`)
  }
  
  theme.tokenColors.delete(scope)
}
```

### Getting Scopes for a Color

```typescript
import { getScopesForColor } from "@/lib/color-scope-manager"

// Get all scopes using a specific color
const scopes = getScopesForColor(colorStyle)
// Returns: ["editor.background", "comment (fg)", "variable (semantic)", ...]
```

## Implementation Checklist

When implementing a new page that modifies colors:

- [ ] Import `updateColorReference` from `@/lib/color-scope-manager`
- [ ] Call `updateColorReference(oldColor, newColor, scope)` **before** updating theme objects
- [ ] For deletions, use `removeColorReference(color, scope)`
- [ ] Test that the scopes field stays synchronized
- [ ] Verify tooltips in colors page reflect the changes

## Benefits

1. **Performance**: O(1) scope lookup vs O(n) theme scanning
2. **Data Integrity**: Single source of truth maintained automatically
3. **Developer Experience**: Simple API for maintaining relationships
4. **User Experience**: Instant tooltip updates showing where colors are used

## Example: UI Colors Page (Future Implementation)

```typescript
function UIColorsPage() {
  const { theme, updateTheme } = useTheme()
  
  const handleColorChange = (uiScope: string, newColorStyle: ColorStyle) => {
    // Get the old color reference
    const oldUIColor = theme.colors.get(uiScope)
    
    // Update scope tracking
    updateColorReference(
      oldUIColor?.colorStyle,
      newColorStyle,
      uiScope
    )
    
    // Update theme
    const updatedColors = new Map(theme.colors)
    updatedColors.set(uiScope, { colorStyle: newColorStyle })
    
    updateTheme({ ...theme, colors: updatedColors })
  }
  
  // ... rest of the component
}
```

## Testing

Always verify scope integrity after modifications:

```typescript
// Load theme
const theme = parseThemeFromJSON(jsonContent)

// Verify initial state
const bgColor = theme.colors.get("editor.background")?.colorStyle
expect(bgColor?.scopes.has("editor.background")).toBe(true)

// Modify color
updateColorReference(bgColor, newColor, "editor.background")

// Verify update
expect(bgColor?.scopes.has("editor.background")).toBe(false)
expect(newColor.scopes.has("editor.background")).toBe(true)
```
