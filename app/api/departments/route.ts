import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get unique departments from users
    const departmentResults = await prisma.user.groupBy({
      by: ["department"],
      _count: {
        department: true,
      },
      where: {
        department: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          department: "desc",
        },
      },
    })

    // Format the results
    const departments = departmentResults
      .filter((d) => d.department) // Filter out null departments
      .map((d) => ({
        id: d.department?.toLowerCase(),
        label: d.department || "",
        count: d._count.department,
      }))

    return NextResponse.json({ departments })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

