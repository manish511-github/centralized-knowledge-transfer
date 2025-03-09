import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define the Article type for dummy data
export interface DummyArticle {
  id: string
  title: string
  excerpt: string
  readTime: number
  createdAt: Date
  tags: string[]
  author: {
    name: string
    image?: string
  }
}

interface ArticleCardProps {
  article: DummyArticle
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={article.author.image} alt={article.author.name} />
            <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{article.author.name}</span>
        </div>
        <Link href={`/articles/${article.id}`} className="block">
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">{article.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 p-4">
        <span className="text-xs text-muted-foreground">{article.readTime} min read</span>
        <span className="text-xs text-muted-foreground">
          {new Date(article.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </CardFooter>
    </Card>
  )
}

