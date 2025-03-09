"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTeams } from "@/components/sidebar-teams"
import { HelpCircle, Home, MessageSquare, Search, Settings, Tag, Award, Users, MenuIcon } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export const navigationLinks = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Questions",
    icon: MessageSquare,
    href: "/questions",
  },
  {
    title: "Teams",
    icon: Users,
    href: "/teams",
  },
  {
    title: "Tags",
    icon: Tag,
    href: "/tags",
  },
  {
    title: "Users",
    icon: Award, // Changed from Users to Award to avoid duplicate icons
    href: "/users",
  },
  {
    title: "Leaderboard",
    icon: Award,
    href: "/leaderboard",
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 h-full flex flex-col">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight ml-2">Knowledge Platform</h2>
            </Link>
          </div>
          <div className="mt-4">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col space-y-1">
            {navigationLinks.map((link) => (
              <Button
                key={link.href}
                variant={isActive(link.href) ? "secondary" : "ghost"}
                asChild
                className="justify-start"
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="mx-3" />

        <SidebarTeams />

        <div className="mt-auto px-3">
          {session?.user && (
            <>
              <Separator className="mb-4" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium truncate">{session.user.name}</div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <ScrollArea className="h-full">
          <Sidebar />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

