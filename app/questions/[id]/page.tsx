import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Eye, Calendar, Check, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import VoteButtons from "@/components/vote-buttons"
import AnswerForm from "@/components/answer-form"
import AcceptAnswerButton from "@/components/accept-answer-button"
import { Separator } from "@/components/ui/separator"
import ReputationBadge from "@/components/reputation-badge"
import { canViewAnswer } from "@/lib/visibility"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getRoleLabel } from "@/lib/roles"
import { getDepartmentLabel } from "@/lib/visibility"

export default async function QuestionDetail({ params }: { params: { id: string } }) {
  // Get current user
  const currentUser = await getCurrentUser()

  // Fetch question with related data
  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
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

  if (!question) {
    notFound()
  }

  // Increment view count
  await prisma.question.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  // Get vote count and user's vote
  const votes = await prisma.vote.aggregate({
    where: {
      questionId: params.id,
    },
    _sum: {
      value: true,
    },
  })

  // Get user's vote on the question
  let userQuestionVote = null
  if (currentUser) {
    const userVote = await prisma.vote.findFirst({
      where: {
        questionId: params.id,
        userId: currentUser.id,
      },
      select: {
        value: true,
      },
    })
    userQuestionVote = userVote?.value || null
  }

  // Get answers
  const answers = await prisma.answer.findMany({
    where: {
      questionId: params.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          department: true,
          reputation: true,
          role: true,
        },
      },
      visibleToUsers: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: [{ isAccepted: "desc" }, { createdAt: "desc" }],
  })

  // Filter answers based on visibility settings
  const visibleAnswers = answers.filter((answer) =>
    canViewAnswer(
      {
        authorId: answer.authorId,
        visibilityType: answer.visibilityType,
        visibleToRoles: answer.visibleToRoles,
        visibleToDepartments: answer.visibleToDepartments,
        visibleToUsers: answer.visibleToUsers,
      },
      currentUser,
    ),
  )

  // Get vote counts for answers and user's votes
  const answersWithVotes = await Promise.all(
    visibleAnswers.map(async (answer) => {
      const votes = await prisma.vote.aggregate({
        where: {
          answerId: answer.id,
        },
        _sum: {
          value: true,
        },
      })

      // Get user's vote on this answer
      let userVote = null
      if (currentUser) {
        const vote = await prisma.vote.findFirst({
          where: {
            answerId: answer.id,
            userId: currentUser.id,
          },
          select: {
            value: true,
          },
        })
        userVote = vote?.value || null
      }

      return {
        ...answer,
        votes: votes._sum.value || 0,
        userVote,
      }
    }),
  )

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if current user is the question author
  const isQuestionAuthor = currentUser?.id === question.author.id

  // Count hidden answers
  const hiddenAnswersCount = answers.length - visibleAnswers.length

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/questions" className="text-primary hover:underline mb-4 inline-flex items-center gap-1">
          ← Back to questions
        </Link>
        <h1 className="text-3xl font-bold mt-4">{question.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Asked {formatDate(question.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{question.views} views</span>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex">
          {/* Vote buttons column */}
          <div className="p-4 border-r flex flex-col items-center justify-start pt-6 w-16">
            <VoteButtons questionId={question.id} initialVotes={votes._sum.value || 0} userVote={userQuestionVote} />
          </div>

          {/* Question content */}
          <CardContent className="p-6 flex-1">
            <div className="prose max-w-none dark:prose-invert">
              <p className="whitespace-pre-line">{question.body}</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {question.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3 max-w-xs">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={question.author.image || "/placeholder.svg?height=40&width=40"}
                    alt={question.author.name || ""}
                  />
                  <AvatarFallback>{question.author.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{question.author.name}</p>
                    {question.author.reputation !== undefined && (
                      <ReputationBadge reputation={question.author.reputation} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{question.author.department}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className="mt-10">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <MessageSquare size={20} />
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          {hiddenAnswersCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({hiddenAnswersCount} hidden due to visibility settings)
            </span>
          )}
        </h2>

        {hiddenAnswersCount > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Restricted Answers</AlertTitle>
            <AlertDescription>
              Some answers are not visible to you due to the author's visibility settings.
            </AlertDescription>
          </Alert>
        )}

        {answersWithVotes.length > 0 ? (
          <div className="space-y-6">
            {answersWithVotes.map((answer) => (
              <Card key={answer.id} className={answer.isAccepted ? "border-green-500 shadow-md" : ""}>
                <div className="flex">
                  {/* Vote buttons column */}
                  <div className="p-4 border-r flex flex-col items-center justify-start pt-6 w-16">
                    <VoteButtons answerId={answer.id} initialVotes={answer.votes} userVote={answer.userVote} />
                  </div>

                  {/* Answer content */}
                  <CardContent className="p-6 flex-1">
                    {answer.isAccepted && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 mb-4">
                        <Check size={16} />
                        <span className="font-medium text-sm">Accepted Answer</span>
                      </div>
                    )}

                    {answer.visibilityType !== "public" && (
                      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 mb-4">
                        <Lock size={16} />
                        <span className="font-medium text-sm">
                          {answer.visibilityType === "roles" && (
                            <>Visible only to: {answer.visibleToRoles.map((role) => getRoleLabel(role)).join(", ")}</>
                          )}
                          {answer.visibilityType === "departments" && (
                            <>
                              Visible only to:{" "}
                              {answer.visibleToDepartments.map((dept) => getDepartmentLabel(dept)).join(", ")}
                            </>
                          )}
                          {answer.visibilityType === "specific_users" && <>Visible only to specific users</>}
                        </span>
                      </div>
                    )}

                    <div className="prose max-w-none dark:prose-invert">
                      <p className="whitespace-pre-line">{answer.body}</p>
                    </div>

                    <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
                      <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={answer.author.image || "/placeholder.svg?height=32&width=32"}
                            alt={answer.author.name || ""}
                          />
                          <AvatarFallback>{answer.author.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{answer.author.name}</p>
                            {answer.author.reputation !== undefined && (
                              <ReputationBadge reputation={answer.author.reputation} size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {answer.author.department}
                            {answer.author.role && ` • ${getRoleLabel(answer.author.role)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground">Answered {formatDate(answer.createdAt)}</div>
                        <AcceptAnswerButton
                          questionId={question.id}
                          answerId={answer.id}
                          isAccepted={answer.isAccepted}
                          isQuestionAuthor={isQuestionAuthor}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No answers yet. Be the first to answer this question!</p>
          </Card>
        )}
      </div>

      <Separator className="my-10" />

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Answer</h2>
        <AnswerForm questionId={question.id} />
      </div>
    </main>
  )
}

