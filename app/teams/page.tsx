import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Lock, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function TeamsPage() {
  const currentUser = await getCurrentUser()

  // Fetch teams the user is a member of
  const userTeams = currentUser
    ? await prisma.team.findMany({
        where: {
          OR: [
            { ownerId: currentUser.id },
            {
              members: {
                some: {
                  userId: currentUser.id,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
              questions: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    : []

  // Fetch public teams the user is not a member of
  const publicTeams = currentUser
    ? await prisma.team.findMany({
        where: {
          isPrivate: false,
          AND: [
            { ownerId: { not: currentUser.id } },
            {
              members: {
                none: {
                  userId: currentUser.id,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
              questions: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    : []

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-2">Collaborate with your colleagues in dedicated spaces</p>
        </div>
        {currentUser && (
          <Button asChild>
            <Link href="/teams/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Link>
          </Button>
        )}
      </div>

      {currentUser ? (
        <>
          {/* User's Teams */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Your Teams</h2>
            {userTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTeams.map((team) => (
                  <Card key={team.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          {team.name}
                          {team.isPrivate ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                        <Badge variant={team.isPrivate ? "outline" : "secondary"}>
                          {team.isPrivate ? "Private" : "Public"}
                        </Badge>
                      </div>
                      <CardDescription>{team.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{team._count.members + 1} members</span>
                        </div>
                        <div>{team._count.questions} questions</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="text-xs text-muted-foreground">Created by {team.owner.name}</div>
                      <Button asChild>
                        <Link href={`/team/${team.id}`}>View Team</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="mb-4">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">You're not in any teams yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a team or join an existing one to collaborate with your colleagues.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/teams/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Team
                  </Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Public Teams */}
          {publicTeams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Public Teams You Can Join</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicTeams.map((team) => (
                  <Card key={team.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          {team.name}
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                        <Badge variant="secondary">Public</Badge>
                      </div>
                      <CardDescription>{team.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{team._count.members + 1} members</span>
                        </div>
                        <div>{team._count.questions} questions</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="text-xs text-muted-foreground">Created by {team.owner.name}</div>
                      <Button asChild>
                        <Link href={`/team/${team.id}`}>View Team</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="mb-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">Sign in to view teams</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to view and join teams.</p>
          </div>
          <Button asChild>
            <Link href="/auth/signin?callbackUrl=/teams">Sign In</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}

