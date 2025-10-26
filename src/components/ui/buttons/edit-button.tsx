import { PencilIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../button"

type EditButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "children" | "size">

const EditButton: React.FC<EditButtonProps> = ({ className, ...rest }) => {
  return (
    <Button
      variant='empty'
      size='sm'
      className={cn("h-6 w-6 p-0 cursor-pointer", className)}
      {...rest}
    >
      <PencilIcon className='h-3 w-3' />
    </Button>
  )
}

export { EditButton }
