import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questionId = params.id

    // Increment view count
    await prisma.question.update({
      where: { id: questionId },
      data: { views: { increment: 1 } },
    })

    // Get question with related data
    const question = await prisma.question.findUnique({
      where: { id: questionId },
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
      return new NextResponse("Question not found", { status: 404 })
    }

    // Get vote count
    const votes = await prisma.vote.aggregate({
      where: {
        questionId,
      },
      _sum: {
        value: true,
      },
    })

    // Get answers
    const answers = await prisma.answer.findMany({
      where: {
        questionId,
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
          voteCount: votes._sum.value || 0,
        }
      }),
    )

    return NextResponse.json({
      ...question,
      voteCount: votes._sum.value || 0,
      answers: answersWithVotes,
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const questionId = params.id

    // Check if user is the author of the question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true },
    })

    if (!question) {
      return new NextResponse("Question not found", { status: 404 })
    }

    if (question.authorId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete question and all related data (cascading delete)
    await prisma.question.delete({
      where: { id: questionId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

