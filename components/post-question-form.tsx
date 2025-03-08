"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TagInput from "@/components/tag-input"
import { useToast } from "@/hooks/use-toast"

export function PostQuestionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [department, setDepartment] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post question")
      }

      const data = await response.json()

      toast({
        title: "Question Posted",
        description: "Your question has been posted successfully.",
      })

      // Redirect to the question page
      router.push(`/questions/${data.id}`)
      router.refresh()
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
    <Card>
      <CardHeader>
        <CardTitle>Question Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="What's your question? Be specific."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">Your title should summarize the problem you're facing</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="body" className="font-medium">
              Body
            </label>
            <Textarea
              id="body"
              placeholder="Provide details about your question..."
              rows={10}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Include all the information someone would need to answer your question
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="font-medium">
              Tags
            </label>
            <TagInput value={tags} onChange={setTags} disabled={isSubmitting} />
            <p className="text-sm text-muted-foreground">Add up to 5 tags to categorize your question</p>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Question"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

