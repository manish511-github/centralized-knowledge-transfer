import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get("q")
    const type = url.searchParams.get("type") || "all" // all, questions, tags, users

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const results: any = { query }

    // Search questions
    if (type === "all" || type === "questions") {
      const questions = await prisma.question.findMany({
        where: {
          OR: [{ title: { contains: query, mode: "insensitive" } }, { body: { contains: query, mode: "insensitive" } }],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
          tags: true,
          _count: {
            select: { answers: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })

      results.questions = questions
    }

    // Search tags
    if (type === "all" || type === "tags") {
      const tags = await prisma.tag.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        include: {
          _count: {
            select: { questions: true },
          },
        },
        orderBy: {
          name: "asc",
        },
        take: 5,
      })

      results.tags = tags
    }

    // Search users
    if (type === "all" || type === "users") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { department: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
          department: true,
          _count: {
            select: { questions: true, answers: true },
          },
        },
        orderBy: {
          name: "asc",
        },
        take: 5,
      })

      results.users = users
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

