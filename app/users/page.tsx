import Link from "next/link"
import { Search } from "lucide-react"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; department?: string; role?: string }
}) {
  // Get query parameters
  const searchQuery = searchParams.q || ""
  const sort = searchParams.sort || "reputation"
  const departmentFilter = searchParams.department || ""
  const roleFilter = searchParams.role || ""

  // Build the query
  const where: any = {}

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
    ]
  }

  if (departmentFilter) {
    where.department = departmentFilter
  }

  if (roleFilter) {
    where.role = roleFilter
  }

  // Determine the sort order
  let orderBy: any = { reputation: "desc" }
  if (sort === "name") {
    orderBy = { name: "asc" }
  } else if (sort === "recent") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "questions") {
    orderBy = [{ questions: { _count: "desc" } }, { reputation: "desc" }]
  } else if (sort === "answers") {
    orderBy = [{ answers: { _count: "desc" } }, { reputation: "desc" }]
  }

  // Fetch users from the database
  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          questions: true,
          answers: true,
        },
      },
    },
    orderBy,
    take: 50,
  })

  // Fetch all departments and roles for filters
  const departments = await prisma.user.findMany({
    select: {
      department: true,
    },
    distinct: ["department"],
    where: {
      department: {
        not: null,
      },
    },
  })

  const roles = await prisma.user.findMany({
    select: {
      role: true,
    },
    distinct: ["role"],
    where: {
      role: {
        not: null,
      },
    },
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-2">Browse all {users.length} users on the knowledge platform</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <form>
              <Input type="text" name="q" placeholder="Search users..." className="pl-10" defaultValue={searchQuery} />
              {(departmentFilter || roleFilter) && <input type="hidden" name="department" value={departmentFilter} />}
              {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Link
                  href={`/users?sort=${sort}${searchQuery ? `&q=${searchQuery}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                  className={`px-3 py-2 rounded-md text-sm ${
                    !departmentFilter ? "bg-primary text-primary-foreground" : "hover:bg-secondary/80"
                  }`}
                >
                  All Departments
                </Link>
                {departments.map((dept) => (
                  <Link
                    key={dept.department}
                    href={`/users?department=${dept.department}${searchQuery ? `&q=${searchQuery}` : ""}&sort=${sort}${roleFilter ? `&role=${roleFilter}` : ""}`}
                    className={`px-3 py-2 rounded-md text-sm ${
                      dept.department === departmentFilter
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary/80"
                    }`}
                  >
                    {dept.department}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Link
                  href={`/users?sort=${sort}${searchQuery ? `&q=${searchQuery}` : ""}${departmentFilter ? `&department=${departmentFilter}` : ""}`}
                  className={`px-3 py-2 rounded-md text-sm ${
                    !roleFilter ? "bg-primary text-primary-foreground" : "hover:bg-secondary/80"
                  }`}
                >
                  All Roles
                </Link>
                {roles.map((r) => (
                  <Link
                    key={r.role}
                    href={`/users?role=${r.role}${searchQuery ? `&q=${searchQuery}` : ""}&sort=${sort}${departmentFilter ? `&department=${departmentFilter}` : ""}`}
                    className={`px-3 py-2 rounded-md text-sm ${
                      r.role === roleFilter ? "bg-primary text-primary-foreground" : "hover:bg-secondary/80"
                    }`}
                  >
                    {r.role}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={sort} className="mb-6">
                <TabsList>
                  <TabsTrigger value="reputation" asChild>
                    <Link
                      href={`/users?sort=reputation${searchQuery ? `&q=${searchQuery}` : ""}${departmentFilter ? `&department=${departmentFilter}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                    >
                      Reputation
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger value="name" asChild>
                    <Link
                      href={`/users?sort=name${searchQuery ? `&q=${searchQuery}` : ""}${departmentFilter ? `&department=${departmentFilter}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                    >
                      Name
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger value="recent" asChild>
                    <Link
                      href={`/users?sort=recent${searchQuery ? `&q=${searchQuery}` : ""}${departmentFilter ? `&department=${departmentFilter}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                    >
                      New Users
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger value="questions" asChild>
                    <Link
                      href={`/users?sort=questions${searchQuery ? `&q=${searchQuery}` : ""}${departmentFilter ? `&department=${departmentFilter}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                    >
                      Questions
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger value="answers" asChild>
                    <Link
                      href={`/users?sort=answers${searchQuery ? `&q=${searchQuery}` : ""}${departmentFilter ? `&department=${departmentFilter}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                    >
                      Answers
                    </Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery
                      ? `No users matching "${searchQuery}"`
                      : "There are no users matching the selected filters"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function UserCard({ user }: { user: any }) {
  return (
    <Link href={`/users/${user.id}`}>
      <div className="border rounded-lg p-4 hover:border-primary transition-colors">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{user.name}</h3>
              <Badge variant="secondary" className="ml-2">
                {user.reputation} rep
              </Badge>
            </div>
            {user.role && <p className="text-sm text-muted-foreground mt-1">{user.role}</p>}
            {user.department && <p className="text-sm text-muted-foreground">{user.department}</p>}
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{user._count.questions} questions</span>
              <span>{user._count.answers} answers</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

