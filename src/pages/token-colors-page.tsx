import { ArrowDownAZ, ArrowUpAZ, Code, Plus, Search } from "lucide-react"
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ColorCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui"
import { useTheme } from "@/context"
import type { ColorStyle, FontStyle, TokenColor } from "@/types"

interface EditDialogProps {
  isOpen: boolean
  isAddingNew: boolean
  initialScope: string
  initialForeground: string
  initialBackground: string
  initialFontStyle: FontStyle | undefined
  availableColors: Array<[string, ColorStyle]>
  onClose: () => void
  onSave: (
    scopeName: string,
    foregroundName: string,
    backgroundName: string,
    fontStyle: FontStyle | undefined
  ) => void
}

const FONT_STYLES: Array<FontStyle | "none"> = [
  "none",
  "regular",
  "bold",
  "italic",
  "bold italic",
  "underline",
  "underline italic",
]

const EditDialog = memo(
  ({
    isOpen,
    isAddingNew,
    initialScope,
    initialForeground,
    initialBackground,
    initialFontStyle,
    availableColors,
    onClose,
    onSave,
  }: EditDialogProps) => {
    const scopeInputRef = useRef<HTMLInputElement>(null)
    const [selectedForeground, setSelectedForeground] = useState(initialForeground || "__none__")
    const [selectedBackground, setSelectedBackground] = useState(initialBackground || "__none__")
    const [selectedFontStyle, setSelectedFontStyle] = useState<FontStyle | "none">(
      initialFontStyle || "none"
    )

    useEffect(() => {
      if (scopeInputRef.current) {
        scopeInputRef.current.value = initialScope
      }
      setSelectedForeground(initialForeground || "__none__")
      setSelectedBackground(initialBackground || "__none__")
      setSelectedFontStyle(initialFontStyle || "none")
    }, [initialScope, initialForeground, initialBackground, initialFontStyle])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const scopeName = scopeInputRef.current?.value || ""
      const fontStyle = selectedFontStyle === "none" ? undefined : selectedFontStyle
      const foreground = selectedForeground === "__none__" ? "" : selectedForeground
      const background = selectedBackground === "__none__" ? "" : selectedBackground
      onSave(scopeName, foreground, background, fontStyle)
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{isAddingNew ? "Add Token Color" : "Edit Token Color"}</DialogTitle>
            <DialogDescription>
              {isAddingNew ? "Create a new token color scope" : "Modify the token color scope"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='scope-name'>Scope Name</Label>
                <Input
                  ref={scopeInputRef}
                  id='scope-name'
                  defaultValue={initialScope}
                  placeholder='e.g., comment, string, keyword'
                  autoFocus
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='foreground-select'>Foreground Color</Label>
                  <Select value={selectedForeground} onValueChange={setSelectedForeground}>
                    <SelectTrigger id='foreground-select'>
                      <SelectValue placeholder='Select foreground' />
                    </SelectTrigger>
                    <SelectContent className='max-h-[300px]'>
                      <SelectItem value='__none__'>None</SelectItem>
                      {availableColors.slice(0, 100).map(([name, style]) => (
                        <SelectItem key={name} value={name}>
                          <div className='flex items-center gap-2'>
                            <ColorCircle color={style.value} className='h-4 w-4' />
                            <span>{name}</span>
                            <span className='text-muted-foreground text-xs'>• {style.value}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {availableColors.length > 100 && (
                        <SelectItem value='__more_fg__' disabled>
                          ... and {availableColors.length - 100} more colors
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableColors.length > 100 && (
                    <p className='text-xs text-muted-foreground'>
                      Showing first 100 colors. Use search in Colors page to find more.
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='background-select'>Background Color</Label>
                  <Select value={selectedBackground} onValueChange={setSelectedBackground}>
                    <SelectTrigger id='background-select'>
                      <SelectValue placeholder='Select background' />
                    </SelectTrigger>
                    <SelectContent className='max-h-[300px]'>
                      <SelectItem value='__none__'>None</SelectItem>
                      {availableColors.slice(0, 100).map(([name, style]) => (
                        <SelectItem key={name} value={name}>
                          <div className='flex items-center gap-2'>
                            <ColorCircle color={style.value} className='h-4 w-4' />
                            <span>{name}</span>
                            <span className='text-muted-foreground text-xs'>• {style.value}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {availableColors.length > 100 && (
                        <SelectItem value='__more_bg__' disabled>
                          ... and {availableColors.length - 100} more colors
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableColors.length > 100 && (
                    <p className='text-xs text-muted-foreground'>
                      Showing first 100 colors. Use search in Colors page to find more.
                    </p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='font-style-select'>Font Style</Label>
                <Select
                  value={selectedFontStyle}
                  onValueChange={value => setSelectedFontStyle(value as FontStyle | "none")}
                >
                  <SelectTrigger id='font-style-select'>
                    <SelectValue placeholder='Select font style' />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_STYLES.map(style => (
                      <SelectItem key={style} value={style}>
                        <span className={style !== "none" ? `font-${style}` : ""}>
                          {style === "none" ? "None" : style}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant='outline' onClick={onClose} type='button'>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const scopeName = scopeInputRef.current?.value || ""
                const fontStyle = selectedFontStyle === "none" ? undefined : selectedFontStyle
                const foreground = selectedForeground === "__none__" ? "" : selectedForeground
                const background = selectedBackground === "__none__" ? "" : selectedBackground
                onSave(scopeName, foreground, background, fontStyle)
              }}
              type='submit'
            >
              {isAddingNew ? "Add" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

EditDialog.displayName = "EditDialog"

interface ColorCardProps {
  scope: string
  tokenColor: TokenColor
  onEdit: (scope: string, tokenColor: TokenColor) => void
  onDelete: (scope: string) => void
}

const ColorCard = memo(({ scope, tokenColor, onEdit, onDelete }: ColorCardProps) => {
  const fgScopes = Array.from(tokenColor.foreground?.scopes || [])
  const bgScopes = Array.from(tokenColor.background?.scopes || [])

  return (
    <Card className='p-3'>
      <div className='flex items-center gap-3'>
        <div className='flex gap-1'>
          {tokenColor.foreground && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ColorCircle
                      color={tokenColor.foreground.value}
                      className='h-8 w-8 shrink-0 cursor-pointer'
                      onClick={() => onEdit(scope, tokenColor)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className='max-w-md max-h-96 overflow-y-auto'>
                  <div className='space-y-1'>
                    <p className='font-semibold text-sm mb-2'>
                      Foreground • Used in {fgScopes.length} scope{fgScopes.length !== 1 ? 's' : ''}:
                    </p>
                    {fgScopes.length === 0 ? (
                      <p className='text-xs text-muted-foreground'>Not used in any scope</p>
                    ) : (
                      <ul className='text-xs space-y-0.5'>
                        {fgScopes.map((s: string) => (
                          <li key={s} className='truncate'>• {s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {tokenColor.background && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ColorCircle
                      color={tokenColor.background.value}
                      className='h-8 w-8 shrink-0 ring-2 ring-border cursor-pointer'
                      onClick={() => onEdit(scope, tokenColor)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className='max-w-md max-h-96 overflow-y-auto'>
                  <div className='space-y-1'>
                    <p className='font-semibold text-sm mb-2'>
                      Background • Used in {bgScopes.length} scope{bgScopes.length !== 1 ? 's' : ''}:
                    </p>
                    {bgScopes.length === 0 ? (
                      <p className='text-xs text-muted-foreground'>Not used in any scope</p>
                    ) : (
                      <ul className='text-xs space-y-0.5'>
                        {bgScopes.map((s: string) => (
                          <li key={s} className='truncate'>• {s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-sm truncate'>{scope}</p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            {tokenColor.foreground && (
              <span className='truncate'>
                FG: {tokenColor.foreground.name} • {tokenColor.foreground.value}
              </span>
            )}
            {tokenColor.background && (
              <span className='truncate'>
                BG: {tokenColor.background.name} • {tokenColor.background.value}
              </span>
            )}
            {tokenColor.fontStyle && (
              <span className='truncate font-semibold'>{tokenColor.fontStyle}</span>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <EditButton onClick={() => onEdit(scope, tokenColor)} />
          <DeleteButton onClick={() => onDelete(scope)} />
        </div>
      </div>
    </Card>
  )
})

ColorCard.displayName = "ColorCard"
ColorCard.displayName = "ColorCard"

export function TokenColorsPage() {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScope, setEditingScope] = useState<string | null>(null)
  const [dialogInitialScope, setDialogInitialScope] = useState<string>("")
  const [dialogInitialForeground, setDialogInitialForeground] = useState<string>("")
  const [dialogInitialBackground, setDialogInitialBackground] = useState<string>("")
  const [dialogInitialFontStyle, setDialogInitialFontStyle] = useState<FontStyle | undefined>(
    undefined
  )
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [sortBy, setSortBy] = useState<"default" | "name">("default")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const tokenColors = useMemo(
    () => Array.from(theme?.tokenColors?.entries() || []),
    [theme?.tokenColors]
  )
  const availableColors = useMemo(
    () => Array.from(theme?.colorStyles?.entries() || []),
    [theme?.colorStyles]
  )

  const deferredSearch = useDeferredValue(search)

  const filteredTokenColors = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase()
    return tokenColors.filter(([scope]) => scope.toLowerCase().includes(searchLower))
  }, [tokenColors, deferredSearch])

  // Group token colors by category (first part before the dot)
  const groupedTokenColors = useMemo(() => {
    const groups = new Map<string, Array<[string, TokenColor]>>()

    filteredTokenColors.forEach(entry => {
      const [scope] = entry
      const category = sortBy === "default" ? scope.split(".")[0] || "other" : "all"
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      const categoryGroup = groups.get(category)
      if (categoryGroup) {
        categoryGroup.push(entry)
      }
    })

    // Sort function based on order
    const sortFn = (a: string, b: string) =>
      sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)

    // Sort groups by name and sort entries within each group
    const sortedGroups = new Map(
      Array.from(groups.entries())
        .sort(([a], [b]) => (sortBy === "default" ? sortFn(a, b) : 0))
        .map(([category, entries]) => [category, entries.sort(([a], [b]) => sortFn(a, b))])
    )

    return sortedGroups
  }, [filteredTokenColors, sortBy, sortOrder])

  const handleAdd = useCallback(() => {
    setIsAddingNew(true)
    setEditingScope(null)
    setDialogInitialScope("")
    setDialogInitialForeground("")
    setDialogInitialBackground("")
    setDialogInitialFontStyle(undefined)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback(
    (scope: string, tokenColor: TokenColor) => {
      setIsAddingNew(false)
      setEditingScope(scope)
      setDialogInitialScope(scope)
      const foregroundName =
        availableColors.find(([, style]) => style === tokenColor.foreground)?.[0] || ""
      const backgroundName =
        availableColors.find(([, style]) => style === tokenColor.background)?.[0] || ""
      setDialogInitialForeground(foregroundName)
      setDialogInitialBackground(backgroundName)
      setDialogInitialFontStyle(tokenColor.fontStyle)
      setIsDialogOpen(true)
    },
    [availableColors]
  )

  const handleDelete = useCallback(
    (scope: string) => {
      if (!theme) {
        return
      }
      const updatedTokenColors = new Map(theme.tokenColors)
      updatedTokenColors.delete(scope)
      setTheme({ ...theme, tokenColors: updatedTokenColors })
      toast.success(`Deleted ${scope}`)
    },
    [theme, setTheme]
  )

  const validateSaveInput = useCallback(
    (scopeName: string, foregroundName: string, backgroundName: string) => {
      if (!scopeName.trim()) {
        toast.error("Scope name is required")
        return { valid: false }
      }

      const foreground = foregroundName ? theme?.colorStyles?.get(foregroundName) : undefined
      const background = backgroundName ? theme?.colorStyles?.get(backgroundName) : undefined

      if (foregroundName && !foreground) {
        toast.error("Selected foreground color not found")
        return { valid: false }
      }
      if (backgroundName && !background) {
        toast.error("Selected background color not found")
        return { valid: false }
      }

      return { valid: true, foreground, background }
    },
    [theme?.colorStyles]
  )

  const handleDialogSave = useCallback(
    (
      scopeName: string,
      foregroundName: string,
      backgroundName: string,
      fontStyle: FontStyle | undefined
    ) => {
      if (!theme) {
        return
      }

      const validation = validateSaveInput(scopeName, foregroundName, backgroundName)
      if (!validation.valid) {
        return
      }

      const targetScope = scopeName.trim()
      const updatedTokenColors = new Map(theme.tokenColors)

      if (editingScope && editingScope !== targetScope) {
        updatedTokenColors.delete(editingScope)
      }

      const tokenColor: TokenColor = {
        foreground: validation.foreground,
        background: validation.background,
        fontStyle,
      }

      updatedTokenColors.set(targetScope, tokenColor)

      setTheme({ ...theme, tokenColors: updatedTokenColors })
      setIsDialogOpen(false)
      toast.success(isAddingNew ? `Added ${targetScope}` : `Updated ${targetScope}`)
    },
    [theme, setTheme, editingScope, isAddingNew, validateSaveInput]
  )

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Colors</CardTitle>
          <CardDescription>No theme loaded</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Please load a theme from the Theme Editor page first.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='flex flex-col h-full'>
        <CardHeader>
          <CardTitle>Token Colors</CardTitle>
          <CardDescription>
            Manage syntax highlighting token color scopes. Each scope controls colors for specific
            code elements like comments, strings, and keywords.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 flex-1'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search token scopes...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <ToggleGroup
              type='single'
              value={sortBy}
              onValueChange={value => value && setSortBy(value as "default" | "name")}
            >
              <ToggleGroupItem value='default' aria-label='Group by category' variant='outline'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='text-xs'>Default</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Group by category</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem value='name' aria-label='Sort by name' variant='outline'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='text-xs'>Name</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sort by name only</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              type='single'
              value={sortOrder}
              onValueChange={value => value && setSortOrder(value as "asc" | "desc")}
            >
              <ToggleGroupItem value='asc' aria-label='Ascending order' variant='outline'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ArrowUpAZ className='h-4 w-4' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ascending</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem value='desc' aria-label='Descending order' variant='outline'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ArrowDownAZ className='h-4 w-4' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Descending</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={handleAdd} variant='outline' size='sm' className='h-9 w-9 p-0'>
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          <ScrollArea className='flex-1'>
            {filteredTokenColors.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Code className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground'>
                  {search ? "No token scopes match your search" : "No token colors defined"}
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {Array.from(groupedTokenColors.entries()).map(([category, entries]) => (
                  <div key={category}>
                    {sortBy === "default" && (
                      <h3 className='text-sm font-semibold mb-3 capitalize text-muted-foreground'>
                        {category}
                      </h3>
                    )}
                    <div className='space-y-2'>
                      {entries.map(([scope, tokenColor]) => (
                        <ColorCard
                          key={scope}
                          scope={scope}
                          tokenColor={tokenColor}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <EditDialog
        isOpen={isDialogOpen}
        isAddingNew={isAddingNew}
        initialScope={dialogInitialScope}
        initialForeground={dialogInitialForeground}
        initialBackground={dialogInitialBackground}
        initialFontStyle={dialogInitialFontStyle}
        availableColors={availableColors}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
      />
    </>
  )
}
