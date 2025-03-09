import Link from "next/link"
import { cn } from "@/lib/utils"

interface TagBadgeProps {
  name: string
  count?: number
  className?: string
  showCount?: boolean
  size?: "sm" | "md" | "lg"
}

export function TagBadge({ name, count, className, showCount = false, size = "md" }: TagBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  return (
    <Link href={`/questions?tag=${name}`}>
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors",
          sizeClasses[size],
          className,
        )}
      >
        {name}
        {showCount && count !== undefined && <span className="ml-1 text-muted-foreground">×{count}</span>}
      </span>
    </Link>
  )
}

