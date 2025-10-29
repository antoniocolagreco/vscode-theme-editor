import Color from "color"
import { ArrowDownAZ, ArrowUpAZ, Palette, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ColorCircle,
  ColorPicker,
  DeleteButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EditButton,
  Input,
  Label,
  ScrollArea,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui"
import { useTheme } from "@/context"
import { getScopesForColor } from "@/lib/color-scope-manager"
import { getColorValidationMessage, isValidColor } from "@/lib/color-validator"
import type { ColorStyle, SemanticTokenColor, TokenColor, UIColor } from "@/types"

type SortBy = "default" | "name" | "value"
type SortOrder = "asc" | "desc"

export function ColorsPage() {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<ColorStyle | null>(null)
  const [colorName, setColorName] = useState("")
  const [colorValue, setColorValue] = useState("#000000")
  const [sortBy, setSortBy] = useState<SortBy>("default")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const colorStyles = Array.from(theme?.colorStyles?.entries() || []).reverse()

  const sortedAndFilteredColors = useMemo(() => {
    const searchLower = search.toLowerCase()
    const filtered = colorStyles.filter(([name, style]) => {
      // Match by name or value
      if (
        name.toLowerCase().includes(searchLower) ||
        style.value.toLowerCase().includes(searchLower)
      ) {
        return true
      }

      // Match by scope names
      const scopes = Array.from(style.scopes)
      return scopes.some(scope => scope.toLowerCase().includes(searchLower))
    })

    if (sortBy === "default") {
      return sortOrder === "asc" ? filtered : [...filtered].reverse()
    }

    const compareByName = (nameA: string, nameB: string): number => {
      return nameA.localeCompare(nameB)
    }

    const compareByColorClassification = (valueA: string, valueB: string): number => {
      try {
        const colorA = Color(valueA)
        const colorB = Color(valueB)

        const hslA = colorA.hsl().array()
        const hslB = colorB.hsl().array()

        // Primary: Hue (0-360) - rainbow order (red, orange, yellow, green, cyan, blue, magenta)
        const hueDiff = hslA[0] - hslB[0]
        if (hueDiff !== 0) {
          return hueDiff
        }

        // Secondary: Lightness (0-100) - within same hue, order by brightness
        const lightDiff = hslA[2] - hslB[2]
        if (lightDiff !== 0) {
          return lightDiff
        }

        // Tertiary: Saturation (0-100) - intensity of color
        return hslA[1] - hslB[1]
      } catch {
        // Fallback to string comparison if color parsing fails
        return valueA.localeCompare(valueB)
      }
    }

    const sorted = [...filtered].sort(([nameA, styleA], [nameB, styleB]) => {
      const compareResult =
        sortBy === "name"
          ? compareByName(nameA, nameB)
          : compareByColorClassification(styleA.value, styleB.value)

      return sortOrder === "asc" ? compareResult : -compareResult
    })

    return sorted
  }, [colorStyles, search, sortBy, sortOrder])

  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>No theme loaded</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Please load a theme from the Theme Editor page first.
          </p>
        </CardContent>
      </Card>
    )
  } // Find all scopes using a specific color style
  // Optimized to use pre-computed scopes field
  const getScopesUsingColor = getScopesForColor

  const handleAdd = () => {
    setEditingColor(null)
    setColorName("")
    setColorValue("#000000")
    setIsDialogOpen(true)
  }

  const handleEdit = (name: string, style: ColorStyle) => {
    setEditingColor(style)
    setColorName(name)
    setColorValue(style.value)
    setIsDialogOpen(true)
  }

  const handleDelete = (name: string) => {
    if (!theme.colorStyles) {
      return
    }

    const newColorStyles = new Map(theme.colorStyles)
    newColorStyles.delete(name)
    setTheme({ ...theme, colorStyles: newColorStyles })
    toast.success(`Color "${name}" deleted`)
  }

  const updateUIColorReferences = (
    colors: Map<string, UIColor>,
    oldStyle: ColorStyle,
    newStyle: ColorStyle
  ) => {
    const updated = new Map(colors)
    for (const [scope, uiColor] of updated.entries()) {
      if (uiColor.colorStyle === oldStyle) {
        updated.set(scope, { colorStyle: newStyle })
      }
    }
    return updated
  }

  const updateTokenColorReferences = (
    tokenColors: Map<string, TokenColor>,
    oldStyle: ColorStyle,
    newStyle: ColorStyle
  ) => {
    const updated = new Map(tokenColors)
    for (const [scope, tokenColor] of updated.entries()) {
      const fgMatch = tokenColor.foreground === oldStyle
      const bgMatch = tokenColor.background === oldStyle

      if (fgMatch || bgMatch) {
        updated.set(scope, {
          ...tokenColor,
          foreground: fgMatch ? newStyle : tokenColor.foreground,
          background: bgMatch ? newStyle : tokenColor.background,
        })
      }
    }
    return updated
  }

  const updateSemanticColorReferences = (
    semanticTokenColors: Map<string, SemanticTokenColor>,
    oldStyle: ColorStyle,
    newStyle: ColorStyle
  ) => {
    const updated = new Map(semanticTokenColors)
    for (const [scope, semanticToken] of updated.entries()) {
      if (semanticToken.foreground === oldStyle) {
        updated.set(scope, {
          ...semanticToken,
          foreground: newStyle,
        })
      }
    }
    return updated
  }

  const updateColorReferencesInTheme = (oldColorStyle: ColorStyle, newColorStyle: ColorStyle) => {
    return {
      updatedColors: updateUIColorReferences(theme.colors, oldColorStyle, newColorStyle),
      updatedTokenColors: updateTokenColorReferences(theme.tokenColors, oldColorStyle, newColorStyle),
      updatedSemanticTokenColors: updateSemanticColorReferences(
        theme.semanticTokenColors || new Map(),
        oldColorStyle,
        newColorStyle
      )
    }
  }

  const handleSave = () => {
    if (!colorName.trim()) {
      toast.error("Color name is required")
      return
    }

    if (!isValidColor(colorValue)) {
      toast.error(getColorValidationMessage())
      return
    }

    const newColorStyles = new Map(theme.colorStyles || new Map())
    let existingScopes = new Set<string>()
    let oldColorStyle: ColorStyle | undefined

    // Find and remove old color if editing
    if (editingColor) {
      const oldName = Array.from(newColorStyles.entries()).find(
        ([_k, v]) => v === editingColor
      )?.[0]
      if (oldName) {
        existingScopes = new Set(editingColor.scopes || new Set())
        oldColorStyle = editingColor
        newColorStyles.delete(oldName)
      }
    }

    // Create new ColorStyle
    const newColorStyle: ColorStyle = {
      name: colorName,
      value: colorValue,
      scopes: existingScopes
    }
    newColorStyles.set(colorName, newColorStyle)

    // Update all theme references if editing existing color
    if (oldColorStyle) {
      const { updatedColors, updatedTokenColors, updatedSemanticTokenColors } =
        updateColorReferencesInTheme(oldColorStyle, newColorStyle)

      setTheme({
        ...theme,
        colorStyles: newColorStyles,
        colors: updatedColors,
        tokenColors: updatedTokenColors,
        semanticTokenColors: updatedSemanticTokenColors
      })
    } else {
      setTheme({ ...theme, colorStyles: newColorStyles })
    }

    setIsDialogOpen(false)
    toast.success(editingColor ? "Color updated" : "Color added")
  }

  return (
    <>
      <Card className='flex flex-col h-full'>
        <CardHeader>
          <CardTitle>Color Styles</CardTitle>
          <CardDescription>
            Manage the color palette for your theme. Changes cascade to all scopes using these
            colors.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 flex-1'>
          <div className='flex gap-2 flex-wrap items-center'>
            <div className='relative flex-1 min-w-[200px]'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search colors...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>

            <ToggleGroup
              type='single'
              value={sortBy}
              onValueChange={value => value && setSortBy(value as SortBy)}
            >
              <ToggleGroupItem value='default' aria-label='No sorting' variant='outline'>
                Default
              </ToggleGroupItem>
              <ToggleGroupItem value='name' aria-label='Sort by name' variant='outline'>
                Name
              </ToggleGroupItem>
              <ToggleGroupItem value='value' aria-label='Sort by value' variant='outline'>
                Value
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup
              type='single'
              value={sortOrder}
              onValueChange={value => value && setSortOrder(value as SortOrder)}
            >
              <ToggleGroupItem value='asc' aria-label='Sort ascending' variant='outline'>
                <ArrowUpAZ className='h-4 w-4' />
              </ToggleGroupItem>
              <ToggleGroupItem value='desc' aria-label='Sort descending' variant='outline'>
                <ArrowDownAZ className='h-4 w-4' />
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              onClick={handleAdd}
              variant='outline'
              size='sm'
              className='h-9 w-9 p-0 cursor-pointer'
            >
              <Plus className='h-3 w-3' />
            </Button>
          </div>

          <ScrollArea className='flex-1'>
            {sortedAndFilteredColors.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Palette className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground'>
                  {search ? "No colors match your search" : "No colors defined yet"}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
                {sortedAndFilteredColors.map(([name, style]) => {
                  const scopes = getScopesUsingColor(style)

                  return (
                    <Card key={name} className='p-4'>
                      <div className='flex items-center gap-4'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <ColorCircle color={style.value} className='h-10 w-10 shrink-0' onClick={() => handleEdit(name, style)} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className='max-w-md max-h-96 overflow-y-auto'>
                              <div className='space-y-1'>
                                <p className='font-semibold text-sm mb-2'>
                                  Used in {scopes.length} scope{scopes.length !== 1 ? "s" : ""}:
                                </p>
                                {scopes.length === 0 ? (
                                  <p className='text-xs text-muted-foreground'>
                                    Not used in any scope
                                  </p>
                                ) : (
                                  <ul className='text-xs space-y-0.5'>
                                    {scopes.slice(0, 50).map((scope: string) => (
                                      <li key={scope} className='truncate'>
                                        • {scope}
                                      </li>
                                    ))}
                                    {scopes.length > 50 && (
                                      <li className='text-muted-foreground italic'>
                                        ... and {scopes.length - 50} more
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{name}</p>
                          <p className='text-sm text-muted-foreground truncate'>{style.value}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <EditButton onClick={() => handleEdit(name, style)} />
                          <DeleteButton onClick={() => handleDelete(name)} />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingColor ? "Edit Color" : "Add Color"}</DialogTitle>
            <DialogDescription>
              {editingColor ? "Update the color style" : "Create a new color style"}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='color-name'>Name</Label>
              <Input
                id='color-name'
                value={colorName}
                onChange={e => setColorName(e.target.value)}
                placeholder='e.g., Primary Blue'
              />
            </div>
            <div className='space-y-2'>
              <Label>Color</Label>
              <ColorPicker
                value={colorValue}
                onChange={(color: string) => {
                  setColorValue(color)
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingColor ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
