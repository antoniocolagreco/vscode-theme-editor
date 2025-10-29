import { FileUp, Palette, Plus, Save, Settings, Sparkles, SwatchBook, Target } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Input,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui"
import { WindowControls } from "@/components/window-controls"
import { useTheme } from "@/context"
import { parseThemeFromJSON, saveThemeToFile } from "@/lib"
import type { VSCodeTheme } from "@/types"

const navigationItems = [
  {
    title: "Theme Settings",
    path: "/",
    icon: Settings,
  },
  {
    title: "Colors Palette",
    path: "/colors",
    icon: Palette,
  },
  {
    title: "UI Colors",
    path: "/ui-colors",
    icon: SwatchBook,
  },
  {
    title: "Token Colors",
    path: "/token-colors",
    icon: Target,
  },
  {
    title: "Semantic Colors",
    path: "/semantic-tokens",
    icon: Sparkles,
  },
]

function AppContent() {
  const location = useLocation()
  const { theme, setTheme, currentFilePath, setCurrentFilePath } = useTheme()

  const handleNewTheme = () => {
    const newTheme: VSCodeTheme = {
      $schema: "vscode://schemas/color-theme",
      name: "New Theme",
      type: "dark",
      colorStyles: new Map(),
      colors: new Map(),
      tokenColors: new Map(),
      semanticHighlighting: false,
      semanticTokenColors: undefined,
    }

    setTheme(newTheme)
    setCurrentFilePath(null)
    toast.success("New theme created")
  }

  const handleLoadTheme = async () => {
    if (!window.electronAPI) {
      toast.error("Electron API not available")
      return
    }

    try {
      const result = await window.electronAPI.openFileDialog()

      if (!result) {
        return // User cancelled
      }

      const loadedTheme = parseThemeFromJSON(result.content)
      setTheme(loadedTheme)
      setCurrentFilePath(result.filePath)
      toast.success(`Theme "${loadedTheme.name}" loaded successfully`)
    } catch (error) {
      toast.error(`Failed to load theme: ${error}`)
    }
  }

  const handleSave = async () => {
    if (!theme) {
      toast.error("No theme to save")
      return
    }

    try {
      const filePath = currentFilePath || `themes/${theme.name}.json`
      await saveThemeToFile(filePath, theme)
      toast.success("Theme saved successfully")
    } catch (error) {
      toast.error(`Failed to save theme: ${error}`)
    }
  }

  return (
    <>
      <Sidebar collapsible='icon' variant='sidebar'>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size='lg' asChild>
                <Link to='/'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Palette className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>Visual Studio Code</span>
                    <span className='truncate'>Theme Editor</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map(item => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                        <Link to={item.path}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLoadTheme} tooltip='Load Theme'>
                <FileUp />
                <span>Load Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewTheme} tooltip='New Theme'>
                <Plus />
                <span>New Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSave} disabled={!theme} tooltip='Save Theme'>
                <Save />
                <span>Save Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span className='text-xs text-muted-foreground'>v1.0.0 Antonio Colagreo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className='sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background px-4'>
          <SidebarTrigger className='-ml-1 size-9' size='icon-lg' />
          <Input
            value={currentFilePath || ""}
            onChange={e => setCurrentFilePath(e.target.value)}
            className='text-sm font-medium flex-1'
            placeholder='No theme loaded'
          />
          <ThemeToggle />
          <WindowControls />
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 h-full'>
          <Outlet />
        </div>
      </SidebarInset>
    </>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  )
}
