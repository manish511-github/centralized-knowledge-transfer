import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const questionId = params.id
    const body = await request.json()
    const { content } = body

    if (!content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return new NextResponse("Question not found", { status: 404 })
    }

    const answer = await prisma.answer.create({
      data: {
        body: content,
        authorId: session.user.id,
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
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

