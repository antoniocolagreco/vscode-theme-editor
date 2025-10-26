import { ArrowDownAZ, ArrowUpAZ, Palette, Plus, Search } from "lucide-react"
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
import { removeColorReference, updateColorReference } from "@/lib/color-scope-manager"
import type { ColorStyle, UIColor } from "@/types"

interface EditDialogProps {
  isOpen: boolean
  isAddingNew: boolean
  initialScope: string
  initialColorName: string
  availableColors: Array<[string, ColorStyle]>
  onClose: () => void
  onSave: (scopeName: string, colorName: string) => void
}

const EditDialog = memo(({ isOpen, isAddingNew, initialScope, initialColorName, availableColors, onClose, onSave }: EditDialogProps) => {
  const scopeInputRef = useRef<HTMLInputElement>(null)
  const [selectedColorName, setSelectedColorName] = useState(initialColorName)

  // Update input value and select when props change
  useEffect(() => {
    if (scopeInputRef.current) {
      scopeInputRef.current.value = initialScope
    }
    setSelectedColorName(initialColorName)
  }, [initialScope, initialColorName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const scopeName = scopeInputRef.current?.value || ""
    onSave(scopeName, selectedColorName)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAddingNew ? "Add UI Color" : "Edit UI Color"}</DialogTitle>
          <DialogDescription>
            {isAddingNew ? "Create a new UI color scope" : "Modify the UI color scope"}
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
                placeholder='e.g., editor.background'
                autoFocus
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='color-select'>Color Style</Label>
              <Select value={selectedColorName} onValueChange={setSelectedColorName}>
                <SelectTrigger id='color-select'>
                  <SelectValue placeholder='Select a color' />
                </SelectTrigger>
                <SelectContent className='max-h-[300px]'>
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
          </div>
        </form>
        <DialogFooter>
          <Button variant='outline' onClick={onClose} type='button'>
            Cancel
          </Button>
          <Button onClick={() => {
            const scopeName = scopeInputRef.current?.value || ""
            onSave(scopeName, selectedColorName)
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
  uiColor: UIColor
  onEdit: (scope: string, colorStyle: ColorStyle) => void
  onDelete: (scope: string, colorStyle: ColorStyle) => void
}

const ColorCard = memo(({ scope, uiColor, onEdit, onDelete }: ColorCardProps) => (
  <Card className='p-3'>
    <div className='flex items-center gap-3'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ColorCircle
                color={uiColor.colorStyle.value}
                className='h-8 w-8 shrink-0'
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className='font-medium'>{uiColor.colorStyle.name}</p>
            <p className='text-xs text-background/80'>{uiColor.colorStyle.value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className='flex-1 min-w-0'>
        <p className='font-medium text-sm truncate'>{scope}</p>
        <p className='text-xs text-muted-foreground truncate'>
          {uiColor.colorStyle.name} • {uiColor.colorStyle.value}
        </p>
      </div>
      <div className='flex flex-col gap-2'>
        <EditButton onClick={() => onEdit(scope, uiColor.colorStyle)} />
        <DeleteButton onClick={() => onDelete(scope, uiColor.colorStyle)} />
      </div>
    </div>
  </Card>
))

ColorCard.displayName = "ColorCard"

export function UIColorsPage() {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScope, setEditingScope] = useState<string | null>(null)
  const [dialogInitialScope, setDialogInitialScope] = useState<string>("")
  const [dialogInitialColor, setDialogInitialColor] = useState<string>("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [sortBy, setSortBy] = useState<"default" | "name">("default")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const uiColors = useMemo(() => Array.from(theme?.colors?.entries() || []), [theme?.colors])
  const availableColors = useMemo(() => Array.from(theme?.colorStyles?.entries() || []), [theme?.colorStyles])

  // Defer search to avoid blocking dialog input
  const deferredSearch = useDeferredValue(search)

  const filteredUIColors = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase()
    return uiColors.filter(([scope, _uiColor]) =>
      scope.toLowerCase().includes(searchLower)
    )
  }, [uiColors, deferredSearch])

  // Group UI colors by category (first part before the dot)
  const groupedColors = useMemo(() => {
    const groups = new Map<string, Array<[string, typeof uiColors[0][1]]>>()

    filteredUIColors.forEach(entry => {
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
  }, [filteredUIColors, sortBy, sortOrder])

  const validateSaveInput = useCallback((scopeName: string, selectedColorName: string): { valid: boolean; colorStyle?: ColorStyle } => {
    if (!scopeName.trim()) {
      toast.error("Scope name is required")
      return { valid: false }
    }
    if (!selectedColorName) {
      toast.error("Please select a color")
      return { valid: false }
    }
    const colorStyle = theme?.colorStyles?.get(selectedColorName)
    if (!colorStyle) {
      toast.error("Selected color not found")
      return { valid: false }
    }
    return { valid: true, colorStyle }
  }, [theme?.colorStyles])

  const handleScopeRename = useCallback((
    targetScope: string,
    oldUIColor?: UIColor
  ): Map<string, UIColor> => {
    const updatedColors = new Map(theme?.colors || new Map())
    if (editingScope && editingScope !== targetScope && oldUIColor) {
      removeColorReference(oldUIColor.colorStyle, editingScope)
      updatedColors.delete(editingScope)
    }
    return updatedColors
  }, [theme?.colors, editingScope])

  const handleAdd = useCallback(() => {
    setIsAddingNew(true)
    setEditingScope(null)
    setDialogInitialScope("")
    setDialogInitialColor(availableColors[0]?.[0] || "")
    setIsDialogOpen(true)
  }, [availableColors])

  const handleEdit = useCallback((scope: string, currentColorStyle: ColorStyle) => {
    setIsAddingNew(false)
    setEditingScope(scope)
    setDialogInitialScope(scope)
    const colorName = availableColors.find(([_name, style]) => style === currentColorStyle)?.[0] || ""
    setDialogInitialColor(colorName)
    setIsDialogOpen(true)
  }, [availableColors])

  const handleDelete = useCallback((scope: string, colorStyle: ColorStyle) => {
    if (!theme) {
      return
    }
    removeColorReference(colorStyle, scope)
    const updatedColors = new Map(theme.colors)
    updatedColors.delete(scope)
    setTheme({ ...theme, colors: updatedColors })
    toast.success(`Deleted ${scope}`)
  }, [theme, setTheme])

  const handleDialogSave = useCallback((scopeName: string, selectedColorName: string) => {
    if (!theme) {
      return
    }
    const validation = validateSaveInput(scopeName, selectedColorName)
    if (!validation.valid || !validation.colorStyle) {
      return
    }

    const targetScope = scopeName.trim()
    const oldUIColor = editingScope ? theme.colors.get(editingScope) : undefined
    const updatedColors = handleScopeRename(targetScope, oldUIColor)
    const oldColorStyle = editingScope === targetScope ? oldUIColor?.colorStyle : undefined

    updateColorReference(oldColorStyle, validation.colorStyle, targetScope)
    updatedColors.set(targetScope, { colorStyle: validation.colorStyle })

    setTheme({ ...theme, colors: updatedColors })
    setIsDialogOpen(false)
    toast.success(isAddingNew ? `Added ${targetScope}` : `Updated ${targetScope}`)
  }, [theme, setTheme, editingScope, isAddingNew, validateSaveInput, handleScopeRename])

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>UI Colors</CardTitle>
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
          <CardTitle>UI Colors</CardTitle>
          <CardDescription>
            Manage VS Code UI color scopes. Each scope controls a specific part of the editor
            interface.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 flex-1'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search UI scopes...'
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
            {filteredUIColors.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Palette className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground'>
                  {search ? "No UI scopes match your search" : "No UI colors defined"}
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {Array.from(groupedColors.entries()).map(([category, entries]) => (
                  <div key={category}>
                    {sortBy === "default" && (
                      <h3 className='text-sm font-semibold mb-3 capitalize text-muted-foreground'>
                        {category}
                      </h3>
                    )}
                    <div className='space-y-2'>
                      {entries.map(([scope, uiColor]) => (
                        <ColorCard
                          key={scope}
                          scope={scope}
                          uiColor={uiColor}
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
        initialColorName={dialogInitialColor}
        availableColors={availableColors}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
      />
    </>
  )
}
