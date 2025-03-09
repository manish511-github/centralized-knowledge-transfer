import Link from "next/link"
import { Search } from "lucide-react"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TagsPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string }
}) {
  // Get query parameters
  const searchQuery = searchParams.q || ""
  const sort = searchParams.sort || "popular"

  // Fetch tags from the database
  const tags = await prisma.tag.findMany({
    where: searchQuery
      ? {
          name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        }
      : {},
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
  })

  // Sort tags based on the selected sort option
  if (sort === "popular") {
    tags.sort((a, b) => b._count.questions - a._count.questions)
  } else if (sort === "name") {
    tags.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === "new") {
    tags.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Group tags by first letter for alphabetical view
  const tagsByLetter: Record<string, typeof tags> = {}
  if (sort === "name") {
    tags.forEach((tag) => {
      const firstLetter = tag.name.charAt(0).toUpperCase()
      if (!tagsByLetter[firstLetter]) {
        tagsByLetter[firstLetter] = []
      }
      tagsByLetter[firstLetter].push(tag)
    })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-2">Browse all {tags.length} tags used across the knowledge platform</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <form>
              <Input
                type="text"
                name="q"
                placeholder="Filter by tag name..."
                className="pl-10"
                defaultValue={searchQuery}
              />
            </form>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Tags</CardTitle>
          <CardDescription>Tags help categorize questions and make them easier to discover</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sort} className="mb-6">
            <TabsList>
              <TabsTrigger value="popular" asChild>
                <Link href={`/tags?sort=popular${searchQuery ? `&q=${searchQuery}` : ""}`}>Popular</Link>
              </TabsTrigger>
              <TabsTrigger value="name" asChild>
                <Link href={`/tags?sort=name${searchQuery ? `&q=${searchQuery}` : ""}`}>Name</Link>
              </TabsTrigger>
              <TabsTrigger value="new" asChild>
                <Link href={`/tags?sort=new${searchQuery ? `&q=${searchQuery}` : ""}`}>New</Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tags.map((tag) => (
                  <TagCard key={tag.id} tag={tag} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="name" className="mt-6">
              {Object.keys(tagsByLetter)
                .sort()
                .map((letter) => (
                  <div key={letter} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{letter}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tagsByLetter[letter].map((tag) => (
                        <TagCard key={tag.id} tag={tag} />
                      ))}
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tags.map((tag) => (
                  <TagCard key={tag.id} tag={tag} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {tags.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No tags found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? `No tags matching "${searchQuery}"` : "There are no tags in the system yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function TagCard({ tag }: { tag: any }) {
  return (
    <Link href={`/questions?tag=${tag.name}`}>
      <div className="border rounded-lg p-4 hover:border-primary transition-colors">
        <div className="flex items-center mb-2">
          <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {tag.name}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {tag._count.questions} {tag._count.questions === 1 ? "question" : "questions"}
        </p>
        {tag.description && <p className="text-sm mt-2">{tag.description}</p>}
      </div>
    </Link>
  )
}

