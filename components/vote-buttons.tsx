"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full h-8 w-8 transition-colors",
          currentVote === 1 ? "bg-primary/20 text-primary hover:bg-primary/30" : "",
        )}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        aria-label="Upvote"
      >
        <ArrowUp size={18} />
      </Button>
      <span
        className={cn(
          "font-medium text-sm py-1",
          votes > 0 ? "text-green-600 dark:text-green-400" : votes < 0 ? "text-red-600 dark:text-red-400" : "",
        )}
      >
        {votes}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full h-8 w-8 transition-colors",
          currentVote === -1 ? "bg-primary/20 text-primary hover:bg-primary/30" : "",
        )}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        aria-label="Downvote"
      >
        <ArrowDown size={18} />
      </Button>
    </div>
  )
}

