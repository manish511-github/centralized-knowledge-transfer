import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// Get all members of a team
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teamId = params.id

    // Check if the user is a member of the team
    const membership = await prisma.teamMember.findUnique({
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

    if (!membership && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get all team members
    const members = await prisma.teamMember.findMany({
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            department: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a member to a team
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teamId = params.id
    const body = await request.json()
    const { userId, role = "member" } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if the user making the request is a team admin or owner
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const isOwner = team.ownerId === session.user.id
    const isAdmin = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        role: "admin",
      },
    })

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Check if the user to be added exists
    const userToAdd = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
    }

    // Add the user to the team
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: role === "admin" ? "admin" : "member",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

