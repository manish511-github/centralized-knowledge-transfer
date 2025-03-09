import { ArticleCard, type DummyArticle } from "./article-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Create dummy articles data
const dummyArticles: DummyArticle[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 and Server Components",
    excerpt:
      "Learn how to build modern web applications with Next.js 14 and React Server Components for better performance and developer experience.",
    readTime: 8,
    createdAt: new Date("2023-11-15"),
    tags: ["Next.js", "React", "Web Development"],
    author: {
      name: "Alex Johnson",
      image: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "2",
    title: "Understanding TypeScript Generics: A Comprehensive Guide",
    excerpt:
      "Dive deep into TypeScript generics and learn how to write more reusable and type-safe code for your applications.",
    readTime: 12,
    createdAt: new Date("2023-11-10"),
    tags: ["TypeScript", "JavaScript", "Programming"],
    author: {
      name: "Sarah Chen",
      image: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "3",
    title: "Building Microservices with Node.js and Docker",
    excerpt: "Explore how to design, develop, and deploy microservices using Node.js, Express, and Docker containers.",
    readTime: 15,
    createdAt: new Date("2023-11-05"),
    tags: ["Microservices", "Node.js", "Docker", "Backend"],
    author: {
      name: "Michael Rodriguez",
      image: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "4",
    title: "Advanced CSS Techniques for Modern Web Design",
    excerpt:
      "Discover advanced CSS techniques like Grid, Custom Properties, and CSS Animations to create stunning web interfaces.",
    readTime: 10,
    createdAt: new Date("2023-10-28"),
    tags: ["CSS", "Web Design", "Frontend"],
    author: {
      name: "Emily Parker",
      image: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "5",
    title: "Introduction to Machine Learning with Python and TensorFlow",
    excerpt:
      "Get started with machine learning using Python and TensorFlow. Learn about neural networks, data preprocessing, and model training.",
    readTime: 18,
    createdAt: new Date("2023-10-20"),
    tags: ["Machine Learning", "Python", "TensorFlow", "AI"],
    author: {
      name: "David Kim",
      image: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "6",
    title: "Securing Your Web Applications: Best Practices",
    excerpt:
      "Learn essential security practices to protect your web applications from common vulnerabilities and attacks.",
    readTime: 14,
    createdAt: new Date("2023-10-15"),
    tags: ["Security", "Web Development", "Best Practices"],
    author: {
      name: "Olivia Martinez",
      image: "/placeholder.svg?height=32&width=32",
    },
  },
]

export function LatestArticles() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Latest Technical Articles</h2>
          <p className="text-muted-foreground">Explore the latest technical articles from our community</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">View all articles</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dummyArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}

