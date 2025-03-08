import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const query = url.searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search for users by name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
        // Don't include the current user in results
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        department: true,
        role: true,
      },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

