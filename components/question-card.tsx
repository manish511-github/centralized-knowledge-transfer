import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ArrowUp, ArrowDown, Eye, Clock, Tag } from "lucide-react"
import ReputationBadge from "@/components/reputation-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuestionCardProps {
  question: {
    id: string
    title: string
    body: string
    author: {
      name: string
      image?: string | null
      department: string | null
      reputation?: number
    }
    votes: number
    answers: number
    views: number
    tags: { id: string; name: string }[]
    createdAt: Date
  }
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return diffMinutes === 0 ? "Just now" : `${diffMinutes}m ago`
      }
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
  }

  // Extract first letter of name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Truncate body text to a specific length
  const truncateBody = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-sm hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Stats Column */}
          <div className="hidden sm:flex flex-col items-center gap-3 min-w-16">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ArrowUp className="text-green-500" size={16} />
                      <ArrowDown className="text-red-500" size={16} />
                    </div>
                    <span
                      className={`font-medium ${question.votes > 0 ? "text-green-600" : question.votes < 0 ? "text-red-600" : ""}`}
                    >
                      {question.votes}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vote count</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <MessageSquare
                      size={16}
                      className={question.answers > 0 ? "text-blue-500" : "text-muted-foreground"}
                    />
                    <span className={`${question.answers > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
                      {question.answers}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{question.answers === 1 ? "1 answer" : `${question.answers} answers`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <Eye size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{question.views}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{question.views === 1 ? "1 view" : `${question.views} views`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Link href={`/questions/${question.id}`} className="block group">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {question.title}
              </h3>
            </Link>

            <p className="text-muted-foreground text-sm mt-1.5 line-clamp-2">{truncateBody(question.body)}</p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {question.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="px-1.5 py-0.5 text-xs bg-primary/10 hover:bg-primary/20"
                >
                  <Tag size={10} className="mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Mobile Stats */}
            <div className="flex sm:hidden items-center gap-4 text-muted-foreground mt-2 text-xs">
              <div className="flex items-center gap-1">
                <ArrowUp size={14} className="text-green-500" />
                <ArrowDown size={14} className="text-red-500" />
                <span className={`${question.votes > 0 ? "text-green-600" : question.votes < 0 ? "text-red-600" : ""}`}>
                  {question.votes}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} className={question.answers > 0 ? "text-blue-500" : ""} />
                <span className={question.answers > 0 ? "text-blue-600" : ""}>{question.answers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{question.views}</span>
              </div>
            </div>

            {/* Author and Time */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground">{formatDate(question.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end text-xs">
                  <span className="font-medium">{question.author.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{question.author.department}</span>
                    {question.author.reputation !== undefined && (
                      <ReputationBadge reputation={question.author.reputation} size="xs" />
                    )}
                  </div>
                </div>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.author.image || undefined} alt={question.author.name} />
                  <AvatarFallback className="text-xs">{getInitials(question.author.name)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

