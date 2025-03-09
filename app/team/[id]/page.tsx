import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { MessageSquare, Eye, Calendar, Users, Lock, Settings, Plus, Globe, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { ReputationBadge } from "@/components/reputation-badge"

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
          reputation: true,
          department: true,
          role: true,
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
              reputation: true,
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
          reputation: true,
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
    <div className="container max-w-7xl py-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
            {team.isPrivate ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            )}
          </div>
          {team.description && <p className="text-muted-foreground text-sm md:text-base">{team.description}</p>}
        </div>
        <div className="flex gap-2 self-end md:self-auto">
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
                Manage
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Members ({team.members.length + 1})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Recent Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <div key={question.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <Link
                            href={`/team/${params.id}/questions/${question.id}`}
                            className="text-base font-medium hover:text-primary hover:underline transition-colors"
                          >
                            {question.title}
                          </Link>
                          <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-2 gap-3">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={question.author.image || "/placeholder.svg?height=20&width=20"}
                                  alt={question.author.name || ""}
                                />
                                <AvatarFallback>{question.author.name?.charAt(0) || "?"}</AvatarFallback>
                              </Avatar>
                              <span className="flex items-center gap-1">
                                {question.author.name}
                                <ReputationBadge reputation={question.author.reputation} size="xs" />
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>
                                {question._count.answers} {question._count.answers === 1 ? "answer" : "answers"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>
                                {question.views} {question.views === 1 ? "view" : "views"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-base font-medium mb-2">No questions yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Be the first to ask a question in this team.</p>
                      <Button size="sm" asChild>
                        <Link href={`/team/${params.id}/questions/ask`}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ask a Question
                        </Link>
                      </Button>
                    </div>
                  )}

                  {questions.length > 0 && (
                    <div className="mt-4 pt-3 border-t text-center">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/team/${params.id}/questions`} className="flex items-center">
                          View all questions
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Team Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Activity feed will be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Owner */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={team.owner.image || "/placeholder.svg?height=32&width=32"}
                            alt={team.owner.name || ""}
                          />
                          <AvatarFallback>{team.owner.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {team.owner.name}
                            <ReputationBadge reputation={team.owner.reputation} size="xs" />
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                              Owner
                            </Badge>
                            {team.owner.department && <span>• {team.owner.department}</span>}
                            {team.owner.role && <span>• {team.owner.role}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admins */}
                    {team.members
                      .filter((member) => member.role === "admin" && member.userId !== team.ownerId)
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={member.user.image || "/placeholder.svg?height=32&width=32"}
                                alt={member.user.name || ""}
                              />
                              <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                {member.user.name}
                                <ReputationBadge reputation={member.user.reputation} size="xs" />
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Badge variant="outline" className="h-4 px-1 text-[10px]">
                                  Admin
                                </Badge>
                                {member.user.department && <span>• {member.user.department}</span>}
                                {member.user.role && <span>• {member.user.role}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Regular members - just show first 3 */}
                    {team.members
                      .filter((member) => member.role === "member")
                      .slice(0, 3)
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={member.user.image || "/placeholder.svg?height=32&width=32"}
                                alt={member.user.name || ""}
                              />
                              <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                {member.user.name}
                                <ReputationBadge reputation={member.user.reputation} size="xs" />
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Badge variant="outline" className="h-4 px-1 text-[10px] bg-muted/50">
                                  Member
                                </Badge>
                                {member.user.department && <span>• {member.user.department}</span>}
                                {member.user.role && <span>• {member.user.role}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {team.members.filter((member) => member.role === "member").length > 3 && (
                      <div className="text-center mt-2">
                        <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                          <Link href={`/team/${params.id}?tab=members`} className="flex items-center">
                            View all members
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Team Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Questions</span>
                      <Badge variant="secondary">{questions.length}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Members</span>
                      <Badge variant="secondary">{team.members.length + 1}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Created</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>All Questions</CardTitle>
                <Button asChild size="sm">
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
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Question list will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Team Members</CardTitle>
                {isAdmin && (
                  <Button asChild size="sm">
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
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={team.owner.image || "/placeholder.svg?height=40&width=40"}
                        alt={team.owner.name || ""}
                      />
                      <AvatarFallback>{team.owner.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {team.owner.name}
                        <ReputationBadge reputation={team.owner.reputation} size="sm" />
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
                        <Badge variant="secondary">Owner</Badge>
                        {team.owner.department && <span>• {team.owner.department}</span>}
                        {team.owner.role && <span>• {team.owner.role}</span>}
                      </div>
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
                    <div key={member.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={member.user.image || "/placeholder.svg?height=40&width=40"}
                            alt={member.user.name || ""}
                          />
                          <AvatarFallback>{member.user.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {member.user.name}
                            <ReputationBadge reputation={member.user.reputation} size="sm" />
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
                            <Badge variant={member.role === "admin" ? "secondary" : "outline"}>
                              {member.role === "admin" ? "Admin" : "Member"}
                            </Badge>
                            {member.user.department && <span>• {member.user.department}</span>}
                            {member.user.role && <span>• {member.user.role}</span>}
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

