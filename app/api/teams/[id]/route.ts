import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// Get a specific team
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teamId = params.id

    // Check if the user is a member of the team
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

    // If the user is not a team member or owner, deny access
    if (!teamMembership && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch the team
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                department: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a team
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teamId = params.id
    const body = await request.json()
    const { name, description, isPrivate } = body

    // Check if the user is a team admin or owner
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if the user is the owner or an admin
    if (team.ownerId !== session.user.id && team.members.length === 0) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        isPrivate: isPrivate !== undefined ? isPrivate : undefined,
      },
    })

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a team
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teamId = params.id

    // Check if the user is the team owner
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Only the team owner can delete the team
    if (team.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Delete the team
    await prisma.team.delete({
      where: {
        id: teamId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

