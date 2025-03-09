import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenLine } from "lucide-react"

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Technical Articles</h1>
            <Button asChild>
              <Link href="/articles/create">
                <PenLine className="mr-2 h-4 w-4" />
                Write Article
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Share your technical knowledge and insights with the community.
          </p>
        </header>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">The articles feature is currently under development.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

