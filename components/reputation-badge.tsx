import { getReputationColor, getReputationLevel } from "@/lib/reputation"
import { Award } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ReputationBadgeProps {
  reputation: number
  showLevel?: boolean
  size?: "xs" | "sm" | "md" | "lg"
}

const getSizeClass = (size: ReputationBadgeProps["size"]) => {
  switch (size) {
    case "xs":
      return "h-4 text-[9px] px-1"
    case "sm":
      return "h-5 text-xs px-1.5"
    case "lg":
      return "h-8 text-sm px-2.5"
    case "md":
    default:
      return "h-6 text-xs px-2"
  }
}

export default function ReputationBadge({ reputation, showLevel = false, size = "md" }: ReputationBadgeProps) {
  const reputationColor = getReputationColor(reputation)
  const reputationLevel = getReputationLevel(reputation)

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${getSizeClass(size)} font-medium ${reputationColor}`}>
            <Award size={size === "sm" ? 14 : size === "md" ? 16 : 18} className="inline-block" />
            <span>{reputation.toLocaleString()}</span>
            {showLevel && <span className="ml-1">• {reputationLevel}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reputation: {reputation.toLocaleString()}</p>
          <p>Level: {reputationLevel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

