"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface VoteButtonsProps {
  questionId?: string
  answerId?: string
  initialVotes: number
  userVote?: number | null
}

export default function VoteButtons({ questionId, answerId, initialVotes, userVote = null }: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [currentVote, setCurrentVote] = useState<number | null>(userVote)
  const [isVoting, setIsVoting] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleVote = async (value: number) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to vote",
        variant: "destructive",
      })
      router.push(`/auth/signin?callbackUrl=${window.location.pathname}`)
      return
    }

    // If user clicks the same vote button again, remove their vote
    const newValue = currentVote === value ? 0 : value

    setIsVoting(true)

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          answerId,
          value: newValue,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to vote")
      }

      // Update local state
      if (currentVote === value) {
        // Remove vote
        setVotes(votes - value)
        setCurrentVote(null)
      } else if (currentVote === null) {
        // Add new vote
        setVotes(votes + value)
        setCurrentVote(value)
      } else {
        // Change vote (e.g., from upvote to downvote)
        setVotes(votes - currentVote + value)
        setCurrentVote(value)
      }

      router.refresh()
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full ${currentVote === 1 ? "bg-primary/20" : ""}`}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        aria-label="Upvote"
      >
        <ArrowUp size={20} />
      </Button>
      <span className="font-semibold">{votes}</span>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full ${currentVote === -1 ? "bg-primary/20" : ""}`}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        aria-label="Downvote"
      >
        <ArrowDown size={20} />
      </Button>
    </div>
  )
}

