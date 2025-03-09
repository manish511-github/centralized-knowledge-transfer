import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import QuestionCard from "@/components/question-card"
import DepartmentFilter from "@/components/department-filter"
import QuestionSortTabs from "@/components/question-sort-tabs"
import prisma from "@/lib/prisma"
import { searchQuestions } from "@/app/actions/search-actions"

export default async function Home({
  searchParams,
}: {
  searchParams: { department?: string; sort?: string; page?: string }
}) {
  // Get department filter from URL
  const departmentFilter = searchParams.department ? searchParams.department.split(",") : []
  // Get sort method from URL
  const sortMethod = searchParams.sort || "newest"

  // Get page number from URL
  const page = Number.parseInt(searchParams.page || "1", 10)
  const limit = 10
  const skip = (page - 1) * limit

  // Determine sort order based on sortMethod
  let orderBy: any = { createdAt: "desc" }

  // For most-viewed, we can directly order by the views field
  if (sortMethod === "most-viewed") {
    orderBy = [{ views: "desc" }, { createdAt: "desc" }]
  }

  // For most-answered, we'll sort after fetching the data

  // Fetch recent questions from the database with department filter and sorting
  const recentQuestions = await prisma.question.findMany({
    skip,
    take: limit,
    orderBy,
    where: {
      // Add department filter if departments are selected
      ...(departmentFilter.length > 0
        ? {
            author: {
              department: {
                in: departmentFilter,
              },
            },
          }
        : {}),
    },
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
  })

  // Get vote counts for each question
  const questionsWithVotes = await Promise.all(
    recentQuestions.map(async (question) => {
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

  // Sort by answer count if most-answered is selected
  if (sortMethod === "most-answered") {
    questionsWithVotes.sort((a, b) => {
      // First sort by answer count (descending)
      if (b.answers !== a.answers) {
        return b.answers - a.answers
      }
      // If answer counts are equal, sort by creation date (descending)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  // Get total count of questions matching the filter
  const totalQuestions = await prisma.question.count({
    where: {
      ...(departmentFilter.length > 0
        ? {
            author: {
              department: {
                in: departmentFilter,
              },
            },
          }
        : {}),
    },
  })

  const totalPages = Math.ceil(totalQuestions / limit)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Company Knowledge Hub</h1>
            <p className="text-muted-foreground mt-2">Find answers, share knowledge, collaborate across departments</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <form action={searchQuestions} className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Search questions..."
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="sr-only">
                Search
              </button>
            </form>
            <Button asChild>
              <Link href="/ask">Ask Question</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-4 shadow">
            <h2 className="font-semibold text-lg mb-4">Departments</h2>
            <DepartmentFilter />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-card rounded-lg p-4 shadow mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h2 className="font-semibold text-lg">Recent Questions</h2>
              <QuestionSortTabs />
            </div>

            <div className="space-y-4">
              {questionsWithVotes.length > 0 ? (
                questionsWithVotes.map((question) => <QuestionCard key={question.id} question={question} />)
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <div className="p-6 space-y-3">
                    <p className="text-muted-foreground">No questions found with the current filters.</p>
                    {departmentFilter.length > 0 && (
                      <p className="text-sm text-muted-foreground">Try removing some department filters.</p>
                    )}
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/ask">Ask a Question</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {questionsWithVotes.length > 0 && page < totalPages && (
            <div className="flex justify-center">
              <Link
                href={{
                  pathname: "/",
                  query: {
                    ...searchParams,
                    page: page + 1,
                  },
                }}
              >
                <Button variant="outline">Load More Questions</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

