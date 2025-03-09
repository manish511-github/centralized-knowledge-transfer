"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Lock } from "lucide-react"

interface Team {
  id: string
  name: string
  isPrivate: boolean
}

interface QuestionFormProps {
  teamId?: string
  initialData?: {
    title: string
    body: string
    tags: string[]
  }
}

export default function QuestionForm({ teamId, initialData }: QuestionFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [body, setBody] = useState(initialData?.body || "")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teamId || null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isTeamsLoading, setIsTeamsLoading] = useState(false)
  const [showPrivateWarning, setShowPrivateWarning] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  useEffect(() => {
    // If a teamId is provided, we don't need to fetch teams
    if (teamId) return

    const fetchTeams = async () => {
      if (!session?.user) return

      setIsTeamsLoading(true)
      try {
        const response = await fetch("/api/teams")
        if (response.ok) {
          const data = await response.json()
          setTeams(data.teams || [])
        }
      } catch (error) {
        console.error("Error fetching teams:", error)
      } finally {
        setIsTeamsLoading(false)
      }
    }

    fetchTeams()
  }, [session, teamId])

  // Handle tag input
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTeamChange = (value: string) => {
    if (value === "public") {
      setSelectedTeamId(null)
      setSelectedTeam(null)
    } else {
      const team = teams.find((t) => t.id === value) || null
      setSelectedTeamId(value)
      setSelectedTeam(team)

      // Show warning dialog if selecting a private team
      if (team?.isPrivate) {
        setShowPrivateWarning(true)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to ask a question",
        variant: "destructive",
      })
      router.push("/auth/signin?callbackUrl=/questions/ask")
      return
    }

    if (!title.trim() || !body.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and description for your question",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          tags,
          teamId: selectedTeamId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create question")
      }

      const data = await response.json()

      toast({
        title: "Question posted",
        description: "Your question has been posted successfully",
      })

      // Redirect to the question detail page or team questions page
      if (selectedTeamId) {
        router.push(`/team/${selectedTeamId}/questions/${data.id}`)
      } else {
        router.push(`/questions/${data.id}`)
      }
    } catch (error) {
      console.error("Error posting question:", error)
      toast({
        title: "Error",
        description: "Failed to post your question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!teamId && (
              <div className="space-y-2">
                <Label htmlFor="team">Space</Label>
                <Select
                  onValueChange={handleTeamChange}
                  defaultValue={selectedTeamId || "public"}
                  disabled={isTeamsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where do you want to ask this question?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Company-wide (Public)</SelectItem>

                    {teams.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Teams</div>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} {team.isPrivate && <Lock className="inline h-3 w-3 ml-1" />}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {selectedTeam && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {selectedTeam.isPrivate ? (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        Only visible to team members
                      </>
                    ) : (
                      "Visible to all company employees"
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to implement authentication in Next.js?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Question Details</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe your question in detail..."
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. react, nextjs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Press Enter or comma to add a tag</div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-sm flex items-center group"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showPrivateWarning} onOpenChange={setShowPrivateWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Posting to a Private Team
            </DialogTitle>
            <DialogDescription>
              Your question will only be visible to members of {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p>This is a private team space. Only team members can see and respond to your question.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPrivateWarning(false)}>I understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

