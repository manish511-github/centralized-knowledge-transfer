export const VISIBILITY_TYPES = [
  { id: "public", label: "Visible to everyone" },
  { id: "roles", label: "Visible to specific roles" },
  { id: "departments", label: "Visible to specific departments" },
  { id: "specific_users", label: "Visible to specific users" },
]

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
]

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
  if (!user) {
    return answer.visibilityType === "public"
  }

  if (user.id === answer.authorId) {
    return true
  }

  if (user.role === "admin") {
    return true
  }

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

export function getDepartmentLabel(departmentId: string): string {
  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  return department?.label || "Department"
}

