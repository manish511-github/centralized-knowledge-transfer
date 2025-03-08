import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import QuestionCard from "@/components/question-card"
import DepartmentFilter from "@/components/department-filter"
import prisma from "@/lib/prisma"

// Update the Home page to filter questions by selected department

// Add searchParams parameter to the component
export default async function Home({
  searchParams,
}: {
  searchParams: { department?: string }
}) {
  // Get department filter from URL
  const departmentFilter = searchParams.department ? searchParams.department.split(",") : []

  // Fetch recent questions from the database with department filter
  const recentQuestions = await prisma.question.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Company Knowledge Hub</h1>
          <p className="text-muted-foreground mt-2">Find answers, share knowledge, collaborate across departments</p>
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
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-4 shadow">
            <h2 className="font-semibold text-lg mb-4">Departments</h2>
            <DepartmentFilter />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-card rounded-lg p-4 shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Recent Questions</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Newest
                </Button>
                <Button variant="ghost" size="sm">
                  Most Answered
                </Button>
                <Button variant="ghost" size="sm">
                  Most Viewed
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {questionsWithVotes.length > 0 ? (
                questionsWithVotes.map((question) => <QuestionCard key={question.id} question={question} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No questions found. Be the first to ask a question!
                </div>
              )}
            </div>
          </div>

          {questionsWithVotes.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline">Load More Questions</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

