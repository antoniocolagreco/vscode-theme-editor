import { FileInput, Palette, Save, Sparkles, SwatchBook, Target } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { toast } from "sonner"
import {
  Button,
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
import { useTheme } from "@/context"
import { saveThemeToFile } from "@/lib/file-service"

const navigationItems = [
  {
    title: "Theme Editor",
    path: "/",
    icon: FileInput,
  },
  {
    title: "Colors",
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
    title: "Semantic Tokens",
    path: "/semantic-tokens",
    icon: Sparkles,
  },
]

export function AppLayout() {
  const location = useLocation()
  const { theme, currentFilePath } = useTheme()
  const currentPage = navigationItems.find((item) => item.path === location.pathname)

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
    <SidebarProvider defaultOpen={true}>
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
              <Button
                onClick={handleSave}
                disabled={!theme}
                className="w-full"
                size="sm"
              >
                <Save className="size-4 mr-2" />
                Save Theme
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm">
                <span className="text-xs text-muted-foreground">v1.0.0</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className='sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background px-4'>
          <SidebarTrigger className='-ml-1' />
          <h1 className='text-lg font-semibold'>{currentPage?.title || "VSCode Theme Editor"}</h1>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
