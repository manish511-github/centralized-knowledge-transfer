"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AcceptAnswerButtonProps {
  questionId: string
  answerId: string
  isAccepted: boolean
  isQuestionAuthor: boolean
}

export default function AcceptAnswerButton({
  questionId,
  answerId,
  isAccepted,
  isQuestionAuthor,
}: AcceptAnswerButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAccept = async () => {
    if (!isQuestionAuthor) {
      toast({
        title: "Permission denied",
        description: "Only the question author can accept answers",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/questions/${questionId}/answers/${answerId}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to accept answer")
      }

      toast({
        title: "Answer accepted",
        description: "This answer has been marked as accepted",
      })

      router.refresh()
    } catch (error) {
      console.error("Error accepting answer:", error)
      toast({
        title: "Error",
        description: "Failed to accept this answer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isQuestionAuthor) return null

  return (
    <Button
      variant={isAccepted ? "default" : "outline"}
      size="sm"
      className={`gap-1 ${isAccepted ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-600 hover:bg-green-50"}`}
      onClick={handleAccept}
      disabled={isSubmitting || isAccepted}
    >
      <Check size={16} />
      {isAccepted ? "Accepted" : "Accept Answer"}
    </Button>
  )
}

