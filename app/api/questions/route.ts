import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, body: content, tags } = body

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create tags if they don't exist
    const tagObjects = []
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
        tagObjects.push({ id: tag.id })
      }
    }

    const question = await prisma.question.create({
      data: {
        title,
        body: content,
        authorId: session.user.id,
        tags: {
          connect: tagObjects,
        },
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
        tags: true,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchQuery = url.searchParams.get("q") || ""
    const department = url.searchParams.get("department")
    const tag = url.searchParams.get("tag")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build the where clause for filtering
    const where: any = {}

    // Search functionality
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { body: { contains: searchQuery, mode: "insensitive" } },
      ]
    }

    // Department filter
    if (department) {
      where.author = {
        department,
      }
    }

    // Tag filter
    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      }
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
        orderBy: {
          createdAt: "desc",
        },
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
          voteCount: votes._sum.value || 0,
        }
      }),
    )

    return NextResponse.json({
      questions: questionsWithVotes,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

