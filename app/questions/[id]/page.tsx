import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, ArrowDown, MessageSquare, Eye } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function QuestionDetail({ params }: { params: { id: string } }) {
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

  // Get vote count
  const votes = await prisma.vote.aggregate({
    where: {
      questionId: params.id,
    },
    _sum: {
      value: true,
    },
  })

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

  // Get vote counts for answers
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline mb-4 block">
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
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowUp size={20} />
          </Button>
          <span className="font-semibold">{votes._sum.value || 0}</span>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowDown size={20} />
          </Button>
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
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ArrowUp size={20} />
                    </Button>
                    <span className="font-semibold">{answer.votes}</span>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ArrowDown size={20} />
                    </Button>
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
                          <div className="text-sm text-muted-foreground">Answered {formatDate(answer.createdAt)}</div>
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
            <Card>
              <CardContent className="p-6">
                <Textarea placeholder="Write your answer here..." rows={8} className="mb-4" />
                <Button>Post Your Answer</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

