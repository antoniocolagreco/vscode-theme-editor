import { ArrowDownAZ, ArrowUpAZ, Palette, Plus, Search } from "lucide-react"
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Badge,
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
import { removeColorReference, updateColorReference } from "@/lib/color-scope-manager"
import type { ColorStyle, FontStyle, SemanticTokenColor } from "@/types"

interface EditDialogProps {
  isOpen: boolean
  isAddingNew: boolean
  initialScope: string
  initialForeground: string
  initialFontStyle: string
  availableColors: Array<[string, ColorStyle]>
  onClose: () => void
  onSave: (scopeName: string, foreground: string, fontStyle: string) => void
}

const EditDialog = memo(({ isOpen, isAddingNew, initialScope, initialForeground, initialFontStyle, availableColors, onClose, onSave }: EditDialogProps) => {
  const scopeInputRef = useRef<HTMLInputElement>(null)
  const [selectedForeground, setSelectedForeground] = useState(initialForeground)
  const [selectedFontStyle, setSelectedFontStyle] = useState(initialFontStyle)

  useEffect(() => {
    if (scopeInputRef.current) {
      scopeInputRef.current.value = initialScope
    }
    setSelectedForeground(initialForeground)
    setSelectedFontStyle(initialFontStyle)
  }, [initialScope, initialForeground, initialFontStyle])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const scopeName = scopeInputRef.current?.value || ""
    onSave(scopeName, selectedForeground, selectedFontStyle)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAddingNew ? "Add Semantic Token" : "Edit Semantic Token"}</DialogTitle>
          <DialogDescription>
            {isAddingNew ? "Create a new semantic token color scope" : "Modify the semantic token color scope"}
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
                placeholder='e.g., variable.readonly'
                autoFocus
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='foreground-select'>Foreground Color</Label>
              <Select value={selectedForeground} onValueChange={setSelectedForeground}>
                <SelectTrigger id='foreground-select'>
                  <SelectValue placeholder='Select foreground color' />
                </SelectTrigger>
                <SelectContent className='max-h-[300px]'>
                  <SelectItem value='__none__'>
                    <span className='text-muted-foreground italic'>None</span>
                  </SelectItem>
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
                    <SelectItem value='' disabled>
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
              <Label htmlFor='fontStyle-select'>Font Style</Label>
              <Select value={selectedFontStyle} onValueChange={setSelectedFontStyle}>
                <SelectTrigger id='fontStyle-select'>
                  <SelectValue placeholder='Select font style' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='__none__'>
                    <span className='text-muted-foreground italic'>None</span>
                  </SelectItem>
                  <SelectItem value='bold'>Bold</SelectItem>
                  <SelectItem value='italic'>Italic</SelectItem>
                  <SelectItem value='underline'>Underline</SelectItem>
                  <SelectItem value='strikethrough'>Strikethrough</SelectItem>
                  <SelectItem value='bold italic'>Bold Italic</SelectItem>
                  <SelectItem value='bold underline'>Bold Underline</SelectItem>
                  <SelectItem value='italic underline'>Italic Underline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant='outline' onClick={onClose} type='button'>
            Cancel
          </Button>
          <Button onClick={() => {
            const scopeName = scopeInputRef.current?.value || ""
            onSave(scopeName, selectedForeground, selectedFontStyle)
          }} type='submit'>
            {isAddingNew ? "Add" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

EditDialog.displayName = "EditDialog"

interface ColorCardProps {
  scope: string
  semanticToken: SemanticTokenColor
  onEdit: (scope: string, semanticToken: SemanticTokenColor) => void
  onDelete: (scope: string, semanticToken: SemanticTokenColor) => void
}

const ColorCard = memo(({ scope, semanticToken, onEdit, onDelete }: ColorCardProps) => (
  <Card className='p-3'>
    <div className='flex items-center gap-3'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex gap-1'>
              {semanticToken.foreground && (
                <ColorCircle
                  color={semanticToken.foreground.value}
                  className='h-8 w-8 shrink-0'
                />
              )}
              {!semanticToken.foreground && (
                <div className='h-8 w-8 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/30' />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {semanticToken.foreground && (
              <>
                <p className='font-medium'>{semanticToken.foreground.name}</p>
                <p className='text-xs text-background/80'>{semanticToken.foreground.value}</p>
              </>
            )}
            {!semanticToken.foreground && (
              <p className='text-xs text-background/80'>No foreground</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-sm truncate'>{scope}</p>
          {semanticToken.fontStyle && (
            <Badge variant='secondary' className='text-xs shrink-0'>
              {semanticToken.fontStyle}
            </Badge>
          )}
        </div>
        <p className='text-xs text-muted-foreground truncate'>
          {semanticToken.foreground ? `${semanticToken.foreground.name} • ${semanticToken.foreground.value}` : "No colors defined"}
        </p>
      </div>
      <div className='flex flex-col gap-2'>
        <EditButton onClick={() => onEdit(scope, semanticToken)} />
        <DeleteButton onClick={() => onDelete(scope, semanticToken)} />
      </div>
    </div>
  </Card>
))

ColorCard.displayName = "ColorCard"

export function SemanticTokensPage() {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScope, setEditingScope] = useState<string | null>(null)
  const [dialogInitialScope, setDialogInitialScope] = useState<string>("")
  const [dialogInitialForeground, setDialogInitialForeground] = useState<string>("")
  const [dialogInitialFontStyle, setDialogInitialFontStyle] = useState<string>("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [sortBy, setSortBy] = useState<"default" | "name">("default")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const semanticTokens = useMemo(() => Array.from(theme?.semanticTokenColors?.entries() || []), [theme?.semanticTokenColors])
  const availableColors = useMemo(() => Array.from(theme?.colorStyles?.entries() || []), [theme?.colorStyles])

  const deferredSearch = useDeferredValue(search)

  const filteredSemanticTokens = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase()
    return semanticTokens.filter(([scope, _semanticToken]) =>
      scope.toLowerCase().includes(searchLower)
    )
  }, [semanticTokens, deferredSearch])

  const groupedTokens = useMemo(() => {
    const groups = new Map<string, Array<[string, typeof semanticTokens[0][1]]>>()

    filteredSemanticTokens.forEach(entry => {
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

    const sortFn = (a: string, b: string) =>
      sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)

    const sortedGroups = new Map(
      Array.from(groups.entries())
        .sort(([a], [b]) => (sortBy === "default" ? sortFn(a, b) : 0))
        .map(([category, entries]) => [category, entries.sort(([a], [b]) => sortFn(a, b))])
    )

    return sortedGroups
  }, [filteredSemanticTokens, sortBy, sortOrder])

  const validateSaveInput = useCallback((scopeName: string, foregroundName: string, fontStyleValue: string): { valid: boolean; foreground?: ColorStyle; fontStyle?: FontStyle } => {
    if (!scopeName.trim()) {
      toast.error("Scope name is required")
      return { valid: false }
    }

    let foreground: ColorStyle | undefined
    if (foregroundName && foregroundName !== "__none__") {
      foreground = theme?.colorStyles?.get(foregroundName)
      if (!foreground) {
        toast.error("Selected foreground color not found")
        return { valid: false }
      }
    }

    let fontStyle: FontStyle | undefined
    if (fontStyleValue && fontStyleValue !== "__none__") {
      fontStyle = fontStyleValue as FontStyle
    }

    if (!foreground && !fontStyle) {
      toast.error("At least one of foreground or font style must be set")
      return { valid: false }
    }

    return { valid: true, foreground, fontStyle }
  }, [theme?.colorStyles])

  const handleScopeRename = useCallback((
    targetScope: string,
    oldSemanticToken?: SemanticTokenColor
  ): Map<string, SemanticTokenColor> => {
    const updatedTokens = new Map(theme?.semanticTokenColors || new Map())
    if (editingScope && editingScope !== targetScope && oldSemanticToken?.foreground) {
      removeColorReference(oldSemanticToken.foreground, editingScope)
      updatedTokens.delete(editingScope)
    }
    return updatedTokens
  }, [theme?.semanticTokenColors, editingScope])

  const handleAdd = useCallback(() => {
    setIsAddingNew(true)
    setEditingScope(null)
    setDialogInitialScope("")
    setDialogInitialForeground(availableColors[0]?.[0] || "")
    setDialogInitialFontStyle("__none__")
    setIsDialogOpen(true)
  }, [availableColors])

  const handleEdit = useCallback((scope: string, currentSemanticToken: SemanticTokenColor) => {
    setIsAddingNew(false)
    setEditingScope(scope)
    setDialogInitialScope(scope)

    const foregroundName = currentSemanticToken.foreground
      ? availableColors.find(([_name, style]) => style === currentSemanticToken.foreground)?.[0] || "__none__"
      : "__none__"
    setDialogInitialForeground(foregroundName)

    setDialogInitialFontStyle(currentSemanticToken.fontStyle || "__none__")
    setIsDialogOpen(true)
  }, [availableColors])

  const handleDelete = useCallback((scope: string, semanticToken: SemanticTokenColor) => {
    if (!theme) {
      return
    }
    if (semanticToken.foreground) {
      removeColorReference(semanticToken.foreground, scope)
    }
    const updatedTokens = new Map(theme.semanticTokenColors)
    updatedTokens.delete(scope)
    setTheme({ ...theme, semanticTokenColors: updatedTokens })
    toast.success(`Deleted ${scope}`)
  }, [theme, setTheme])

  const updateColorReferences = useCallback((
    targetScope: string,
    oldForeground: ColorStyle | undefined,
    newForeground: ColorStyle | undefined
  ) => {
    if (newForeground) {
      updateColorReference(oldForeground, newForeground, targetScope)
    } else if (oldForeground) {
      removeColorReference(oldForeground, targetScope)
    }
  }, [])

  const buildSemanticToken = useCallback((
    foreground: ColorStyle | undefined,
    fontStyle: FontStyle | undefined
  ): SemanticTokenColor => {
    const newSemanticToken: SemanticTokenColor = {}
    if (foreground) {
      newSemanticToken.foreground = foreground
    }
    if (fontStyle) {
      newSemanticToken.fontStyle = fontStyle
    }
    return newSemanticToken
  }, [])

  const handleDialogSave = useCallback((scopeName: string, foregroundName: string, fontStyleValue: string) => {
    if (!theme) {
      return
    }
    const validation = validateSaveInput(scopeName, foregroundName, fontStyleValue)
    if (!validation.valid) {
      return
    }

    const targetScope = scopeName.trim()
    const oldSemanticToken = editingScope ? theme.semanticTokenColors?.get(editingScope) : undefined
    const updatedTokens = handleScopeRename(targetScope, oldSemanticToken)
    const oldForeground = editingScope === targetScope ? oldSemanticToken?.foreground : undefined

    updateColorReferences(targetScope, oldForeground, validation.foreground)
    const newSemanticToken = buildSemanticToken(validation.foreground, validation.fontStyle)
    updatedTokens.set(targetScope, newSemanticToken)

    setTheme({ ...theme, semanticTokenColors: updatedTokens })
    setIsDialogOpen(false)
    toast.success(isAddingNew ? `Added ${targetScope}` : `Updated ${targetScope}`)
  }, [theme, setTheme, editingScope, isAddingNew, validateSaveInput, handleScopeRename, updateColorReferences, buildSemanticToken])

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Semantic Tokens</CardTitle>
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
          <CardTitle>Semantic Tokens</CardTitle>
          <CardDescription>
            Manage VS Code semantic token color scopes. Semantic tokens provide semantic highlighting
            based on language understanding rather than textual patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 flex-1'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search semantic token scopes...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <ToggleGroup type="single" value={sortBy} onValueChange={(value) => value && setSortBy(value as "default" | "name")}>
              <ToggleGroupItem value="default" aria-label="Group by category" variant="outline">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs">Default</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Group by category</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem value="name" aria-label="Sort by name" variant="outline">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs">Name</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sort by name only</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" value={sortOrder} onValueChange={(value) => value && setSortOrder(value as "asc" | "desc")}>
              <ToggleGroupItem value="asc" aria-label="Ascending order" variant="outline">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ArrowUpAZ className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ascending</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem value="desc" aria-label="Descending order" variant="outline">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ArrowDownAZ className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Descending</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              onClick={handleAdd}
              variant='outline'
              size='sm'
              className='h-9 w-9 p-0'
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          <ScrollArea className='flex-1'>
            {filteredSemanticTokens.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Palette className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground'>
                  {search ? "No semantic token scopes match your search" : "No semantic tokens defined"}
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {Array.from(groupedTokens.entries()).map(([category, entries]) => (
                  <div key={category}>
                    {sortBy === "default" && (
                      <h3 className='text-sm font-semibold mb-3 capitalize text-muted-foreground'>
                        {category}
                      </h3>
                    )}
                    <div className='space-y-2'>
                      {entries.map(([scope, semanticToken]) => (
                        <ColorCard
                          key={scope}
                          scope={scope}
                          semanticToken={semanticToken}
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
        initialFontStyle={dialogInitialFontStyle}
        availableColors={availableColors}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
      />
    </>
  )
}
