# VS Code Theme Editor

A simple and efficient desktop application for creating and managing Visual Studio Code themes.

## Technology Stack

### Runtime & Build

- **Node.js** - JavaScript runtime
- **TypeScript 5.9** - Type safety and developer experience
- **Vite 7.1** (Rolldown) - Modern and fast build tool
- **Electron 38** - Desktop app with filesystem access

### Framework & UI

- **React 19** - UI framework with hooks
- **React Router DOM 7** - Client-side routing
- **Shadcn/UI** - Component library (brings Radix UI, CVA, etc. as dependencies)

### Styling

- **TailwindCSS 4.1** - Utility-first CSS framework
- **Lucide React** - Icon set

### Development Tools

- **Biome 2.3** - Linter + Formatter
- **Vitest 4** - Test runner
- **Electron Builder 26** - Package desktop app for distribution

### Conventions

- **Language**: English Only for everything
- **File naming**: kebab-case
- **Imports**: Barrel exports per layer (`index.ts`)
- **Components**: Function components with TypeScript
- **Styling**: Tailwind utility classes, no CSS modules
- **Testing**: Unit tests co-located with source (`.test.ts`)
- **Code Quality**: Biome rules strict, auto-format on save

## Application Layout

The app has a collapsible sidebar on the left and a main content area on the right.

### Sidebar

- Navigation menu for all pages
- **Save button** at the bottom
  - If theme was loaded from file: overwrites the existing file
  - If theme is new: opens save dialog to choose location
  - Serializes all data to valid VS Code theme JSON (including custom `colorStyles` field)

## User Workflows

### Primary Flow

1. **Load existing theme** (most common) or create new blank theme
2. **Edit scopes** across the three sections (UI colors, semantic tokens, token colors)
3. **Manage color palette** in the Colors Editor
4. **Save** to JSON file

### Live Preview

The user can edit the theme currently active in VS Code to see changes in real-time. Each scope in the app's lists displays using its assigned colors:

- **Foreground**: text color
- **Background**: background color
- **Font style**: bold, italic, etc.

**Default fallbacks**:

- Missing background → uses default background color if set, otherwise:
  - Dark theme: black (`#000000`)
  - Light theme: white (`#ffffff`)
- Missing foreground → uses default foreground color if set, otherwise:
  - Dark theme: white (`#ffffff`)
  - Light theme: black (`#000000`)

### Color Style Management

When loading an existing theme:

- All colors are extracted into the `colorStyles` map
- Each unique color becomes a ColorStyle with a user-customizable name
- Duplicate colors reuse the same ColorStyle reference
- The `colorStyles` field persists in the JSON file for app use only

## Pages / Views

### Home / Theme Editor

Main page for creating or loading a theme.

**Components**:

- **File dropzone** at the top to load existing `.json` theme files
- **Theme metadata fields**:
  - `$schema` (VS Code theme schema URL)
  - `name` (theme display name)
  - `type` (dark, light, hc)
- **UI Colors section**: Add/edit/delete scopes like `descriptionForeground`, `button.background`
  - Searchable list with filter-as-you-type
  - Add, delete, modify scopes
  - Assign ColorStyles to each scope
- **Semantic Highlighting checkbox**: Enable/disable semantic tokens
- **Semantic Token Colors section**: Add/edit/delete scopes like `foreground`, `function.decorator:python`
  - Searchable list with filter-as-you-type
  - Add, delete, modify scopes
  - Assign ColorStyle to foreground and FontStyle
- **Token Colors section**: Add/edit/delete scopes like `heading.6.markdown punctuation.definition.heading.markdown`
  - Searchable list with filter-as-you-type
  - Add, delete, modify scopes
  - Assign ColorStyles to foreground/background and FontStyle

### Colors Editor

Centralized palette management for all colors used in the theme.

**Features**:

- Add/edit/delete ColorStyles
- Each ColorStyle has:
  - Unique user-defined name (for easy identification)
  - Color value (hex, rgb, rgba)
- Color preview with name display
- Bulk color modifications cascade to all scopes using that ColorStyle

**Storage**: ColorStyles are stored in a custom `colorStyles` field in the theme JSON file.

### UI Colors Editor

Dedicated page for managing UI color scopes.

**Features**:

- Searchable list with filter-as-you-type
- Add/edit/delete scopes (e.g., `editor.background`, `statusBar.foreground`)
- Assign ColorStyles to each scope
- Visual preview of each scope with its assigned color

### Semantic Token Colors Editor

Dedicated page for managing semantic token color scopes.

**Features**:

- Searchable list with filter-as-you-type
- Add/edit/delete scopes (e.g., `variable`, `function.async:typescript`)
- Assign ColorStyle to foreground
- Assign FontStyle (bold, italic, underline, etc.)
- Visual preview of each scope with its assigned styles

### Token Colors Editor

Dedicated page for managing token color scopes.

**Features**:

- Searchable list with filter-as-you-type
- Add/edit/delete scopes (e.g., `comment`, `keyword.control`)
- Assign ColorStyles to foreground and background
- Assign FontStyle (bold, italic, underline, etc.)
- Visual preview of each scope with its assigned styles
