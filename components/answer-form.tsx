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

interface AnswerFormProps {
  questionId: string
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to post answer")
      }

      setContent("")
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
            <Textarea
              placeholder="Write your answer here..."
              rows={8}
              className="resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              required
            />
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

