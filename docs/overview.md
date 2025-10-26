# VS Code Theme Editor - AI Copilot Instructions

## Project Overview

Desktop app (Electron + React) for editing VS Code theme JSON files. Architecture: React UI ↔ ThemeContext ↔ theme-parser ↔ file-service ↔ Electron IPC ↔ filesystem.

**Key principle**: Colors are first-class objects with scope tracking for O(1) lookup and automatic data integrity.

## Business Logic (How It Works)

### The Problem We Solve

VS Code themes have hundreds of color scopes (e.g., `editor.background`, `comment (fg)`, `variable (semantic)`), but many scopes reuse the same color values. Without deduplication:

- Users edit "red" in 50 places instead of 1
- Data becomes inconsistent (duplicate color values)
- Hard to track "where is this color used?"

### The Solution: ColorStyle Palette

1. **Extract unique colors** when loading a theme → store in `colorStyles` Map
2. **Reference, don't duplicate** → each scope points to a ColorStyle, not a raw color value
3. **Track usage** → ColorStyle.scopes Set stores `["editor.background", "comment (fg)", "variable (semantic)"]`
4. **Update once** → editing a ColorStyle automatically updates all 50 scopes using it

### Theme Lifecycle

```text
┌─────────────┐
│ Load Theme  │ (user clicks Load Theme button)
└──────┬──────┘
       │
       ├─→ Electron reads JSON file
       ├─→ theme-parser.ts:
       │   - Parses VS Code format (colors object, tokenColors array)
       │   - Extracts unique colors into colorStyles Map
       │   - Populates scope tracking: colorStyle.scopes.add("editor.background")
       │   - Returns VSCodeTheme with all Maps populated
       │
       └─→ ThemeContext.setTheme() stores in memory
           ↓
    ┌─────────────────────┐
    │   User Edits Theme  │ (all pages share same theme via context)
    └─────────┬───────────┘
              │
              ├─→ UI Colors Page: user adds "editor.foreground" with color "red"
              │   - Calls updateColorReference(oldColor, newColor, "editor.foreground")
              │   - oldColor.scopes.delete("editor.foreground")
              │   - newColor.scopes.add("editor.foreground")
              │   - Updates theme.colors Map
              │
              ├─→ Token Colors Page: user assigns "red" to "comment (fg)"
              │   - Calls updateColorReference(oldColor, newColor, "comment (fg)")
              │   - Updates theme.tokenColors Map
              │
              └─→ Colors Palette Page: user edits "red" value to "#ff0000"
                  - Updates colorStyle.value
                  - ALL scopes using that color instantly reflect the change
                      (no manual sync needed - they share the same object reference)
                  ↓
              ┌──────────────┐
              │  Save Theme  │ (user clicks Save button)
              └────────┬─────┘
                       │
                       ├─→ file-service.ts:
                       │   - Converts Maps to VS Code format:
                       │     * colors: {scope: colorValue}
                       │     * tokenColors: [{scope, settings}]
                       │     * semanticTokenColors: {scope: {foreground, fontStyle}}
                       │   - Sorts by specificity (more specific first)
                       │   - Includes custom colorStyles field
                       │
                       ├─→ JSON.stringify with formatting
                       ├─→ Electron IPC saveFile handler
                       └─→ Written to filesystem

Next time user loads theme:
  colorStyles are restored from custom field
  ↓
  Scope tracking is re-established
  ↓
  Cycle repeats
```

### Key Data Transformations

**On Load (VS Code JSON → Internal):**

```json
VS Code Format:
{
  "colors": {"editor.background": "#1e1e1e"}
  "tokenColors": [{"scope": "comment", "settings": {"foreground": "#6a9955"}}]
}
       ↓↓↓
Internal:
{
  colorStyles: Map{"red": ColorStyle{name:"red", value:"#1e1e1e", scopes:Set["editor.background"]}}
  colors: Map{"editor.background": UIColor{colorStyle: ColorStyle{name:"red"...}}}
  tokenColors: Map{"comment": TokenColor{foreground: ColorStyle{name:"green"...}}}
}
```

**On Save (Internal → VS Code JSON):**

```json
Internal Maps
       ↓
file-service.ts: serializeColors(), serializeTokenColors()
       ↓
{
  "colors": {"editor.background": "#1e1e1e"},
  "tokenColors": [{"scope": "comment", "settings": {"foreground": "#6a9955"}}],
  "colorStyles": {"red": {"name": "red", "value": "#1e1e1e"}}  ← custom field
}
```

### Why This Matters

- **User edits "red" color value** → All 50 scopes update instantly (same object reference)
- **User deletes a scope** → ColorStyle.scopes is updated automatically (scope tracking)
- **User adds new scope** → Existing ColorStyles can be reused (no color duplication)
- **VS Code compatibility** → Saved JSON is 100% valid (can use with VS Code directly)
- **Data integrity** → Can't accidentally create orphaned colors or broken references

### Data Model

- **VSCodeTheme** (core structure in `src/types/vs-code-theme.ts`):
  - `colorStyles`: Map of color palette (internal, custom field)
  - `colors`: Map of UI color scopes (format: `{scope: {colorStyle}}`)
  - `tokenColors`: Map of token scopes (format: `{scope: {foreground?, background?, fontStyle?}}`)
  - `semanticTokenColors`: Map of semantic scopes (format: `{scope: {foreground?, fontStyle?}}`)

- **ColorStyle** (atomic color unit):
  - `name`, `value` (hex/rgb), `scopes` (Set tracking all uses)
  - Scopes format: `"uiScope"` | `"tokenScope (fg|bg)"` | `"semanticScope (semantic)"`

### State Management

- **ThemeContext** (`src/context/theme-context.tsx`):
  - Singleton pattern: `useTheme()` hook provides `{theme, setTheme, currentFilePath, setCurrentFilePath}`
  - All pages consume via context, no prop drilling
  - Flow: User action → page updates context → re-render affected components

### Theme I/O

- **Loading** (`src/lib/theme-parser.ts`):
  - JSON → parse → populate colorStyles from colors/tokenColors/semanticTokenColors
  - Auto-populate scopes during parse (no manual sync needed)
  
- **Saving** (`src/lib/file-service.ts`):
  - Internal Maps → VS Code format (colors object, tokenColors array, semanticTokenColors object)
  - Sorts all scopes by specificity (more dots = higher priority)
  - Preserves colorStyles as custom field
  - Electron IPC path handling: detects absolute vs relative paths

## Critical Developer Workflows

### Building & Running

```bash
npm run dev              # Vite + Electron dev mode (HMR enabled)
npm run build            # TypeScript + Vite build
npm run electron:build   # Package distributable (.AppImage, .exe, etc.)
npm test                 # Vitest watch mode
npm run test:coverage    # Coverage report (minimum 80%)
npm run format           # Biome auto-format
```

### Testing Requirements

- **Minimum 80% coverage** for business logic (parsers, managers, utilities)
- Test files co-located: `filename.test.ts` next to `filename.ts`
- Mock Electron API: `window.electronAPI` in tests
- Use Vitest: `describe()`, `it()`, `expect()`, `vi.fn()`

### Common Commands During Development

```bash
# Type checking (catches errors before runtime)
npm run type-check

# Linting only (don't auto-fix)
npm run lint

# Watch mode for single test file
npm test -- file-service --watch
```

## Essential Patterns & Conventions

### 1. **Scope Integrity Management** (critical for data consistency)

When modifying color assignments, ALWAYS use `color-scope-manager.ts`:

```typescript
import { updateColorReference, removeColorReference } from "@/lib/color-scope-manager"

// Changing a color: old → new (updates both colorStyle.scopes Sets)
updateColorReference(oldColorStyle, newColorStyle, "editor.background")

// Deleting a color: removes scope from colorStyle.scopes
removeColorReference(colorStyle, "comment (fg)")
```

**Why**: ColorStyle.scopes must stay synchronized with theme usage. Failure breaks tooltips and scope validation. See `docs/COLOR_SCOPE_MANAGEMENT.md` for full guide.

### 2. **Performance Optimization Patterns** (used in UI/Token/Semantic pages)

- **Memoization**: Wrap CRUD dialogs with `React.memo()` + `useCallback()` handlers
- **Deferred Search**: Use `useDeferredValue()` for search input (non-blocking)
- **Uncontrolled Inputs**: Use `useRef` in dialogs to avoid re-renders during typing
- **Component Isolation**: Split large pages into smaller memoized subcomponents

**Example**: `src/pages/ui-colors-page.tsx` shows all patterns combined.

### 3. **Serialization & Format Conversion**

- **Input**: VS Code theme JSON (colors object, tokenColors array)
- **Internal**: Maps with ColorStyle references (easier to work with)
- **Output**: Same VS Code format + custom colorStyles field

Parse is smart: extracts all unique colors into colorStyles automatically. Serialize respects specificity ordering.

### 4. **File Path Handling**

Electron handlers in `electron/main.cjs` now check `path.isAbsolute()`:

- Absolute paths → use directly
- Relative paths → resolve to project root

This prevents path duplication bugs (`/path/to//path/to/file`).

### 5. **UI Patterns** (all pages use same structure)

- Search box with `useDeferredValue` (non-blocking)
- Sort toggle groups (Default/Name + Asc/Desc) for flexible ordering
- Grouped display by category (when in Default mode)
- Card components with tooltips showing color info
- CRUD buttons: Add (+), Edit (✏️), Delete (🗑️)

See `src/pages/ui-colors-page.tsx`, `token-colors-page.tsx`, `semantic-tokens-page.tsx`.

## Code Organization

```text
src/
├── components/        # React components (buttons, dialogs, cards, UI primitives)
├── context/          # ThemeContext provider & useTheme hook
├── layout/           # App layout (sidebar, header)
├── lib/              # Business logic (parsers, file I/O, utilities, managers)
├── pages/            # Full-page components (UI Colors, Token Colors, etc.)
├── types/            # TypeScript interfaces (ColorStyle, VSCodeTheme, etc.)
└── hooks/            # Custom hooks (currently empty, for future use)

electron/
├── main.cjs          # Electron main process, IPC handlers
└── preload.cjs       # Preload script (exposes electronAPI to renderer)
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/types/vs-code-theme.ts` | Central data model definition |
| `src/lib/theme-parser.ts` | JSON → VSCodeTheme + auto-populate scopes |
| `src/lib/file-service.ts` | VSCodeTheme → JSON (respects specificity sort) |
| `src/lib/color-scope-manager.ts` | Maintains ColorStyle.scopes synchronization |
| `src/context/theme-context.tsx` | Global state provider |
| `src/pages/ui-colors-page.tsx` | Template for performance patterns |
| `electron/main.cjs` | Electron IPC, path handling, file operations |
| `docs/COLOR_SCOPE_MANAGEMENT.md` | Detailed scope management guide |

## Common Gotchas & Solutions

1. **Scope mismatch errors**: Always use `updateColorReference` when reassigning colors
2. **JSON serialization fails**: Check that colorStyle.value is valid hex/rgb
3. **Electron API undefined**: Ensure test mocks `window.electronAPI` before calling file-service
4. **Slow dialog**: Check if using `useCallback` on all handlers; limit Select to 100 items
5. **Path duplication**: File-service now detects absolute paths; verify in electron/main.cjs

## Testing Strategy

- **Unit tests**: Each lib file (`theme-parser.test.ts`, etc.) has 100% coverage
- **Integration**: `file-service.test.ts` tests save→load round-trip
- **Mock Electron**: `mockElectronAPI.saveFile.mock.calls[0][1]` to inspect saved JSON

**Run coverage**: `npm run test:coverage` → view at `coverage/index.html`

## Before Making Changes

1. **Understand data flow**: New feature? Trace how data moves through Context → Page → Component
2. **Check scope implications**: Does feature involve colors? Use `color-scope-manager`
3. **Add tests**: Business logic needs tests. Target 80%+ coverage
4. **Performance check**: Page with many items? Apply memoization patterns from `ui-colors-page.tsx`
5. **Update docs**: New patterns should be documented in README or `docs/COLOR_SCOPE_MANAGEMENT.md`
