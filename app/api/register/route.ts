import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { USER_ROLES } from "@/lib/roles"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password, department, role } = body

    if (!email || !name || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Validate role if provided
    if (role && !USER_ROLES.some((r) => r.id === role)) {
      return new NextResponse("Invalid role", { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        department,
        role,
      },
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

