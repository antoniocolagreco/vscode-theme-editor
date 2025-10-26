import { cn } from "@/lib/utils"
import { Badge } from "../badge"

type AndPillProps = React.ComponentProps<typeof Badge>

const AndPill: React.FC<AndPillProps> = ({ className, ...rest }) => {
  return (
    <Badge
      variant='outline'
      className={cn(`from-yellow-500 to-yellow-300 bg-linear-330`, className)}
      {...rest}
    >
      AND
    </Badge>
  )
}
export { AndPill }
