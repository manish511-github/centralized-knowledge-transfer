"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VISIBILITY_TYPES, DEPARTMENTS } from "@/lib/visibility"
import { USER_ROLES } from "@/lib/roles"
import { Search, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface VisibilitySelectorProps {
  value: {
    visibilityType: string
    visibleToRoles: string[]
    visibleToDepartments: string[]
    visibleToUsers: { id: string; name: string; image?: string | null }[]
  }
  onChange: (value: {
    visibilityType: string
    visibleToRoles: string[]
    visibleToDepartments: string[]
    visibleToUsers: { id: string; name: string; image?: string | null }[]
  }) => void
  teamId?: string
  teamName?: string
}

export function VisibilitySelector({ value, onChange, teamId, teamName }: VisibilitySelectorProps) {
  const [visibilityType, setVisibilityType] = useState(value.visibilityType || "public")
  const [visibleToRoles, setVisibleToRoles] = useState<string[]>(value.visibleToRoles || [])
  const [visibleToDepartments, setVisibleToDepartments] = useState<string[]>(value.visibleToDepartments || [])
  const [visibleToUsers, setVisibleToUsers] = useState<{ id: string; name: string; image?: string | null }[]>(
    value.visibleToUsers || [],
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; image?: string | null }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Update parent component when values change
  useEffect(() => {
    onChange({
      visibilityType,
      visibleToRoles,
      visibleToDepartments,
      visibleToUsers,
    })
  }, [visibilityType, visibleToRoles, visibleToDepartments, visibleToUsers, onChange])

  // Handle role checkbox changes
  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setVisibleToRoles([...visibleToRoles, roleId])
    } else {
      setVisibleToRoles(visibleToRoles.filter((id) => id !== roleId))
    }
  }

  // Handle department checkbox changes
  const handleDepartmentChange = (departmentId: string, checked: boolean) => {
    if (checked) {
      setVisibleToDepartments([...visibleToDepartments, departmentId])
    } else {
      setVisibleToDepartments(visibleToDepartments.filter((id) => id !== departmentId))
    }
  }

  // Search for users
  const searchUsers = async () => {
    if (!searchTerm || searchTerm.length < 2) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out users that are already selected
        const filteredResults = data.users.filter(
          (user: any) => !visibleToUsers.some((selectedUser) => selectedUser.id === user.id),
        )
        setSearchResults(filteredResults)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Add user to visible users
  const addUser = (user: { id: string; name: string; image?: string | null }) => {
    setVisibleToUsers([...visibleToUsers, user])
    setSearchResults([])
    setSearchTerm("")
  }

  // Remove user from visible users
  const removeUser = (userId: string) => {
    setVisibleToUsers(visibleToUsers.filter((user) => user.id !== userId))
  }

  // Define visibility types based on context
  const visibilityOptions = teamId
    ? [{ id: "team", label: `Team Only (${teamName || "Team Members"})` }, ...VISIBILITY_TYPES]
    : VISIBILITY_TYPES

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Who can see this answer?</Label>
        <RadioGroup value={visibilityType} onValueChange={setVisibilityType} className="mt-2 space-y-2">
          {visibilityOptions.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <RadioGroupItem value={type.id} id={`visibility-${type.id}`} />
              <Label htmlFor={`visibility-${type.id}`}>{type.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {visibilityType === "roles" && (
        <div className="border rounded-md p-4 space-y-2">
          <Label className="text-sm font-medium">Select roles that can view this answer:</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {USER_ROLES.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={visibleToRoles.includes(role.id)}
                  onCheckedChange={(checked) => handleRoleChange(role.id, checked === true)}
                />
                <Label htmlFor={`role-${role.id}`} className="text-sm">
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibilityType === "departments" && (
        <div className="border rounded-md p-4 space-y-2">
          <Label className="text-sm font-medium">Select departments that can view this answer:</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {DEPARTMENTS.map((department) => (
              <div key={department.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`department-${department.id}`}
                  checked={visibleToDepartments.includes(department.id)}
                  onCheckedChange={(checked) => handleDepartmentChange(department.id, checked === true)}
                />
                <Label htmlFor={`department-${department.id}`} className="text-sm">
                  {department.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibilityType === "specific_users" && (
        <div className="border rounded-md p-4 space-y-4">
          <Label className="text-sm font-medium">Select specific users who can view this answer:</Label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button type="button" onClick={searchUsers} disabled={isSearching || searchTerm.length < 2}>
              <Search size={16} className="mr-1" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <ScrollArea className="h-40 border rounded-md p-2">
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => addUser(user)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image || "/placeholder.svg?height=24&width=24"} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {visibleToUsers.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Selected users:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {visibleToUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.image || "/placeholder.svg?height=20&width=20"} alt={user.name} />
                      <AvatarFallback className="text-xs">{user.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

