import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import TeamQuestionsList from "@/components/team-questions-list"

export default async function TeamQuestionsPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { sort?: string; filter?: string; page?: string }
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect(`/auth/signin?callbackUrl=/team/${params.id}/questions`)
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
      isPrivate: true,
    },
  })

  if (!team) {
    notFound()
  }

  // Parse query parameters
  const sort = searchParams.sort || "newest"
  const filter = searchParams.filter || "all"
  const page = Number.parseInt(searchParams.page || "1", 10)

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Link href={`/team/${params.id}`} className="text-primary hover:underline mb-4 inline-flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to {team.name}
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold">Questions in {team.name}</h1>
          <Button asChild>
            <Link href={`/team/${params.id}/questions/ask`}>
              <Plus className="h-4 w-4 mr-1" />
              Ask Question
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">Browse all questions asked within this team space</p>
      </div>

      <TeamQuestionsList teamId={params.id} sort={sort} filter={filter} page={page} />
    </div>
  )
}

