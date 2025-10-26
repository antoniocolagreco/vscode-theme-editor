import { Palette, Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AddButton,
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
} from "@/components/ui"
import { useTheme } from "@/context"
import type { ColorStyle } from "@/types"

export function ColorsPage() {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<ColorStyle | null>(null)
  const [colorName, setColorName] = useState("")
  const [colorValue, setColorValue] = useState("#000000")

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
  }

  const colorStyles = Array.from(theme.colorStyles?.entries() || []).reverse()
  const filteredColors = colorStyles.filter(
    ([name, style]) =>
      name.toLowerCase().includes(search.toLowerCase()) ||
      style.value.toLowerCase().includes(search.toLowerCase())
  )

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

  const handleSave = () => {
    if (!colorName.trim()) {
      toast.error("Color name is required")
      return
    }

    const newColorStyles = new Map(theme.colorStyles || new Map())

    // If editing, remove old entry
    if (editingColor) {
      const oldName = Array.from(newColorStyles.entries()).find(
        ([_k, v]) => v === editingColor
      )?.[0]
      if (oldName) {
        newColorStyles.delete(oldName)
      }
    }

    // Add or update
    newColorStyles.set(colorName, { name: colorName, value: colorValue })
    setTheme({ ...theme, colorStyles: newColorStyles })
    setIsDialogOpen(false)
    toast.success(editingColor ? "Color updated" : "Color added")
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Color Styles</CardTitle>
          <CardDescription>
            Manage the color palette for your theme. Changes cascade to all scopes using these
            colors.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search colors...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <AddButton onClick={handleAdd} />
          </div>

          <ScrollArea className='h-[600px] pr-4'>
            {filteredColors.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Palette className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground'>
                  {search ? "No colors match your search" : "No colors defined yet"}
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {filteredColors.map(([name, style]) => (
                  <Card key={name} className='p-4'>
                    <div className='flex items-center gap-4'>
                      <ColorCircle color={style.value} className='h-10 w-10 shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium truncate'>{name}</p>
                        <p className='text-sm text-muted-foreground truncate'>{style.value}</p>
                      </div>
                      <div className='flex gap-2'>
                        <EditButton onClick={() => handleEdit(name, style)} />
                        <DeleteButton onClick={() => handleDelete(name)} />
                      </div>
                    </div>
                  </Card>
                ))}
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
                onChange={color => {
                  try {
                    if (Array.isArray(color)) {
                      const [r, g, b, a] = color
                      if (
                        typeof r === "number" &&
                        typeof g === "number" &&
                        typeof b === "number" &&
                        typeof a === "number"
                      ) {
                        const colorValue =
                          a < 1
                            ? `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
                            : `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`
                        setColorValue(colorValue)
                      }
                    }
                  } catch (error) {
                    console.error("Error setting color:", error)
                    toast.error("Invalid color format")
                  }
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
    </div>
  )
}
