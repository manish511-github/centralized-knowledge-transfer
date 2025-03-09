"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Users, Globe, Lock, ChevronRight, ChevronDown, Building2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface Team {
  id: string
  name: string
  isPrivate: boolean
}

export function SidebarTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTeams = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/teams")
        if (response.ok) {
          const data = await response.json()
          setTeams(data.teams || [])
        } else {
          throw new Error("Failed to fetch teams")
        }
      } catch (error) {
        console.error("Error loading teams:", error)
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [session, toast])

  const isTeamActive = (teamId: string | null) => {
    if (teamId === null) {
      return pathname === "/" || (pathname.startsWith("/questions") && !pathname.includes("/team/"))
    }
    return pathname.includes(`/team/${teamId}`)
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="w-full py-2">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-md transition-colors">
            <div className="flex items-center gap-2 font-medium">
              <Building2 size={16} />
              <span>Spaces</span>
              {teams.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                  {teams.length}
                </Badge>
              )}
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-1">
          <div className="w-full mt-1 space-y-1">
            <Link
              href="/teams"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left hover:bg-accent/50 transition-colors",
                pathname === "/teams" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
              )}
            >
              <Sparkles size={16} />
              <span>Browse All Teams</span>
            </Link>

            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors",
                isTeamActive(null)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <Globe size={16} />
              <span>Company-wide</span>
            </Link>
          </div>

          <Separator className="my-2" />

          <div className="px-3 pb-1 text-xs text-muted-foreground font-medium flex items-center">
            <span>MY TEAMS</span>
            {!loading && teams.length > 0 && (
              <Badge variant="outline" className="ml-2 text-xs h-5 px-1.5">
                {teams.length}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="space-y-2 px-3 py-1">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              <ScrollArea className="w-full max-h-[180px] overflow-y-auto pr-3">
                {teams.length > 0 ? (
                  <div className="space-y-1 px-1">
                    {teams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/team/${team.id}`}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors",
                          isTeamActive(team.id)
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50",
                        )}
                      >
                        {team.isPrivate ? <Lock size={14} /> : <Users size={14} />}
                        <span className="truncate">{team.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground italic">No teams found</div>
                )}
              </ScrollArea>

              <div className="px-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => router.push("/teams/create")}
                >
                  <Plus size={14} className="mr-1" />
                  Create new team
                </Button>
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

