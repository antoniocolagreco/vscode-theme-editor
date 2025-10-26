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

## Testing

The project uses **Vitest** for testing with a minimum **80% code coverage** requirement for business logic.

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test -- --run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Coverage

Current coverage: **84%+** for business logic (theme parsing, utilities, and state management)

The coverage report is generated in the `coverage/` directory and can be viewed in your browser by opening `coverage/index.html`.

### Conventions

- **Language**: English Only for everything
- **File naming**: kebab-case
- **Imports**: Barrel exports per layer (`index.ts`)
- **Components**: Function components with TypeScript
- **Styling**: Tailwind utility classes, no CSS modules
- **Testing**: Unit tests co-located with source (`.test.ts`), 80%+ coverage for business logic
- **Code Quality**: Biome rules strict, auto-format on save

## Application Layout

The app has a collapsible sidebar on the left and a main content area on the right.

### Sidebar

- Navigation menu for all pages
- **Load Theme button** - Upload existing theme JSON file
- **New Theme button** - Create blank theme from scratch
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

### Theme Settings

Main page for configuring basic theme information and viewing scope summaries.

**Components**:

- **Theme Metadata**: Edit basic theme information
  - `$schema` (VS Code theme schema URL)
  - `name` (theme display name)
  - `type` (dark, light, hc)
  
- **UI Colors section**: Summary with link to dedicated page
  - Shows count of defined UI color scopes
  - Quick overview of `editor.background`, `statusBar.foreground`, etc.
  
- **Token Colors section**: Summary with link to dedicated page
  - Shows count of defined token color scopes
  - Quick overview of syntax highlighting scopes
  
- **Semantic Token Colors section**: Summary with link to dedicated page
  - Checkbox to enable/disable semantic highlighting
  - Shows count of defined semantic token scopes
  - Quick overview of language-specific semantic scopes

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
