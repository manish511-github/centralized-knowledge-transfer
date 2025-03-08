import prisma from "@/lib/prisma"

// Reputation points configuration
export const REPUTATION_POINTS = {
  QUESTION_UPVOTE: 5,
  QUESTION_DOWNVOTE: -2,
  ANSWER_UPVOTE: 10,
  ANSWER_DOWNVOTE: -2,
  ANSWER_ACCEPTED: 15,
}

/**
 * Update user reputation when a vote is cast
 */
export async function updateReputationOnVote(
  userId: string,
  value: number,
  questionId?: string,
  answerId?: string,
  previousValue?: number,
) {
  try {
    // Calculate reputation change
    let reputationChange = 0

    // If this is a new vote
    if (previousValue === undefined) {
      if (questionId) {
        reputationChange = value === 1 ? REPUTATION_POINTS.QUESTION_UPVOTE : REPUTATION_POINTS.QUESTION_DOWNVOTE
      } else if (answerId) {
        reputationChange = value === 1 ? REPUTATION_POINTS.ANSWER_UPVOTE : REPUTATION_POINTS.ANSWER_DOWNVOTE
      }
    }
    // If this is changing an existing vote
    else {
      // Undo previous vote effect
      if (questionId) {
        reputationChange -=
          previousValue === 1 ? REPUTATION_POINTS.QUESTION_UPVOTE : REPUTATION_POINTS.QUESTION_DOWNVOTE
      } else if (answerId) {
        reputationChange -= previousValue === 1 ? REPUTATION_POINTS.ANSWER_UPVOTE : REPUTATION_POINTS.ANSWER_DOWNVOTE
      }

      // Add new vote effect
      if (value !== 0) {
        // If not removing vote
        if (questionId) {
          reputationChange += value === 1 ? REPUTATION_POINTS.QUESTION_UPVOTE : REPUTATION_POINTS.QUESTION_DOWNVOTE
        } else if (answerId) {
          reputationChange += value === 1 ? REPUTATION_POINTS.ANSWER_UPVOTE : REPUTATION_POINTS.ANSWER_DOWNVOTE
        }
      }
    }

    // If there's no change, return early
    if (reputationChange === 0) return

    // Get the content author's ID
    let authorId: string | null = null

    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { authorId: true },
      })
      authorId = question?.authorId || null
    } else if (answerId) {
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        select: { authorId: true },
      })
      authorId = answer?.authorId || null
    }

    // Update the author's reputation if found
    if (authorId) {
      await prisma.user.update({
        where: { id: authorId },
        data: {
          reputation: {
            increment: reputationChange,
          },
        },
      })
    }
  } catch (error) {
    console.error("Error updating reputation on vote:", error)
  }
}

/**
 * Update user reputation when an answer is accepted
 */
export async function updateReputationOnAcceptedAnswer(answerId: string) {
  try {
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { authorId: true },
    })

    if (answer) {
      await prisma.user.update({
        where: { id: answer.authorId },
        data: {
          reputation: {
            increment: REPUTATION_POINTS.ANSWER_ACCEPTED,
          },
        },
      })
    }
  } catch (error) {
    console.error("Error updating reputation on accepted answer:", error)
  }
}

/**
 * Get reputation level based on points
 */
export function getReputationLevel(reputation: number) {
  if (reputation < 10) return "Newcomer"
  if (reputation < 50) return "Beginner"
  if (reputation < 200) return "Regular"
  if (reputation < 500) return "Established"
  if (reputation < 1000) return "Trusted"
  if (reputation < 2000) return "Expert"
  return "Master"
}

/**
 * Get reputation color based on points
 */
export function getReputationColor(reputation: number) {
  if (reputation < 10) return "text-slate-500"
  if (reputation < 50) return "text-blue-500"
  if (reputation < 200) return "text-green-500"
  if (reputation < 500) return "text-yellow-500"
  if (reputation < 1000) return "text-orange-500"
  if (reputation < 2000) return "text-red-500"
  return "text-purple-500"
}

