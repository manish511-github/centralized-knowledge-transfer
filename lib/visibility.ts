export const VISIBILITY_TYPES = [
  { id: "public", label: "Public (Everyone)" },
  { id: "roles", label: "Specific Roles" },
  { id: "departments", label: "Specific Departments" },
  { id: "specific_users", label: "Specific Users" },
] as const

export type VisibilityType = (typeof VISIBILITY_TYPES)[number]["id"]

export const DEPARTMENTS = [
  { id: "development", label: "Development" },
  { id: "qa", label: "Quality Assurance" },
  { id: "hr", label: "Human Resources" },
  { id: "product", label: "Product Management" },
  { id: "design", label: "Design" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "finance", label: "Finance" },
  { id: "security", label: "Security" },
  { id: "operations", label: "Operations" },
] as const

export type Department = (typeof DEPARTMENTS)[number]["id"]

export function getDepartmentLabel(departmentId: string): string {
  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  return department?.label || departmentId
}

export function canViewAnswer(
  answer: {
    authorId: string
    visibilityType: string
    visibleToRoles: string[]
    visibleToDepartments: string[]
    visibleToUsers?: { userId: string }[]
  },
  user: {
    id: string
    role?: string | null
    department?: string | null
  } | null,
): boolean {
  // If no user is logged in, only public answers are visible
  if (!user) {
    return answer.visibilityType === "public"
  }

  // Author can always see their own answers
  if (user.id === answer.authorId) {
    return true
  }

  // Admin can see all answers
  if (user.role === "admin") {
    return true
  }

  // Check visibility based on type
  switch (answer.visibilityType) {
    case "public":
      return true

    case "roles":
      return !!user.role && answer.visibleToRoles.includes(user.role)

    case "departments":
      return !!user.department && answer.visibleToDepartments.includes(user.department)

    case "specific_users":
      return answer.visibleToUsers?.some((visibleUser) => visibleUser.userId === user.id) || false

    default:
      return false
  }
}

