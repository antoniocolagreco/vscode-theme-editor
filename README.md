# VS Code Theme Editor

Desktop app (Electron + React) for editing VS Code theme JSON files with zero duplication.

## The Problem

VS Code themes have hundreds of color scopes, but many reuse the same color values. Without deduplication:

- Edit "red" in 50 places instead of 1
- Colors become inconsistent
- Hard to track where each color is used

## The Solution

**ColorStyle Palette**: Extract unique colors once, reference everywhere.

- Load theme → extract unique colors into a palette
- Edit a color value → all scopes using it update automatically (same object reference)
- Save theme → serialize back to VS Code format

## Features

- ✅ **UI Colors Page**: Edit VS Code UI scope colors
- ✅ **Token Colors Page**: Edit syntax highlighting colors (foreground, background, fontStyle)
- ✅ **Semantic Tokens Page**: Edit semantic token colors
- ✅ **Color Palette**: View and edit unique colors directly
- ✅ **Search & Sort**: Find scopes by name, sort by category or name
- ✅ **Load/Save**: Open any theme, make edits, save back to file
- ✅ **Live Preview**: Instantly see all color updates across the theme

## Tech Stack

- **Electron 38** - Desktop app with native file access
- **React 19** - UI with performance optimizations (memoization, deferred values)
- **TypeScript 5.9** - Strict type safety
- **Vite** - Fast dev server and build tool
- **Radix UI + Shadcn/UI** - Component library
- **TailwindCSS** - Styling
- **Vitest** - Unit tests (80%+ coverage)

## Quick Start

```bash
# Install dependencies
npm install

# Dev mode (Vite + Electron with HMR)
npm run dev

# Build distributable
npm run build
npm run electron:build

# Run tests
npm test
npm run test:coverage
```

## How It Works

1. **Load Theme**: Read VS Code theme JSON file
2. **Parse**: Extract unique colors → ColorStyle palette
3. **Edit**: Modify UI/Token/Semantic colors (all reference same ColorStyle objects)
4. **Save**: Serialize back to VS Code JSON format

All scope updates are tracked automatically. Edit one ColorStyle value → instantly updates all 50+ scopes using it.

## Architecture

```text
src/
├── pages/          # UI Colors, Token Colors, Semantic Tokens pages
├── context/        # ThemeContext for global state
├── lib/            # Parsers, file I/O, scope managers
├── components/     # Reusable UI components
└── types/          # TypeScript interfaces

electron/
├── main.cjs        # Electron IPC handlers
└── preload.cjs     # Preload script
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/theme-parser.ts` | Parse VS Code JSON → internal format |
| `src/lib/file-service.ts` | Save internal format → VS Code JSON |
| `src/lib/color-scope-manager.ts` | Track color usage (scope management) |
| `src/context/theme-context.tsx` | Global theme state provider |
| `.github/copilot-instructions.md` | AI agent development guide |

## Testing

```bash
npm test               # Watch mode
npm run test:coverage  # Coverage report (min 80%)
```

All business logic (parsers, file I/O, scope management) has 100% coverage.

## License

MIT
