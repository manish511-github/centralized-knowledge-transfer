import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  FileText,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  BarChart3,
  Filter,
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default async function UserActivity({ params }: { params: { id: string } }) {
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      department: true,
      role: true,
      reputation: true,
      createdAt: true,
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

  // Group activities by month
  const allActivities = [
    ...questionsWithVotes.map((q) => ({ type: "question", data: q, date: q.createdAt })),
    ...answersWithVotes.map((a) => ({ type: "answer", data: a, date: a.createdAt })),
    ...votesCast.map((v) => ({ type: "vote", data: v, date: v.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Group by month
  const activitiesByMonth: Record<string, typeof allActivities> = {}

  allActivities.forEach((activity) => {
    const date = new Date(activity.date)
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    if (!activitiesByMonth[monthYear]) {
      activitiesByMonth[monthYear] = []
    }

    activitiesByMonth[monthYear].push(activity)
  })

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-primary/10">{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}'s Activity</h1>
            <div className="text-sm text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/users/${user.id}`} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  <span className="text-sm">Questions</span>
                </div>
                <Badge variant="outline">{questions.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-green-500" />
                  <span className="text-sm">Answers</span>
                </div>
                <Badge variant="outline">{answers.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={16} className="text-purple-500" />
                  <span className="text-sm">Votes Cast</span>
                </div>
                <Badge variant="outline">{votesCast.length}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm">Total Activities</span>
                </div>
                <Badge variant="outline">{allActivities.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Activity Timeline
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search activities..." className="max-w-xs h-9" disabled />
                  <Button variant="outline" size="sm" disabled>
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <Calendar size={14} />
                    All Activity
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-1">
                    <FileText size={14} />
                    Questions
                  </TabsTrigger>
                  <TabsTrigger value="answers" className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    Answers
                  </TabsTrigger>
                  <TabsTrigger value="votes" className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    Votes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-8">
                  {Object.entries(activitiesByMonth).map(([monthYear, activities]) => (
                    <div key={monthYear} className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center">
                          <div className="bg-background px-4 text-sm font-medium text-muted-foreground">
                            {monthYear}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 ml-4 border-l pl-6 pt-2">
                        {activities.map((activity, index) => {
                          if (activity.type === "question") {
                            const question = activity.data
                            return (
                              <div key={`q-${question.id}`} className="relative">
                                <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 dark:bg-blue-900 dark:border-blue-400"></div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors">
                                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <FileText size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                      <Link
                                        href={`/questions/${question.id}`}
                                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                                      >
                                        Asked: {question.title}
                                      </Link>
                                      <span className="text-xs whitespace-nowrap text-muted-foreground">
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
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <ThumbsUp size={12} />
                                        {question.votes} votes
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MessageSquare size={12} />
                                        {question._count.answers} answers
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          } else if (activity.type === "answer") {
                            const answer = activity.data
                            return (
                              <div key={`a-${answer.id}`} className="relative">
                                <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-green-100 border-2 border-green-500 dark:bg-green-900 dark:border-green-400"></div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors">
                                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    <MessageSquare size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                      <Link
                                        href={`/questions/${answer.questionId}#answer-${answer.id}`}
                                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                                      >
                                        Answered: {answer.question.title}
                                      </Link>
                                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                                        {formatDate(answer.createdAt)}
                                      </span>
                                    </div>
                                    <div className="mt-2 text-sm line-clamp-2 text-muted-foreground">
                                      {answer.content}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <ThumbsUp size={12} />
                                        {answer.votes} votes
                                      </span>
                                      {answer.isAccepted && (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                          <CheckCircle2 size={12} />
                                          Accepted
                                        </span>
                                      )}
                                    </div>
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
                              : `/questions/${vote.answer?.question.id}#answer-${vote.answerId}`

                            return (
                              <div key={`v-${vote.id}`} className="relative">
                                <div
                                  className={`absolute -left-10 mt-1 w-4 h-4 rounded-full ${
                                    vote.value > 0
                                      ? "bg-purple-100 border-2 border-purple-500 dark:bg-purple-900 dark:border-purple-400"
                                      : "bg-red-100 border-2 border-red-500 dark:bg-red-900 dark:border-red-400"
                                  }`}
                                ></div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors">
                                  <div
                                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${
                                      vote.value > 0
                                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {vote.value > 0 ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                      <Link
                                        href={link}
                                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                                      >
                                        {vote.value > 0 ? "Upvoted: " : "Downvoted: "}
                                        {isQuestion ? "Question" : "Answer"} on "{title}"
                                      </Link>
                                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                                        {formatDate(vote.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        })}
                      </div>
                    </div>
                  ))}

                  {allActivities.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">No activity yet</h3>
                      <p className="text-muted-foreground">{user.name} hasn't performed any actions yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  {questionsWithVotes.length > 0 ? (
                    questionsWithVotes.map((question) => (
                      <div
                        key={question.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <Link
                              href={`/questions/${question.id}`}
                              className="font-medium text-lg hover:text-primary transition-colors"
                            >
                              {question.title}
                            </Link>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <ThumbsUp size={12} /> {question.votes}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MessageSquare size={12} /> {question._count.answers}
                              </Badge>
                            </div>
                          </div>
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
                    <div className="text-center py-12">
                      <FileText size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">No questions found</h3>
                      <p className="text-muted-foreground">{user.name} hasn't asked any questions yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="answers" className="space-y-4">
                  {answersWithVotes.length > 0 ? (
                    answersWithVotes.map((answer) => (
                      <div
                        key={answer.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <MessageSquare size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <Link
                              href={`/questions/${answer.questionId}#answer-${answer.id}`}
                              className="font-medium text-lg hover:text-primary transition-colors"
                            >
                              {answer.question.title}
                            </Link>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <ThumbsUp size={12} /> {answer.votes}
                              </Badge>
                              {answer.isAccepted && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                >
                                  <CheckCircle2 size={12} className="mr-1" /> Accepted
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-sm line-clamp-3 text-muted-foreground">{answer.content}</div>
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(answer.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">No answers found</h3>
                      <p className="text-muted-foreground">{user.name} hasn't answered any questions yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="votes" className="space-y-4">
                  {votesCast.length > 0 ? (
                    votesCast.map((vote) => {
                      const isQuestion = !!vote.questionId
                      const title = isQuestion ? vote.question?.title : vote.answer?.question.title
                      const link = isQuestion
                        ? `/questions/${vote.questionId}`
                        : `/questions/${vote.answer?.question.id}#answer-${vote.answerId}`

                      return (
                        <div
                          key={vote.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors"
                        >
                          <div
                            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${
                              vote.value > 0
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {vote.value > 0 ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <Link href={link} className="font-medium hover:text-primary transition-colors">
                                {vote.value > 0 ? "Upvoted: " : "Downvoted: "}
                                {isQuestion ? "Question" : "Answer"} on "{title}"
                              </Link>
                              <span className="text-xs whitespace-nowrap text-muted-foreground">
                                {formatDate(vote.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12">
                      <ThumbsUp size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">No votes cast</h3>
                      <p className="text-muted-foreground">{user.name} hasn't voted on any content yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

