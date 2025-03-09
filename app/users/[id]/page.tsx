import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Award,
  MessageSquare,
  FileText,
  CheckCircle2,
  Eye,
  BarChart3,
  ExternalLink,
  Mail,
  Building,
  Clock,
  User,
  Briefcase,
  ThumbsUp,
} from "lucide-react"
import prisma from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import QuestionCard from "@/components/question-card"
import { Progress } from "@/components/ui/progress"
import { getReputationLevel, getNextReputationThreshold } from "@/lib/reputation"
import { USER_ROLES } from "@/lib/roles"
import { Separator } from "@/components/ui/separator"

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
          votes: true,
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

  // Get accepted answers count
  const acceptedAnswersCount = await prisma.answer.count({
    where: {
      authorId: user.id,
      isAccepted: true,
    },
  })

  // Calculate total votes received
  const totalVotesReceived = await prisma.vote.aggregate({
    where: {
      OR: [
        {
          question: {
            authorId: user.id,
          },
        },
        {
          answer: {
            authorId: user.id,
          },
        },
      ],
    },
    _sum: {
      value: true,
    },
  })

  // Calculate reputation progress
  const currentLevel = getReputationLevel(user.reputation)
  const nextThreshold = getNextReputationThreshold(user.reputation)
  const prevThreshold = nextThreshold > 1000 ? nextThreshold - 1000 : 0
  const progress =
    nextThreshold === prevThreshold
      ? 100
      : Math.round(((user.reputation - prevThreshold) / (nextThreshold - prevThreshold)) * 100)

  // Get role label
  const roleLabel = USER_ROLES.find((r) => r.id === user.role)?.label || user.role

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - User Info */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10"></div>
            <CardContent className="pt-0 relative">
              <div className="flex flex-col items-center -mt-12 text-center">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="text-2xl bg-primary/10">{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mt-4">{user.name}</h1>

                {user.role && (
                  <Badge variant="outline" className="mt-2">
                    {roleLabel}
                  </Badge>
                )}

                <div className="mt-4 w-full">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-muted-foreground">Reputation Level: {currentLevel}</span>
                    <span className="font-medium">{user.reputation}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {nextThreshold !== Number.POSITIVE_INFINITY && (
                    <div className="text-xs text-right mt-1 text-muted-foreground">
                      {user.reputation} / {nextThreshold} to next level
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{user._count.questions}</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{user._count.answers}</div>
                  <div className="text-xs text-muted-foreground">Answers</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{acceptedAnswersCount}</div>
                  <div className="text-xs text-muted-foreground">Accepted</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{totalVotesReceived._sum.value || 0}</div>
                  <div className="text-xs text-muted-foreground">Votes</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button variant="outline" asChild>
                <Link href={`/users/${user.id}/activity`} className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  View Activity
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
              )}

              {user.department && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{user.department}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{roleLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
              </div>

              {user.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={18} />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {acceptedAnswersCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Problem Solver</div>
                      <div className="text-xs text-muted-foreground">
                        {acceptedAnswersCount} accepted {acceptedAnswersCount === 1 ? "answer" : "answers"}
                      </div>
                    </div>
                  </div>
                )}

                {user._count.questions >= 5 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Curious Mind</div>
                      <div className="text-xs text-muted-foreground">
                        Asked {user._count.questions} {user._count.questions === 1 ? "question" : "questions"}
                      </div>
                    </div>
                  </div>
                )}

                {user._count.answers >= 10 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <MessageSquare size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Helpful Expert</div>
                      <div className="text-xs text-muted-foreground">
                        Provided {user._count.answers} {user._count.answers === 1 ? "answer" : "answers"}
                      </div>
                    </div>
                  </div>
                )}

                {(totalVotesReceived._sum.value || 0) >= 50 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                      <Award size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Respected Contributor</div>
                      <div className="text-xs text-muted-foreground">
                        Received {totalVotesReceived._sum.value} upvotes
                      </div>
                    </div>
                  </div>
                )}

                {!acceptedAnswersCount &&
                  user._count.questions < 5 &&
                  user._count.answers < 10 &&
                  (totalVotesReceived._sum.value || 0) < 50 && (
                    <div className="text-sm text-muted-foreground text-center py-2">No achievements yet</div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <FileText size={16} />
                Questions
              </TabsTrigger>
              <TabsTrigger value="answers" className="flex items-center gap-2">
                <MessageSquare size={16} />
                Answers
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 size={16} />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Questions asked by {user.name}</CardDescription>
                  </div>
                  {user._count.questions > 5 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/search?author=${user.id}&type=question`} className="flex items-center gap-1">
                        View all <ExternalLink size={14} />
                      </Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {questionsWithVotes.length > 0 ? (
                    <div className="space-y-4">
                      {questionsWithVotes.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                      <FileText size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">No questions yet</h3>
                      <p className="text-muted-foreground">{user.name} hasn't asked any questions yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="answers">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Answers</CardTitle>
                    <CardDescription>Answers provided by {user.name}</CardDescription>
                  </div>
                  {user._count.answers > 5 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/search?author=${user.id}&type=answer`} className="flex items-center gap-1">
                        View all <ExternalLink size={14} />
                      </Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {answersWithVotes.length > 0 ? (
                    <div className="space-y-4">
                      {answersWithVotes.map((answer) => (
                        <div key={answer.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                          <Link href={`/questions/${answer.questionId}#answer-${answer.id}`}>
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="font-medium hover:text-primary transition-colors">
                                {answer.question.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
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
                            <div className="text-sm text-muted-foreground mt-2">
                              Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                            </div>
                            <div className="mt-3 text-sm line-clamp-2 text-muted-foreground">{answer.content}</div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                      <MessageSquare size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">No answers yet</h3>
                      <p className="text-muted-foreground">{user.name} hasn't answered any questions yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award size={18} />
                      Reputation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="text-5xl font-bold mb-2">{user.reputation}</div>
                      <div className="text-muted-foreground mb-4">Total Reputation</div>

                      <div className="w-full max-w-xs">
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="text-muted-foreground">Level: {currentLevel}</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {nextThreshold !== Number.POSITIVE_INFINITY && (
                          <div className="text-xs text-right mt-1 text-muted-foreground">
                            {user.reputation} / {nextThreshold} to next level
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 size={18} />
                      Contribution Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-500" />
                          <span>Questions</span>
                        </div>
                        <span className="font-medium">{user._count.questions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-green-500" />
                          <span>Answers</span>
                        </div>
                        <span className="font-medium">{user._count.answers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-amber-500" />
                          <span>Accepted Answers</span>
                        </div>
                        <span className="font-medium">{acceptedAnswersCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ThumbsUp size={16} className="text-purple-500" />
                          <span>Votes Received</span>
                        </div>
                        <span className="font-medium">{totalVotesReceived._sum.value || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Eye size={16} className="text-cyan-500" />
                          <span>Votes Cast</span>
                        </div>
                        <span className="font-medium">{user._count.votes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={18} />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-blue-500">{user._count.questions}</div>
                        <div className="text-sm text-muted-foreground">Questions</div>
                      </div>
                      <div className="h-10 border-r hidden sm:block"></div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-green-500">{user._count.answers}</div>
                        <div className="text-sm text-muted-foreground">Answers</div>
                      </div>
                      <div className="h-10 border-r hidden sm:block"></div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-amber-500">{acceptedAnswersCount}</div>
                        <div className="text-sm text-muted-foreground">Accepted</div>
                      </div>
                      <div className="h-10 border-r hidden sm:block"></div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-purple-500">{totalVotesReceived._sum.value || 0}</div>
                        <div className="text-sm text-muted-foreground">Votes</div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-6">
                      <Button asChild>
                        <Link href={`/users/${user.id}/activity`} className="flex items-center gap-2">
                          <BarChart3 size={16} />
                          View Detailed Activity
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

