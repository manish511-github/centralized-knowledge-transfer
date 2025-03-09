import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import TeamInviteForm from "@/components/team-invite-form"

export default async function InviteMembersPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/auth/signin?callbackUrl=/team/" + params.id + "/members/invite")
  }

  // Check if the user is a team admin or owner
  const team = await prisma.team.findUnique({
    where: {
      id: params.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        where: {
          userId: currentUser.id,
          role: "admin",
        },
      },
    },
  })

  if (!team) {
    notFound()
  }

  // Check if the user is the owner or an admin
  const isOwner = team.ownerId === currentUser.id
  const isAdmin = team.members.length > 0

  // If the user is not an admin or owner, deny access
  if (!isOwner && !isAdmin) {
    redirect(`/team/${params.id}`)
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <Link href={`/team/${params.id}`} className="text-primary hover:underline mb-4 inline-flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to team
        </Link>
        <h1 className="text-3xl font-bold mt-2">Invite Team Members</h1>
        <p className="text-muted-foreground mt-2">
          Add new members to your team to collaborate on questions and knowledge.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite to {team.name}</CardTitle>
          <CardDescription>Search for users to add to your team</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamInviteForm teamId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}

