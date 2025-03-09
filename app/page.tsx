import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Search, ThumbsUp } from "lucide-react"
import QuestionCard from "@/components/question-card"
import DepartmentFilter from "@/components/department-filter"
import SearchQuestions from "@/components/search-questions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the Home page to filter questions by selected department and search query

// Add searchParams parameter to the component
export default async function Home({
  searchParams,
}: {
  searchParams: { department?: string; q?: string }
}) {
  // Get department filter from URL
  const departmentFilter = searchParams.department ? searchParams.department.split(",") : []

  // Get search query from URL
  const searchQuery = searchParams.q || ""

  // Build the base query conditions
  const baseWhereCondition = {
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

    // Add search query if provided
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" } },
            { body: { contains: searchQuery, mode: "insensitive" } },
            {
              tags: {
                some: {
                  name: { contains: searchQuery, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  }

  // Fetch recent questions from the database with filters
  const recentQuestions = await prisma.question.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    where: baseWhereCondition,
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

  // Fetch popular questions (most viewed) with filters
  const popularQuestions = await prisma.question.findMany({
    take: 10,
    orderBy: {
      views: "desc",
    },
    where: baseWhereCondition,
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

  // Get vote counts for popular questions
  const popularQuestionsWithVotes = await Promise.all(
    popularQuestions.map(async (question) => {
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

  // Fetch unanswered questions with filters
  const unansweredQuestions = await prisma.question.findMany({
    take: 10,
    where: {
      ...baseWhereCondition,
      answers: {
        none: {},
      },
    },
    orderBy: {
      createdAt: "desc",
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

  // Get vote counts for unanswered questions
  const unansweredQuestionsWithVotes = await Promise.all(
    unansweredQuestions.map(async (question) => {
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
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Platform</h1>
            <Button asChild>
              <Link href="/ask">Ask a Question</Link>
            </Button>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            A centralized platform for sharing knowledge, asking questions, and finding answers within the organization.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Departments</CardTitle>
                <CardDescription>Filter questions by department</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentFilter />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center gap-4">
              <SearchQuestions />
            </div>

            <Tabs defaultValue="recent">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Questions
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Popular Questions
                </TabsTrigger>
                <TabsTrigger value="unanswered">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Unanswered
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4 mt-4">
                {questionsWithVotes.length > 0 ? (
                  questionsWithVotes.map((question) => <QuestionCard key={question.id} question={question} />)
                ) : (
                  <EmptyState
                    title={searchQuery ? `No results for "${searchQuery}"` : "No questions found"}
                    description={
                      searchQuery
                        ? "Try adjusting your search terms or filters"
                        : "Try adjusting your filters or be the first to ask a question!"
                    }
                  />
                )}

                {questionsWithVotes.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline">Load More Questions</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="space-y-4 mt-4">
                {popularQuestionsWithVotes.length > 0 ? (
                  popularQuestionsWithVotes.map((question) => <QuestionCard key={question.id} question={question} />)
                ) : (
                  <EmptyState
                    title={searchQuery ? `No popular results for "${searchQuery}"` : "No popular questions found"}
                    description={
                      searchQuery
                        ? "Try adjusting your search terms or filters"
                        : "Questions with the most views will appear here."
                    }
                  />
                )}

                {popularQuestionsWithVotes.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline">Load More Questions</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unanswered" className="space-y-4 mt-4">
                {unansweredQuestionsWithVotes.length > 0 ? (
                  unansweredQuestionsWithVotes.map((question) => <QuestionCard key={question.id} question={question} />)
                ) : (
                  <EmptyState
                    title={searchQuery ? `No unanswered results for "${searchQuery}"` : "No unanswered questions"}
                    description={
                      searchQuery
                        ? "Try adjusting your search terms or filters"
                        : "All questions have been answered! Great job team!"
                    }
                  />
                )}

                {unansweredQuestionsWithVotes.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline">Load More Questions</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}

