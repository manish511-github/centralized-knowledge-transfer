import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Lock, Globe, MessageSquare, Calendar, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

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
              image: true,
            },
          },
          _count: {
            select: {
              members: true,
              questions: true,
            },
          },
          questions: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              title: true,
              createdAt: true,
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
              image: true,
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
        take: 6,
      })
    : []

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Teams
          </h1>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Teams</h2>
              <Badge variant="outline" className="font-normal">
                {userTeams.length} {userTeams.length === 1 ? "team" : "teams"}
              </Badge>
            </div>

            {userTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {userTeams.map((team) => (
                  <Card key={team.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <Link
                            href={`/team/${team.id}`}
                            className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5"
                          >
                            {team.isPrivate ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            )}
                            {team.name}
                          </Link>
                        </CardTitle>
                        <Badge variant={team.isPrivate ? "outline" : "secondary"} className="text-xs">
                          {team.isPrivate ? "Private" : "Public"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-1 mt-1">
                        {team.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-2 pb-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{team._count.members + 1} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{team._count.questions} questions</span>
                        </div>
                      </div>

                      {team.questions.length > 0 && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Latest activity</span>
                          </div>
                          <Link
                            href={`/team/${team.id}/questions/${team.questions[0].id}`}
                            className="line-clamp-1 hover:text-primary hover:underline transition-colors"
                          >
                            {team.questions[0].title}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(team.questions[0].createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={team.owner.image || "/placeholder.svg?height=24&width=24"}
                            alt={team.owner.name || ""}
                          />
                          <AvatarFallback className="text-xs">{team.owner.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {team.owner.id === currentUser.id ? "You" : team.owner.name}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/team/${team.id}`}>View</Link>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Public Teams You Can Join</h2>
                <Badge variant="outline" className="font-normal">
                  {publicTeams.length} {publicTeams.length === 1 ? "team" : "teams"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {publicTeams.map((team) => (
                  <Card key={team.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <Link
                            href={`/team/${team.id}`}
                            className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5"
                          >
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {team.name}
                          </Link>
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-1 mt-1">
                        {team.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-2 pb-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{team._count.members + 1} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{team._count.questions} questions</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={team.owner.image || "/placeholder.svg?height=24&width=24"}
                            alt={team.owner.name || ""}
                          />
                          <AvatarFallback className="text-xs">{team.owner.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{team.owner.name}</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/team/${team.id}`}>Join</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {publicTeams.length > 6 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/teams/browse">View All Public Teams</Link>
                  </Button>
                </div>
              )}
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

