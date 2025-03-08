import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, FileText, ThumbsUp, ThumbsDown, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function UserActivity({ params }: { params: { id: string } }) {
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Fetch user's questions with votes
  const questions = await prisma.question.findMany({
    where: { authorId: user.id },
    include: {
      tags: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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

  // Fetch user's answers with votes
  const answers = await prisma.answer.findMany({
    where: { authorId: user.id },
    include: {
      question: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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

  // Fetch votes cast by user
  const votesCast = await prisma.vote.findMany({
    where: { userId: user.id },
    include: {
      question: {
        select: {
          id: true,
          title: true,
        },
      },
      answer: {
        select: {
          id: true,
          question: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Link href={`/users/${user.id}`} className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to {user.name}'s profile
        </Link>
        <h1 className="text-3xl font-bold mt-4">{user.name}'s Activity</h1>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  ...questionsWithVotes.map((q) => ({ type: "question", data: q, date: q.createdAt })),
                  ...answersWithVotes.map((a) => ({ type: "answer", data: a, date: a.createdAt })),
                  ...votesCast.map((v) => ({ type: "vote", data: v, date: v.createdAt })),
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((activity, index) => {
                    if (activity.type === "question") {
                      const question = activity.data
                      return (
                        <div key={`q-${question.id}`} className="flex gap-4 p-4 border-b last:border-0">
                          <div className="flex-shrink-0 mt-1">
                            <FileText size={18} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <Link
                                href={`/questions/${question.id}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-1"
                              >
                                Asked: {question.title}
                              </Link>
                              <span className="text-sm whitespace-nowrap text-muted-foreground">
                                {formatDate(question.createdAt)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {question.tags.map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ThumbsUp size={14} />
                                {question.votes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {question._count.answers}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    } else if (activity.type === "answer") {
                      const answer = activity.data
                      return (
                        <div key={`a-${answer.id}`} className="flex gap-4 p-4 border-b last:border-0">
                          <div className="flex-shrink-0 mt-1">
                            <MessageSquare size={18} className="text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <Link
                                href={`/questions/${answer.question.id}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-1"
                              >
                                Answered: {answer.question.title}
                              </Link>
                              <span className="text-sm whitespace-nowrap text-muted-foreground">
                                {formatDate(answer.createdAt)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm line-clamp-2 text-muted-foreground">{answer.body}</div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <ThumbsUp size={14} />
                                {answer.votes}
                              </span>
                              {answer.isAccepted && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle2 size={14} />
                                  Accepted
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    } else {
                      const vote = activity.data
                      const isQuestion = !!vote.questionId
                      const title = isQuestion ? vote.question?.title : vote.answer?.question.title
                      const link = isQuestion
                        ? `/questions/${vote.questionId}`
                        : `/questions/${vote.answer?.question.id}`

                      return (
                        <div key={`v-${vote.id}`} className="flex gap-4 p-4 border-b last:border-0">
                          <div className="flex-shrink-0 mt-1">
                            {vote.value > 0 ? (
                              <ThumbsUp size={18} className="text-blue-500" />
                            ) : (
                              <ThumbsDown size={18} className="text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <Link
                                href={link}
                                className="font-medium hover:text-primary transition-colors line-clamp-1"
                              >
                                {vote.value > 0 ? "Upvoted: " : "Downvoted: "}
                                {isQuestion ? "Question" : "Answer"} on "{title}"
                              </Link>
                              <span className="text-sm whitespace-nowrap text-muted-foreground">
                                {formatDate(vote.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questionsWithVotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionsWithVotes.length > 0 ? (
                  questionsWithVotes.map((question) => (
                    <div key={question.id} className="flex gap-4 p-4 border-b last:border-0">
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div className="text-xl font-bold">{question.votes}</div>
                        <div className="text-xs text-muted-foreground">votes</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/questions/${question.id}`}
                          className="font-medium text-lg hover:text-primary transition-colors"
                        >
                          {question.title}
                        </Link>
                        <div className="mt-2 text-sm line-clamp-2 text-muted-foreground">{question.body}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {question.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(question.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No questions found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Answers ({answersWithVotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {answersWithVotes.length > 0 ? (
                  answersWithVotes.map((answer) => (
                    <div key={answer.id} className="flex gap-4 p-4 border-b last:border-0">
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div className="text-xl font-bold">{answer.votes}</div>
                        <div className="text-xs text-muted-foreground">votes</div>
                        {answer.isAccepted && (
                          <div className="mt-1">
                            <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/questions/${answer.question.id}`}
                          className="font-medium text-lg hover:text-primary transition-colors"
                        >
                          {answer.question.title}
                        </Link>
                        <div className="mt-2 text-sm line-clamp-3 text-muted-foreground">{answer.body}</div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(answer.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No answers found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Votes Cast ({votesCast.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {votesCast.length > 0 ? (
                  votesCast.map((vote) => {
                    const isQuestion = !!vote.questionId
                    const title = isQuestion ? vote.question?.title : vote.answer?.question.title
                    const link = isQuestion ? `/questions/${vote.questionId}` : `/questions/${vote.answer?.question.id}`

                    return (
                      <div key={vote.id} className="flex gap-4 p-4 border-b last:border-0">
                        <div className="flex-shrink-0 mt-1">
                          {vote.value > 0 ? (
                            <ThumbsUp size={20} className="text-blue-500" />
                          ) : (
                            <ThumbsDown size={20} className="text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={link} className="font-medium hover:text-primary transition-colors">
                            {isQuestion ? "Question: " : "Answer: "}
                            {title}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(vote.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No votes cast</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

