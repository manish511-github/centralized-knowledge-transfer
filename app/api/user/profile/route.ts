import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { isAdmin } from "@/lib/roles"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, department, bio, role } = body

    // Check if user is trying to update role
    if (role !== undefined) {
      // Only admins can update roles
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })
      
      if (!currentUser || !isAdmin(currentUser.role)) {
        return new NextResponse("Forbidden: Only admins can update roles", { status: 403 })
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        department: department || undefined,
        bio: bio || undefined,
        role: role || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        bio: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

