import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowUp, ArrowDown, Eye } from "lucide-react"

interface QuestionCardProps {
  question: {
    id: string
    title: string
    body: string
    author: {
      name: string
      department: string | null
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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="border rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex gap-4">
        <div className="hidden sm:flex flex-col items-center gap-1 min-w-16">
          <div className="flex items-center gap-1 text-muted-foreground">
            <ArrowUp size={16} />
            <ArrowDown size={16} />
            <span className="font-medium">{question.votes}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare size={16} />
            <span>{question.answers}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye size={16} />
            <span>{question.views}</span>
          </div>
        </div>

        <div className="flex-1">
          <Link href={`/questions/${question.id}`}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">{question.title}</h3>
          </Link>
          <p className="text-muted-foreground mt-1 line-clamp-2">{question.body}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {question.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex sm:hidden items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <ArrowUp size={16} />
                <ArrowDown size={16} />
                <span>{question.votes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={16} />
                <span>{question.answers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{question.views}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-muted-foreground">{formatDate(question.createdAt)}</span>
              <span className="font-medium">{question.author.name}</span>
              <span className="text-muted-foreground">{question.author.department}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

