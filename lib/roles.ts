export const USER_ROLES = [
  { id: "admin", label: "Admin" },
  { id: "architect", label: "Architect" },
  { id: "associate_lead", label: "Associate Lead" },
  { id: "associate_senior", label: "Associate Senior" },
  { id: "associate", label: "Associate" },
  { id: "fresher", label: "Fresher" },
] as const

export type UserRole = (typeof USER_ROLES)[number]["id"]

export function getRoleLabel(roleId: string | null | undefined): string {
  const role = USER_ROLES.find((r) => r.id === roleId)
  return role?.label || "Member"
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin"
}

