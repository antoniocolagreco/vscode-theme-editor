import { Plus } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../button"

type AddButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "children" | "size">

const AddButton: React.FC<AddButtonProps> = ({ className, ...rest }) => {
  return (
    <Button
      variant='empty'
      size='sm'
      className={cn("h-6 w-6 p-0 cursor-pointer", className)}
      {...rest}
    >
      <Plus className='h-3 w-3' />
    </Button>
  )
}

export { AddButton }
