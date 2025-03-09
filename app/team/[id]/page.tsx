import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { MessageSquare, Eye, Calendar, Users, Lock, Settings, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

export default async function TeamPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/auth/signin?callbackUrl=/team/" + params.id)
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

  // Fetch the team details
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
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              department: true,
              role: true,
            },
          },
        },
      },
    },
  })

  if (!team) {
    notFound()
  }

  // Fetch recent questions for this team
  const questions = await prisma.question.findMany({
    where: {
      teamId: params.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          answers: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Calculate user role
  const userRole = isOwner ? "owner" : teamMembership?.role || "member"
  const isAdmin = userRole === "owner" || userRole === "admin"

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {team.isPrivate && (
              <Badge variant="outline" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
          {team.description && <p className="text-muted-foreground">{team.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/team/${params.id}/questions/ask`}>
              <Plus className="h-4 w-4 mr-1" />
              Ask Question
            </Link>
          </Button>
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href={`/team/${params.id}/settings`}>
                <Settings className="h-4 w-4 mr-1" />
                Manage Team
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="members">Members ({team.members.length + 1})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length > 0 ? (
                    <div className="space-y-4">
                      {questions.map((question) => (
                        <div key={question.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <Link
                            href={`/team/${params.id}/questions/${question.id}`}
                            className="text-lg font-medium hover:text-primary hover:underline"
                          >
                            {question.title}
                          </Link>
                          <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={question.author.image || "/placeholder.svg?height=20&width=20"}
                                  alt={question.author.name || ""}
                                />
                                <AvatarFallback>{question.author.name?.charAt(0) || "?"}</AvatarFallback>
                              </Avatar>
                              <span>{question.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{question._count.answers} answers</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span>{question.views} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                      <p className="text-muted-foreground mb-4">Be the first to ask a question in this team.</p>
                      <Button asChild>
                        <Link href={`/team/${params.id}/questions/ask`}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ask a Question
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Owner */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={team.owner.image || "/placeholder.svg?height=40&width=40"}
                            alt={team.owner.name || ""}
                          />
                          <AvatarFallback>{team.owner.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{team.owner.name}</div>
                          <div className="text-xs text-muted-foreground">Owner</div>
                        </div>
                      </div>
                    </div>

                    {/* Admins */}
                    {team.members
                      .filter((member) => member.role === "admin" && member.userId !== team.ownerId)
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage
                                src={member.user.image || "/placeholder.svg?height=40&width=40"}
                                alt={member.user.name || ""}
                              />
                              <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.user.name}</div>
                              <div className="text-xs text-muted-foreground">Admin</div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Regular members - just show first 5 */}
                    {team.members
                      .filter((member) => member.role === "member")
                      .slice(0, 5)
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage
                                src={member.user.image || "/placeholder.svg?height=40&width=40"}
                                alt={member.user.name || ""}
                              />
                              <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.user.name}</div>
                              <div className="text-xs text-muted-foreground">Member</div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {team.members.filter((member) => member.role === "member").length > 5 && (
                      <div className="text-center mt-2">
                        <Button variant="link" asChild>
                          <Link href={`/team/${params.id}?tab=members`}>View all members</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>All Questions</CardTitle>
                <Button asChild>
                  <Link href={`/team/${params.id}/questions/ask`}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ask Question
                  </Link>
                </Button>
              </div>
              <CardDescription>Questions asked by team members</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Questions list will be implemented here */}
              <p className="text-center py-8 text-muted-foreground">Question list will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Team Members</CardTitle>
                {isAdmin && (
                  <Button asChild>
                    <Link href={`/team/${params.id}/members/invite`}>
                      <Plus className="h-4 w-4 mr-1" />
                      Invite Members
                    </Link>
                  </Button>
                )}
              </div>
              <CardDescription>People who have access to this team's content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Owner */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={team.owner.image || "/placeholder.svg?height=40&width=40"}
                        alt={team.owner.name || ""}
                      />
                      <AvatarFallback>{team.owner.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{team.owner.name}</div>
                      <div className="text-sm text-muted-foreground">Owner</div>
                    </div>
                  </div>
                </div>

                {/* All members */}
                {team.members
                  .sort((a, b) => {
                    // Sort by role first (admin, then member)
                    if (a.role === "admin" && b.role !== "admin") return -1
                    if (a.role !== "admin" && b.role === "admin") return 1
                    // Then by name
                    return (a.user.name || "").localeCompare(b.user.name || "")
                  })
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={member.user.image || "/placeholder.svg?height=40&width=40"}
                            alt={member.user.name || ""}
                          />
                          <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.role === "admin" ? "Admin" : "Member"}
                            {member.user.department && ` • ${member.user.department}`}
                            {member.user.role && ` • ${member.user.role}`}
                          </div>
                        </div>
                      </div>
                      {isAdmin && member.userId !== currentUser.id && (
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

