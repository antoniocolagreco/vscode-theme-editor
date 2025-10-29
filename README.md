# VS Code Theme Editor

A desktop application for creating, editing, and managing VS Code themes with deduplication and intelligent color palette tracking.

---

## 🎯 What It Solves

VS Code themes contain hundreds of color scopes that often reuse the same colors. Without intelligent deduplication:

- ❌ Edit "red" in 50 places separately
- ❌ Inconsistent color values across the theme
- ❌ Difficult to track where colors are used
- ❌ Manual updates required everywhere

**This app solves it** by treating colors as first-class objects with automatic scope tracking and O(1) lookups.

---

## ✨ Key Features

### 1. **Color Palette Deduplication**

- Extract unique colors from VS Code themes automatically
- One color = one definition, referenced by all scopes
- Edit once, update everywhere instantly

### 2. **Scope Tracking**

- See exactly which scopes use each color
- Filter and organize by scope type (UI, token, semantic)
- Track color usage across the entire theme

### 3. **Multiple Color Types**

- **UI Colors**: Editor background, foreground, panels, etc.
- **Token Colors**: Syntax highlighting for code elements
- **Semantic Token Colors**: Modern language-aware token styling

### 4. **Native Desktop Experience**

- Built with Electron for macOS, Windows, and Linux
- Seamless file I/O with Electron IPC
- Zero browser limitations

### 5. **Full VS Code Compatibility**

- Import existing VS Code themes (.json)
- Export valid VS Code theme files
- Preserves all color formats (hex, rgb, named colors)

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/antoniocolagreco/vscode-theme-editor
cd vscode-theme-editor

# Install dependencies
npm install

# Development mode (Vite + Electron HMR)
npm run dev

# Build for production
npm run build

# Package distributable
npm run package
```

### First Theme

1. Launch the app
2. Click **Load Theme** → select a `.json` theme file
3. Navigate tabs:
   - **UI Colors**: Editor and window colors
   - **Token Colors**: Syntax highlighting
   - **Semantic Tokens**: Advanced token styling
   - **Colors Palette**: View and edit all unique colors

4. Make edits (changes appear everywhere automatically)
5. Click **Save** to write the theme back to disk
