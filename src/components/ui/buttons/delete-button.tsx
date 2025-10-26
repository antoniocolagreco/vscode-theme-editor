import { Trash2 } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../button"

type DeleteButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "children" | "size">

const DeleteButton: React.FC<DeleteButtonProps> = ({ className, ...rest }) => {
  return (
    <Button
      variant='empty'
      size='sm'
      className={cn(
        "ml-auto h-6 w-6 p-0 text-red-500 hover:text-red-700 cursor-pointer",
        className
      )}
      {...rest}
    >
      <Trash2 className='h-3 w-3' />
    </Button>
  )
}

export { DeleteButton }
