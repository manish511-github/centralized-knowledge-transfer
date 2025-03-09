import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import TeamSettingsForm from "@/components/team-settings-form"
import TeamMembersManagement from "@/components/team-members-management"
import TeamDangerZone from "@/components/team-danger-zone"

export default async function TeamSettingsPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/auth/signin?callbackUrl=/team/" + params.id + "/settings")
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
          image: true,
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
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link href={`/team/${params.id}`} className="text-primary hover:underline mb-4 inline-flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to team
        </Link>
        <h1 className="text-3xl font-bold mt-2">Team Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your team's settings, members, and permissions.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isOwner && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Update your team's basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamSettingsForm team={team} isOwner={isOwner} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team members and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersManagement teamId={params.id} isOwner={isOwner} />
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="danger">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that affect your team</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamDangerZone teamId={params.id} teamName={team.name} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

