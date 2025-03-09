import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import QuestionForm from "@/components/question-form"
import Link from "next/link"

export default async function AskQuestionInTeamPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/auth/signin?callbackUrl=/team/" + params.id + "/questions/ask")
  }

  // Check if the user is a member of the team
  const teamMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: params.id,
        userId: currentUser.id,
      },
    },
  })

  const isOwner = await prisma.team.findFirst({
    where: {
      id: params.id,
      ownerId: currentUser.id,
    },
  })

  // If the user is not a team member or owner, deny access
  if (!teamMembership && !isOwner) {
    notFound()
  }

  // Fetch the team to display the name
  const team = await prisma.team.findUnique({
    where: {
      id: params.id,
    },
    select: {
      name: true,
    },
  })

  if (!team) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link href={`/team/${params.id}`} className="text-primary hover:underline mb-4 inline-block">
          ← Back to {team.name}
        </Link>
        <h1 className="text-3xl font-bold mt-2">Ask a Question in {team.name}</h1>
        <p className="text-muted-foreground mt-2">Get help from your team by asking a clear and concise question.</p>
      </div>

      <QuestionForm teamId={params.id} />
    </div>
  )
}

