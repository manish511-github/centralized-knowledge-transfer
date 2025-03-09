import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

// Dummy trending articles data - just titles and IDs
const trendingArticles = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 and Server Components",
  },
  {
    id: "2",
    title: "Understanding TypeScript Generics: A Comprehensive Guide",
  },
  {
    id: "3",
    title: "Building Microservices with Node.js and Docker",
  },
  {
    id: "4",
    title: "Advanced CSS Techniques for Modern Web Design",
  },
  {
    id: "5",
    title: "Introduction to Machine Learning with Python and TensorFlow",
  },
]

export function TrendingArticles() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ul className="space-y-2">
          {trendingArticles.map((article) => (
            <li key={article.id}>
              <Link
                href={`/articles/${article.id}`}
                className="text-sm hover:text-primary hover:underline transition-colors line-clamp-2"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

