import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// Update a team member's role
export async function PUT(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: teamId, userId } = params
    const body = await request.json()
    const { role } = body

    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
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

    // Cannot change the owner's role
    if (userId === team.ownerId) {
      return NextResponse.json({ error: "Cannot change the owner's role" }, { status: 400 })
    }

    // Make sure the target user is a member
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "User is not a member of this team" }, { status: 404 })
    }

    // Update the member's role
    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: {
        role,
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

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Remove a member from a team
export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: teamId, userId } = params

    // Check if the user making the request is a team admin, owner, or the member themselves
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
    const isSelf = userId === session.user.id

    if (!isOwner && !isAdmin && !isSelf) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Cannot remove the owner
    if (userId === team.ownerId) {
      return NextResponse.json({ error: "Cannot remove the team owner" }, { status: 400 })
    }

    // Make sure the target user is a member
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "User is not a member of this team" }, { status: 404 })
    }

    // Remove the member
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

