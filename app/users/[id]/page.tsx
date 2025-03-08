import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  FileText,
  Award,
  Calendar,
  Mail,
  Building,
  CheckCircle2,
  ThumbsUp,
  Eye,
  Clock,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getReputationLevel } from "@/lib/reputation"
import ReputationBadge from "@/components/reputation-badge"
import QuestionCard from "@/components/question-card"
import { getCurrentUser } from "@/lib/auth"
import { getRoleLabel } from "@/lib/roles"

export default async function UserProfile({ params }: { params: { id: string } }) {
  // Get current user to check if viewing own profile
  const currentUser = await getCurrentUser()
  const isOwnProfile = currentUser?.id === params.id

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.id },
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
    where: { authorId: user.id },
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
    orderBy: { createdAt: "desc" },
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
        views: question.views,
        answers: question._count.answers,
      }
    }),
  )

  // Fetch user's answers
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

  // Calculate accepted answers count
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

  // Get most used tags
  const userQuestionIds = await prisma.question.findMany({
    where: { authorId: user.id },
    select: { id: true },
  })

  const questionIds = userQuestionIds.map((q) => q.id)

  const tagCounts = await prisma.tag.findMany({
    where: {
      questions: {
        some: {
          id: {
            in: questionIds,
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          questions: {
            where: {
              authorId: user.id,
            },
          },
        },
      },
    },
  })

  const topTags = tagCounts
    .filter((tag) => tag._count.questions > 0)
    .sort((a, b) => b._count.questions - a._count.questions)
    .slice(0, 5)

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get reputation level and next level
  const reputationLevel = getReputationLevel(user.reputation)
  const nextLevelThresholds = [10, 50, 200, 500, 1000, 2000]
  const currentLevelIndex = nextLevelThresholds.findIndex((threshold) => user.reputation < threshold)

  const nextLevelThreshold = currentLevelIndex >= 0 ? nextLevelThresholds[currentLevelIndex] : null
  const prevLevelThreshold = currentLevelIndex > 0 ? nextLevelThresholds[currentLevelIndex - 1] : 0

  const progressToNextLevel = nextLevelThreshold
    ? Math.round(((user.reputation - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100)
    : 100

  const nextLevel = nextLevelThreshold ? getReputationLevel(nextLevelThreshold) : null

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero section with user info */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.image || "/placeholder.svg?height=128&width=128"} alt={user.name || ""} />
              <AvatarFallback className="text-4xl">{user.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button size="sm" variant="secondary" className="absolute bottom-0 right-0 rounded-full">
                Edit
              </Button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold">{user.name}</h1>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              {user.department && (
                <div className="flex items-center gap-1">
                  <Building size={16} />
                  <span>{user.department}</span>
                </div>
              )}
              {user.role && (
                <div className="flex items-center gap-1">
                  <Award size={16} />
                  <span>{getRoleLabel(user.role)}</span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <Badge variant="outline" className="px-3 py-1">
                <FileText size={14} className="mr-1" />
                {user._count.questions} Questions
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <MessageSquare size={14} className="mr-1" />
                {user._count.answers} Answers
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <CheckCircle2 size={14} className="mr-1" />
                {acceptedAnswersCount} Accepted
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <ThumbsUp size={14} className="mr-1" />
                {totalVotesReceived._sum.value || 0} Votes
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 bg-card p-4 rounded-lg shadow-sm min-w-[180px]">
            <ReputationBadge reputation={user.reputation} showLevel size="lg" />

            {nextLevel && (
              <div className="w-full mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{reputationLevel}</span>
                  <span>{nextLevel}</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  {nextLevelThreshold && nextLevelThreshold - user.reputation} points to next level
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats and activity section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
                <div className="text-3xl font-bold">{user._count.questions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
                <div className="text-3xl font-bold">{user._count.answers}</div>
                <div className="text-sm text-muted-foreground">Answers</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
                <div className="text-3xl font-bold">{acceptedAnswersCount}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
                <div className="text-3xl font-bold">{totalVotesReceived._sum.value || 0}</div>
                <div className="text-sm text-muted-foreground">Votes</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {[...questionsWithVotes, ...answersWithVotes]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 3)
                  .map((item) => {
                    const isQuestion = "title" in item
                    const title = isQuestion ? item.title : item.question.title
                    const link = isQuestion
                      ? `/questions/${item.id}`
                      : `/questions/${item.question.id}#answer-${item.id}`

                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="mt-0.5">
                          {isQuestion ? (
                            <FileText size={16} className="text-blue-500" />
                          ) : (
                            <MessageSquare size={16} className="text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={link} className="font-medium hover:text-primary transition-colors line-clamp-1">
                            {isQuestion ? "Asked: " : "Answered: "}
                            {title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(item.createdAt)}
                            </span>
                            {isQuestion && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Eye size={12} />
                                  {item.views} views
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={12} />
                                  {item.answers} answers
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/users/${user.id}/activity`}>
                    View all activity
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-3">Top Tags</h3>
            {topTags.length > 0 ? (
              <div className="space-y-3">
                {topTags.map((tag) => {
                  const percentage = Math.min(100, Math.round((tag._count.questions / user._count.questions) * 100))

                  return (
                    <div key={tag.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Link
                          href={`/tags/${tag.name}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {tag.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{tag._count.questions} questions</span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tags used yet</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-medium mb-3">Achievements</h3>
              <div className="space-y-3">
                {acceptedAnswersCount > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium">Solution Provider</div>
                      <div className="text-xs text-muted-foreground">
                        Provided {acceptedAnswersCount} accepted answers
                      </div>
                    </div>
                  </div>
                )}

                {user.reputation >= 100 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <Award size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Respected Contributor</div>
                      <div className="text-xs text-muted-foreground">Earned over 100 reputation points</div>
                    </div>
                  </div>
                )}

                {user._count.questions >= 5 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium">Curious Mind</div>
                      <div className="text-xs text-muted-foreground">Asked {user._count.questions} questions</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content tabs */}
      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Recent
              </Button>
              <Button variant="ghost" size="sm">
                Top Voted
              </Button>
              <Button variant="ghost" size="sm">
                Most Viewed
              </Button>
            </div>
          </div>

          {questionsWithVotes.length > 0 ? (
            <div className="space-y-4">
              {questionsWithVotes.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}

              {user._count.questions > 5 && (
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link href={`/users/${user.id}/questions`}>View all {user._count.questions} questions</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">This user hasn't asked any questions yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="answers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Answers</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Recent
              </Button>
              <Button variant="ghost" size="sm">
                Top Voted
              </Button>
              <Button variant="ghost" size="sm">
                Accepted
              </Button>
            </div>
          </div>

          {answersWithVotes.length > 0 ? (
            <div className="space-y-4">
              {answersWithVotes.map((answer) => (
                <Card key={answer.id} className={answer.isAccepted ? "border-green-500" : ""}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Link
                        href={`/questions/${answer.question.id}`}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        {answer.question.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {answer.isAccepted && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                            Accepted
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <ThumbsUp size={14} />
                          {answer.votes}
                        </span>
                      </div>
                    </div>

                    <div className="prose max-w-none dark:prose-invert line-clamp-3">
                      <p>{answer.body}</p>
                    </div>

                    <div className="text-xs text-muted-foreground mt-4 text-right">
                      Answered {formatDate(answer.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {user._count.answers > 5 && (
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link href={`/users/${user.id}/answers`}>View all {user._count.answers} answers</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">This user hasn't answered any questions yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About {user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">{user.bio || "This user hasn't added a bio yet."}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-muted-foreground" />
                      <span>{user.department}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span>Last active {formatDate(user.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="pt-4 border-t">
                  <Button variant="outline" asChild>
                    <Link href="/settings">Edit Profile</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

