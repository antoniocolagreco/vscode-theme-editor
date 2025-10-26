import { ArrowRight, Palette, Sparkles, SwatchBook } from "lucide-react"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"
import { useTheme } from "@/context"
import type { ThemeType } from "@/types"

export function HomePage() {
  const { theme, setTheme } = useTheme()

  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Theme Loaded</CardTitle>
          <CardDescription>
            Load an existing theme or create a new one from the sidebar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Use the "Load Theme" button to upload a VS Code theme JSON file, or click "New Theme" to
            start from scratch.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Theme Metadata</CardTitle>
          <CardDescription>Basic theme information and settings</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='schema'>Schema</Label>
            <Input
              id='schema'
              value={theme.$schema}
              onChange={e => setTheme({ ...theme, $schema: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={theme.name}
              onChange={e => setTheme({ ...theme, name: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='type'>Type</Label>
            <Select
              value={theme.type}
              onValueChange={value => setTheme({ ...theme, type: value as ThemeType })}
            >
              <SelectTrigger id='type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='dark'>Dark</SelectItem>
                <SelectItem value='light'>Light</SelectItem>
                <SelectItem value='hc'>High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <SwatchBook className='h-5 w-5' />
            UI Colors
          </CardTitle>
          <CardDescription>
            Editor, sidebar, statusbar and other VS Code UI element colors
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {theme.colors.size} scope{theme.colors.size !== 1 ? "s" : ""} defined
            </p>
            <Link to='/ui-colors'>
              <span className='text-sm text-primary hover:underline inline-flex items-center gap-1'>
                Manage UI Colors
                <ArrowRight className='h-4 w-4' />
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Palette className='h-5 w-5' />
            Token Colors
          </CardTitle>
          <CardDescription>
            Syntax highlighting colors for code elements like keywords, comments, strings
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {theme.tokenColors.size} scope{theme.tokenColors.size !== 1 ? "s" : ""} defined
            </p>
            <Link to='/token-colors'>
              <span className='text-sm text-primary hover:underline inline-flex items-center gap-1'>
                Manage Token Colors
                <ArrowRight className='h-4 w-4' />
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            Semantic Token Colors
          </CardTitle>
          <CardDescription>
            Language-specific semantic highlighting for enhanced code coloring
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='semantic-highlighting'
                checked={theme.semanticHighlighting}
                onChange={e => setTheme({ ...theme, semanticHighlighting: e.target.checked })}
                className='h-4 w-4'
              />
              <Label htmlFor='semantic-highlighting' className='cursor-pointer'>
                Enable Semantic Highlighting
              </Label>
            </div>
          </div>
          {theme.semanticHighlighting && (
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                {theme.semanticTokenColors?.size || 0} scope
                {theme.semanticTokenColors?.size !== 1 ? "s" : ""} defined
              </p>
              <Link to='/semantic-tokens'>
                <span className='text-sm text-primary hover:underline inline-flex items-center gap-1'>
                  Manage Semantic Tokens
                  <ArrowRight className='h-4 w-4' />
                </span>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
