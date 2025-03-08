import { getReputationColor, getReputationLevel } from "@/lib/reputation"
import { Award } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ReputationBadgeProps {
  reputation: number
  showLevel?: boolean
  size?: "sm" | "md" | "lg"
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
          <div className={`flex items-center gap-1 ${sizeClasses[size]} font-medium ${reputationColor}`}>
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

