"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Award, BookOpen, Building2, FileQuestion, Home, Tag, Users } from "lucide-react"

const items = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Questions",
    href: "/questions",
    icon: FileQuestion,
  },
  {
    title: "Tags",
    href: "/tags",
    icon: Tag,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Building2,
  },
  {
    title: "Articles",
    href: "/articles",
    icon: BookOpen,
  },
  {
    title: "Rewards",
    href: "/rewards",
    icon: Award,
  },
]

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

