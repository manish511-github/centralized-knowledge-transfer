import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import prisma from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import QuestionCard from "@/components/question-card"

export default async function UserProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    include: {
      _count: {
        select: {
          questions: true,
          answers: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // Fetch user's questions
  const questions = await prisma.question.findMany({
    where: {
      authorId: user.id,
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
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
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
      }
    }),
  )

  // Fetch user's answers
  const answers = await prisma.answer.findMany({
    where: {
      authorId: user.id,
    },
    include: {
      question: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Get vote counts for each answer
  const answersWithVotes = await Promise.all(
    answers.map(async (answer) => {
      const votes = await prisma.vote.aggregate({
        where: {
          answerId: answer.id,
        },
        _sum: {
          value: true,
        },
      })

      return {
        ...answer,
        votes: votes._sum.value || 0,
      }
    }),
  )

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="text-2xl">{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.role && (
                  <Badge variant="outline" className="mt-2">
                    {user.role}
                  </Badge>
                )}
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold">{user.reputation}</div>
                  <div className="text-sm text-muted-foreground">Reputation</div>
                </div>
                <div className="flex justify-around w-full mt-6">
                  <div className="text-center">
                    <div className="text-xl font-bold">{user._count.questions}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{user._count.answers}</div>
                    <div className="text-sm text-muted-foreground">Answers</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.department && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  Member for{" "}
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: false,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="questions">
            <TabsList>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="answers">Answers</TabsTrigger>
            </TabsList>
            <TabsContent value="questions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Questions</CardTitle>
                  <CardDescription>Questions asked by {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {questionsWithVotes.length > 0 ? (
                    <div className="space-y-4">
                      {questionsWithVotes.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                      {user._count.questions > 5 && (
                        <div className="text-center mt-4">
                          <Button variant="outline" asChild>
                            <Link href={`/search?author=${user.id}&type=question`}>
                              View all {user._count.questions} questions
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {user.name} hasn't asked any questions yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="answers" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Answers</CardTitle>
                  <CardDescription>Answers provided by {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {answersWithVotes.length > 0 ? (
                    <div className="space-y-4">
                      {answersWithVotes.map((answer) => (
                        <div key={answer.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                          <Link href={`/questions/${answer.questionId}#answer-${answer.id}`}>
                            <h3 className="font-medium mb-2">{answer.question.title}</h3>
                            <div className="text-sm text-muted-foreground mb-3">
                              Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                            </div>
                            <div className="text-sm line-clamp-2">
                              {answer.content.substring(0, 200)}
                              {answer.content.length > 200 ? "..." : ""}
                            </div>
                            <div className="mt-2 flex items-center text-sm">
                              <Badge variant="outline" className="mr-2">
                                {answer.votes} votes
                              </Badge>
                              {answer.isAccepted && <Badge variant="success">Accepted</Badge>}
                            </div>
                          </Link>
                        </div>
                      ))}
                      {user._count.answers > 5 && (
                        <div className="text-center mt-4">
                          <Button variant="outline" asChild>
                            <Link href={`/search?author=${user.id}&type=answer`}>
                              View all {user._count.answers} answers
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {user.name} hasn't answered any questions yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

