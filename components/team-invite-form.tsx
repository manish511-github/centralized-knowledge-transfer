"use client"

import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TeamInviteFormProps {
  teamId: string
}

export default function TeamInviteForm({ teamId }: TeamInviteFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [invitedUsers, setInvitedUsers] = useState<string[]>([])

  const router = useRouter()
  const { toast } = useToast()

  const searchUsers = async () => {
    if (!searchTerm || searchTerm.length < 2) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
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

      setInvitedUsers([...invitedUsers, userId])

      toast({
        title: "Member added",
        description: "User has been added to the team",
      })
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                searchUsers()
              }
            }}
          />
        </div>
        <Button onClick={searchUsers} disabled={searchTerm.length < 2 || isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {searchResults.length > 0 ? (
        <ScrollArea className="h-[300px] border rounded-md p-2">
          <div className="space-y-2">
            {searchResults.map((user) => {
              const isInvited = invitedUsers.includes(user.id)

              return (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                        {user.department && ` • ${user.department}`}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isInvited ? "outline" : "default"}
                    onClick={() => !isInvited && addMember(user.id)}
                    disabled={isInvited}
                  >
                    {isInvited ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      ) : searchTerm.length > 0 && !isSearching ? (
        <div className="text-center py-8 text-muted-foreground">No users found. Try a different search term.</div>
      ) : null}

      <div className="flex justify-between pt-4">
        <Button variant="outline" asChild>
          <Link href={`/team/${teamId}`}>Cancel</Link>
        </Button>
        <Button onClick={() => router.push(`/team/${teamId}`)}>Done</Button>
      </div>
    </div>
  )
}

