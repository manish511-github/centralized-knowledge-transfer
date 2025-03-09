"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { VisibilitySelector } from "@/components/visibility-selector"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Lock } from "lucide-react"

interface AnswerFormProps {
  questionId: string
  teamId?: string | null
}

export default function AnswerForm({ questionId, teamId }: AnswerFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false)
  // Update the visibility state to include 'team' option
  const [visibility, setVisibility] = useState({
    visibilityType: teamId ? "team" : "public",
    visibleToRoles: [] as string[],
    visibleToDepartments: [] as string[],
    visibleToUsers: [] as { id: string; name: string; image?: string | null }[],
  })

  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post an answer",
        variant: "destructive",
      })
      router.push(`/auth/signin?callbackUrl=/questions/${questionId}`)
      return
    }

    if (!content.trim()) {
      toast({
        title: "Empty answer",
        description: "Please write something before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          visibility: {
            visibilityType: visibility.visibilityType,
            visibleToRoles: visibility.visibilityType === "roles" ? visibility.visibleToRoles : [],
            visibleToDepartments: visibility.visibilityType === "departments" ? visibility.visibleToDepartments : [],
            visibleToUsers:
              visibility.visibilityType === "specific_users" ? visibility.visibleToUsers.map((user) => user.id) : [],
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post answer")
      }

      setContent("")
      setVisibility({
        visibilityType: "public",
        visibleToRoles: [],
        visibleToDepartments: [],
        visibleToUsers: [],
      })

      toast({
        title: "Answer posted",
        description: "Your answer has been posted successfully",
      })

      // Refresh the page to show the new answer
      router.refresh()
    } catch (error) {
      console.error("Error posting answer:", error)
      toast({
        title: "Error",
        description: "Failed to post your answer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6">
          {!session?.user ? (
            <div className="text-center py-6">
              <p className="mb-4 text-muted-foreground">You need to be logged in to answer this question.</p>
              <Button asChild>
                <Link href={`/auth/signin?callbackUrl=/questions/${questionId}`}>Sign in to post your answer</Link>
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                placeholder="Write your answer here..."
                rows={8}
                className="resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <Collapsible
                open={isVisibilityOpen}
                onOpenChange={setIsVisibilityOpen}
                className="mt-4 border rounded-md"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex w-full justify-between p-4 font-normal" type="button">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      <span>
                        {visibility.visibilityType === "public"
                          ? "Visible to everyone"
                          : `Restricted visibility (${visibility.visibilityType})`}
                      </span>
                    </div>
                    {isVisibilityOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 border-t">
                  <VisibilitySelector value={visibility} onChange={setVisibility} />
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </CardContent>
        {session?.user && (
          <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Remember to be respectful and provide clear explanations.</p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Your Answer"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  )
}

