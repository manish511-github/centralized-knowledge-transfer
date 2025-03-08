import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Eye } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import VoteButtons from "@/components/vote-buttons"
import AnswerForm from "@/components/answer-form"
import AcceptAnswerButton from "@/components/accept-answer-button"

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
        },
      },
    },
    orderBy: [{ isAccepted: "desc" }, { createdAt: "desc" }],
  })

  // Get vote counts for answers and user's votes
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/questions" className="text-primary hover:underline mb-4 block">
          ← Back to questions
        </Link>
        <h1 className="text-3xl font-bold">{question.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <span>Asked {formatDate(question.createdAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {question.views} views
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-2">
          <VoteButtons questionId={question.id} initialVotes={votes._sum.value || 0} userVote={userQuestionVote} />
        </div>

        <div className="md:col-span-11">
          <Card>
            <CardContent className="p-6">
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

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={question.author.image || "/placeholder.svg?height=40&width=40"}
                      alt={question.author.name || ""}
                    />
                    <AvatarFallback>{question.author.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{question.author.name}</p>
                    <p className="text-sm text-muted-foreground">{question.author.department}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <MessageSquare size={20} />
              {answersWithVotes.length} Answers
            </h2>

            {answersWithVotes.map((answer) => (
              <div key={answer.id} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-2">
                    <VoteButtons answerId={answer.id} initialVotes={answer.votes} userVote={answer.userVote} />
                  </div>

                  <div className="md:col-span-11">
                    <Card className={answer.isAccepted ? "border-green-500" : ""}>
                      <CardContent className="p-6">
                        {answer.isAccepted && (
                          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-md inline-block mb-4">
                            Accepted Answer
                          </div>
                        )}
                        <div className="prose max-w-none dark:prose-invert">
                          <p className="whitespace-pre-line">{answer.body}</p>
                        </div>

                        <div className="flex justify-between items-center mt-6 pt-6 border-t">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={answer.author.image || "/placeholder.svg?height=40&width=40"}
                                alt={answer.author.name || ""}
                              />
                              <AvatarFallback>{answer.author.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{answer.author.name}</p>
                              <p className="text-sm text-muted-foreground">{answer.author.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">Answered {formatDate(answer.createdAt)}</div>
                            <AcceptAnswerButton
                              questionId={question.id}
                              answerId={answer.id}
                              isAccepted={answer.isAccepted}
                              isQuestionAuthor={isQuestionAuthor}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Answer</h2>
            <AnswerForm questionId={question.id} />
          </div>
        </div>
      </div>
    </main>
  )
}

