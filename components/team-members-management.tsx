"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, MoreHorizontal, UserPlus, Shield, UserMinus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  id: string
  userId: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    department: string | null
  }
}

interface TeamMembersManagementProps {
  teamId: string
  isOwner: boolean
}

export default function TeamMembersManagement({ teamId, isOwner }: TeamMembersManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "remove" | "promote" | "demote"
    member: TeamMember | null
    open: boolean
  }>({
    type: "remove",
    member: null,
    open: false,
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      } else {
        throw new Error("Failed to fetch team members")
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchTerm || searchTerm.length < 2) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out users that are already members
        const existingMemberIds = members.map((member) => member.user.id)
        const filteredResults = data.users.filter((user: any) => !existingMemberIds.includes(user.id))
        setSearchResults(filteredResults)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add member")
      }

      toast({
        title: "Member added",
        description: "User has been added to the team",
      })

      setShowInviteDialog(false)
      fetchMembers()
      router.refresh()
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      })
    }
  }

  const removeMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }

      toast({
        title: "Member removed",
        description: "User has been removed from the team",
      })

      setConfirmAction({ type: "remove", member: null, open: false })
      fetchMembers()
      router.refresh()
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const changeMemberRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update member role")
      }

      toast({
        title: "Role updated",
        description: `User is now a team ${role}`,
      })

      setConfirmAction({ type: "promote", member: null, open: false })
      fetchMembers()
      router.refresh()
    } catch (error) {
      console.error("Error updating member role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Members
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading members...</div>
      ) : (
        <div className="space-y-4">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No members found. Add members to your team.</div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={member.user.image || "/placeholder.svg?height=40&width=40"}
                      alt={member.user.name}
                    />
                    <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.user.name}
                      {member.role === "admin" && (
                        <Badge variant="outline" className="ml-2">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user.email}
                      {member.user.department && ` • ${member.user.department}`}
                    </div>
                  </div>
                </div>

                {(isOwner || member.role !== "admin") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {isOwner && member.role !== "admin" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({
                              type: "promote",
                              member,
                              open: true,
                            })
                          }
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      )}

                      {isOwner && member.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({
                              type: "demote",
                              member,
                              open: true,
                            })
                          }
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          setConfirmAction({
                            type: "remove",
                            member,
                            open: true,
                          })
                        }
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Invite Members Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Members</DialogTitle>
            <DialogDescription>Search for users to add to your team.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={searchUsers} disabled={searchTerm.length < 2 || isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 ? (
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || "/placeholder.svg?height=32&width=32"} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.department && `${user.department} • `}
                          {user.role || "Member"}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addMember(user.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchTerm.length > 0 && !isSearching ? (
            <div className="text-center py-8 text-muted-foreground">No users found. Try a different search term.</div>
          ) : null}

          <DialogFooter className="sm:justify-end">
            <Button variant="secondary" onClick={() => setShowInviteDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmAction.open} onOpenChange={(open) => setConfirmAction({ ...confirmAction, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction.type === "remove" && "Remove Team Member"}
              {confirmAction.type === "promote" && "Make Team Admin"}
              {confirmAction.type === "demote" && "Remove Admin Role"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction.type === "remove" && "Are you sure you want to remove this user from the team?"}
              {confirmAction.type === "promote" && "This will give the user admin privileges for the team."}
              {confirmAction.type === "demote" && "This will remove admin privileges from the user."}
            </DialogDescription>
          </DialogHeader>

          {confirmAction.member && (
            <div className="flex items-center gap-3 py-4">
              <Avatar>
                <AvatarImage
                  src={confirmAction.member.user.image || "/placeholder.svg?height=40&width=40"}
                  alt={confirmAction.member.user.name}
                />
                <AvatarFallback>{confirmAction.member.user.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{confirmAction.member.user.name}</div>
                <div className="text-sm text-muted-foreground">{confirmAction.member.user.email}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction({ ...confirmAction, open: false })}>
              Cancel
            </Button>
            <Button
              variant={confirmAction.type === "remove" ? "destructive" : "default"}
              onClick={() => {
                if (!confirmAction.member) return

                if (confirmAction.type === "remove") {
                  removeMember(confirmAction.member.userId)
                } else if (confirmAction.type === "promote") {
                  changeMemberRole(confirmAction.member.userId, "admin")
                } else if (confirmAction.type === "demote") {
                  changeMemberRole(confirmAction.member.userId, "member")
                }
              }}
            >
              {confirmAction.type === "remove" && "Remove"}
              {confirmAction.type === "promote" && "Make Admin"}
              {confirmAction.type === "demote" && "Remove Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

