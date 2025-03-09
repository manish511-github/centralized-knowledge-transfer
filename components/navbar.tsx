"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, Search } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import ReputationBadge from "@/components/reputation-badge"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { SearchDialogContent } from "@/components/search-dialog-content"

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoggedIn = status === "authenticated"
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setSearchDialogOpen(true)
    }
  }

  // Add keyboard shortcut listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any)
    return () => document.removeEventListener("keydown", handleKeyDown as any)
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              KnowledgeHub
            </Link>

            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/questions" className="text-muted-foreground hover:text-foreground transition-colors">
                Questions
              </Link>
              <Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">
                Tags
              </Link>
              <Link href="/users" className="text-muted-foreground hover:text-foreground transition-colors">
                Users
              </Link>
              <Link href="/teams" className="text-muted-foreground hover:text-foreground transition-colors">
                Teams
              </Link>
            </nav>
          </div>

          <div className="hidden md:block max-w-sm w-full px-4">
            <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search...</span>
                  <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                    <span>⌘</span>K
                  </kbd>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0">
                <SearchDialogContent />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSearchDialogOpen(true)}>
              <Search size={20} />
            </Button>

            <ModeToggle />

            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user?.image || "/placeholder.svg?height=32&width=32"}
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{session.user?.name}</span>
                        {session.user?.reputation !== undefined && (
                          <ReputationBadge reputation={session.user.reputation} size="sm" />
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-questions">My Questions</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks">Bookmarks</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/signin">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signin?tab=register">Sign up</Link>
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="mb-4 mt-6">
                  <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="mr-2 h-4 w-4" />
                        <span>Search...</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] p-0">
                      <SearchDialogContent />
                    </DialogContent>
                  </Dialog>
                </div>

                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                  <Link href="/questions" className="text-muted-foreground hover:text-foreground transition-colors">
                    Questions
                  </Link>
                  <Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tags
                  </Link>
                  <Link href="/users" className="text-muted-foreground hover:text-foreground transition-colors">
                    Users
                  </Link>
                  <Link href="/teams" className="text-muted-foreground hover:text-foreground transition-colors">
                    Teams
                  </Link>
                  {!isLoggedIn && (
                    <>
                      <Button variant="outline" asChild className="mt-4">
                        <Link href="/auth/signin">Log in</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/auth/signin?tab=register">Sign up</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

