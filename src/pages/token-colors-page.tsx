import { Code, Plus, Search } from "lucide-react"
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
    const [selectedForeground, setSelectedForeground] = useState(initialForeground)
    const [selectedBackground, setSelectedBackground] = useState(initialBackground)
    const [selectedFontStyle, setSelectedFontStyle] = useState<FontStyle | "none">(
      initialFontStyle || "none"
    )

    useEffect(() => {
      if (scopeInputRef.current) {
        scopeInputRef.current.value = initialScope
      }
      setSelectedForeground(initialForeground)
      setSelectedBackground(initialBackground)
      setSelectedFontStyle(initialFontStyle || "none")
    }, [initialScope, initialForeground, initialBackground, initialFontStyle])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const scopeName = scopeInputRef.current?.value || ""
      const fontStyle = selectedFontStyle === "none" ? undefined : selectedFontStyle
      onSave(scopeName, selectedForeground, selectedBackground, fontStyle)
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddingNew ? "Add Token Color" : "Edit Token Color"}</DialogTitle>
            <DialogDescription>
              {isAddingNew
                ? "Create a new token color scope"
                : "Modify the token color scope"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope-name">Scope Name</Label>
                <Input
                  ref={scopeInputRef}
                  id="scope-name"
                  defaultValue={initialScope}
                  placeholder="e.g., comment, string, keyword"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foreground-select">Foreground Color</Label>
                  <Select value={selectedForeground} onValueChange={setSelectedForeground}>
                    <SelectTrigger id="foreground-select">
                      <SelectValue placeholder="Select foreground" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="">None</SelectItem>
                      {availableColors.slice(0, 100).map(([name, style]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <ColorCircle color={style.value} className="h-4 w-4" />
                            <span>{name}</span>
                            <span className="text-muted-foreground text-xs">
                              • {style.value}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {availableColors.length > 100 && (
                        <SelectItem value="" disabled>
                          ... and {availableColors.length - 100} more colors
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableColors.length > 100 && (
                    <p className="text-xs text-muted-foreground">
                      Showing first 100 colors. Use search in Colors page to find more.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background-select">Background Color</Label>
                  <Select value={selectedBackground} onValueChange={setSelectedBackground}>
                    <SelectTrigger id="background-select">
                      <SelectValue placeholder="Select background" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="">None</SelectItem>
                      {availableColors.slice(0, 100).map(([name, style]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <ColorCircle color={style.value} className="h-4 w-4" />
                            <span>{name}</span>
                            <span className="text-muted-foreground text-xs">
                              • {style.value}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {availableColors.length > 100 && (
                        <SelectItem value="" disabled>
                          ... and {availableColors.length - 100} more colors
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableColors.length > 100 && (
                    <p className="text-xs text-muted-foreground">
                      Showing first 100 colors. Use search in Colors page to find more.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-style-select">Font Style</Label>
                <Select
                  value={selectedFontStyle}
                  onValueChange={(value) => setSelectedFontStyle(value as FontStyle | "none")}
                >
                  <SelectTrigger id="font-style-select">
                    <SelectValue placeholder="Select font style" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_STYLES.map((style) => (
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
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              onClick={() => {
                const scopeName = scopeInputRef.current?.value || ""
                const fontStyle = selectedFontStyle === "none" ? undefined : selectedFontStyle
                onSave(scopeName, selectedForeground, selectedBackground, fontStyle)
              }}
              type="submit"
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

const ColorCard = memo(({ scope, tokenColor, onEdit, onDelete }: ColorCardProps) => (
  <Card className="p-3">
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {tokenColor.foreground && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ColorCircle
                    color={tokenColor.foreground.value}
                    className="h-8 w-8 shrink-0"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Foreground: {tokenColor.foreground.name}</p>
                <p className="text-xs text-background/80">{tokenColor.foreground.value}</p>
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
                    className="h-8 w-8 shrink-0 ring-2 ring-border"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Background: {tokenColor.background.name}</p>
                <p className="text-xs text-background/80">{tokenColor.background.value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{scope}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {tokenColor.foreground && (
            <span className="truncate">
              FG: {tokenColor.foreground.name} • {tokenColor.foreground.value}
            </span>
          )}
          {tokenColor.background && (
            <span className="truncate">
              BG: {tokenColor.background.name} • {tokenColor.background.value}
            </span>
          )}
          {tokenColor.fontStyle && (
            <span className="truncate font-semibold">{tokenColor.fontStyle}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <EditButton onClick={() => onEdit(scope, tokenColor)} />
        <DeleteButton onClick={() => onDelete(scope)} />
      </div>
    </div>
  </Card>
))

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
          <p className="text-sm text-muted-foreground">
            Please load a theme from the Theme Editor page first.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Token Colors</CardTitle>
          <CardDescription>
            Manage syntax highlighting token color scopes. Each scope controls colors for
            specific code elements like comments, strings, and keywords.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search token scopes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleAdd} variant="outline" size="sm" className="h-9 w-9 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {filteredTokenColors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Code className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {search ? "No token scopes match your search" : "No token colors defined"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTokenColors.map(([scope, tokenColor]) => (
                  <ColorCard
                    key={scope}
                    scope={scope}
                    tokenColor={tokenColor}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
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
