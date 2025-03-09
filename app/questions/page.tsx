import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import QuestionCard from "@/components/question-card"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: { tag?: string; sort?: string }
}) {
  // Get query parameters
  const tag = searchParams.tag
  const sort = searchParams.sort || "newest"

  // Build the query
  const where = tag ? { tags: { some: { name: tag } } } : {}

  // Determine the sort order
  let orderBy: any = { createdAt: "desc" }
  if (sort === "votes") {
    // For votes, we'll handle sorting after fetching
  } else if (sort === "answers") {
    orderBy = [{ answers: { _count: "desc" } }, { createdAt: "desc" }]
  } else if (sort === "views") {
    orderBy = [{ views: "desc" }, { createdAt: "desc" }]
  }

  // Fetch questions from the database
  const questions = await prisma.question.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          department: true,
          reputation: true,
        },
      },
      tags: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
    orderBy,
    take: 20,
  })

  // Get vote counts for each question
  const questionsWithVotes = await Promise.all(
    questions.map(async (question) => {
      const votes = await prisma.vote.aggregate({
        where: {
          questionId: question.id,
        },
        _sum: {
          value: true,
        },
      })

      return {
        ...question,
        votes: votes._sum.value || 0,
        views: question.views,
        answers: question._count.answers,
      }
    }),
  )

  // Sort by votes if needed
  if (sort === "votes") {
    questionsWithVotes.sort((a, b) => b.votes - a.votes)
  }

  // Fetch popular tags
  const popularTags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: {
      questions: {
        _count: "desc",
      },
    },
    take: 10,
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Questions</h1>
          <p className="text-muted-foreground mt-2">Browse questions from across the company</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button asChild>
            <Link href="/ask">Ask Question</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/questions?tag=${tag.name}`}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tag.name === searchParams.tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tag.name} ({tag._count.questions})
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Help Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Need help with using the Knowledge Platform?</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Questions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={sort || "newest"} className="mb-6">
                <TabsList>
                  <TabsTrigger value="newest" asChild>
                    <Link href="/questions?sort=newest">Newest</Link>
                  </TabsTrigger>
                  <TabsTrigger value="votes" asChild>
                    <Link href="/questions?sort=votes">Most Votes</Link>
                  </TabsTrigger>
                  <TabsTrigger value="answers" asChild>
                    <Link href="/questions?sort=answers">Most Answered</Link>
                  </TabsTrigger>
                  <TabsTrigger value="views" asChild>
                    <Link href="/questions?sort=views">Most Viewed</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                {questionsWithVotes.length > 0 ? (
                  questionsWithVotes.map((question) => <QuestionCard key={question.id} question={question} />)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions found. Be the first to ask a question!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

