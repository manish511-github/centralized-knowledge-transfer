import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string; answerId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const questionId = params.id
    const answerId = params.answerId

    // Check if user is author of question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true },
    })

    if (!question) {
      return new NextResponse("Question not found", { status: 404 })
    }

    if (question.authorId !== session.user.id) {
      return new NextResponse("Only the question author can accept answers", { status: 403 })
    }

    // Reset any previously accepted answers
    await prisma.answer.updateMany({
      where: { questionId },
      data: { isAccepted: false },
    })

    // Accept the new answer
    const answer = await prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
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
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

