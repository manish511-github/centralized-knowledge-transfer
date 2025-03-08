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
    const { content, visibility } = body

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

    // Create the answer with visibility settings
    const answer = await prisma.answer.create({
      data: {
        body: content,
        authorId: session.user.id,
        questionId,
        visibilityType: visibility?.visibilityType || "public",
        visibleToRoles: visibility?.visibilityType === "roles" ? visibility.visibleToRoles : [],
        visibleToDepartments: visibility?.visibilityType === "departments" ? visibility.visibleToDepartments : [],
        // Create connections for specific users if needed
        ...(visibility?.visibilityType === "specific_users" && visibility.visibleToUsers?.length > 0
          ? {
              visibleToUsers: {
                create: visibility.visibleToUsers.map((userId: string) => ({
                  userId,
                })),
              },
            }
          : {}),
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
        visibleToUsers: {
          select: {
            userId: true,
          },
        },
      },
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error("Error creating answer:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

