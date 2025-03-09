import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import prisma from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
  })

  if (!article) {
    return {
      title: "Article Not Found",
    }
  }

  return {
    title: article.title,
    description: article.excerpt || undefined,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  if (!article) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-8">
      <article className="space-y-8">
        <PageHeader heading={article.title} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={article.author.image || ""} alt={article.author.name || "Author"} />
              <AvatarFallback>{article.author.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{article.author.name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {article.readTime && <span className="text-sm text-muted-foreground">{article.readTime} min read</span>}
          </div>
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base lg:prose-lg">
          {/* In a real app, you'd want to use a markdown renderer here */}
          <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br />") }} />
        </div>
      </article>
    </div>
  )
}

