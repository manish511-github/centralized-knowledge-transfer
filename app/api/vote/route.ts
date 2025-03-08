import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { updateReputationOnVote } from "@/lib/reputation"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { questionId, answerId, value } = body

    if ((!questionId && !answerId) || ![-1, 0, 1].includes(value)) {
      return new NextResponse("Invalid parameters", { status: 400 })
    }

    if (questionId && answerId) {
      return new NextResponse("Cannot vote on both question and answer", { status: 400 })
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        ...(questionId ? { questionId } : { answerId }),
      },
    })

    // Store previous value for reputation calculation
    const previousValue = existingVote?.value

    if (value === 0 && existingVote) {
      // Delete the vote if value is 0
      await prisma.vote.delete({
        where: { id: existingVote.id },
      })

      // Update reputation
      await updateReputationOnVote(session.user.id, value, questionId, answerId, previousValue)

      return NextResponse.json({ message: "Vote removed" })
    } else if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      })

      // Update reputation
      await updateReputationOnVote(session.user.id, value, questionId, answerId, previousValue)

      return NextResponse.json(updatedVote)
    } else if (value !== 0) {
      // Create new vote
      const vote = await prisma.vote.create({
        data: {
          value,
          userId: session.user.id,
          ...(questionId ? { questionId } : { answerId }),
        },
      })

      // Update reputation
      await updateReputationOnVote(session.user.id, value, questionId, answerId)

      return NextResponse.json(vote)
    } else {
      // No existing vote and value is 0, nothing to do
      return NextResponse.json({ message: "No action needed" })
    }
  } catch (error) {
    console.error("Error voting:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

