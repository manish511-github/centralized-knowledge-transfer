import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const teamId = url.searchParams.get("teamId")
    const sort = url.searchParams.get("sort") || "newest"
    const filter = url.searchParams.get("filter") || "all"
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10)
    const skip = (page - 1) * limit

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }

    // Check if user is a member of the team
    const teamMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    })

    const isOwner = await prisma.team.findFirst({
      where: {
        id: teamId,
        ownerId: session.user.id,
      },
    })

    if (!teamMembership && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Build the where clause for filtering
    const where: any = { teamId }

    // Apply filter
    if (filter === "unanswered") {
      where.answers = { none: {} }
    } else if (filter === "answered") {
      where.answers = { some: {} }
    }

    // Determine order by based on sort parameter
    let orderBy: any = {}
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "active":
        orderBy = { updatedAt: "desc" }
        break
      case "votes":
        // We'll handle this with a separate query
        orderBy = { createdAt: "desc" }
        break
      case "views":
        orderBy = { views: "desc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    // Get questions with count
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
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
              votes: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ])

    // Calculate votes for each question
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

    // If sorting by votes, sort the results manually
    let sortedQuestions = questionsWithVotes
    if (sort === "votes") {
      sortedQuestions = questionsWithVotes.sort((a, b) => b.votes - a.votes)
    }

    return NextResponse.json({
      questions: sortedQuestions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching team questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

