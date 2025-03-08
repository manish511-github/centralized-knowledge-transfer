"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { debounce } from "@/lib/utils"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const performSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setResults(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300),
    [],
  )

  useEffect(() => {
    performSearch(searchTerm)
  }, [searchTerm, performSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setOpen((open) => !open)
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any)
    return () => document.removeEventListener("keydown", handleKeyDown as any)
  }, [])

  const handleSelect = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2 border-b pb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, tags, or users..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading && <div className="p-4 text-center text-muted-foreground">Searching...</div>}

          {!loading && searchTerm.length < 2 && (
            <div className="p-4 text-center text-muted-foreground">Type at least 2 characters to search</div>
          )}

          {!loading && results && (
            <div className="space-y-6">
              {/* Questions */}
              {results.questions && results.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Questions</h3>
                  <ul className="space-y-2">
                    {results.questions.map((question: any) => (
                      <li
                        key={question.id}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => handleSelect(`/questions/${question.id}`)}
                      >
                        <div className="font-medium">{question.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{question.body}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.tags.map((tag: any) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="link"
                    className="px-0 mt-1"
                    onClick={() => handleSelect(`/search?q=${encodeURIComponent(searchTerm)}&type=questions`)}
                  >
                    View all questions
                  </Button>
                </div>
              )}

              {/* Tags */}
              {results.tags && results.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map((tag: any) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSelect(`/tags/${tag.name}`)}
                      >
                        {tag.name} ({tag._count.questions})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Users</h3>
                  <ul className="space-y-2">
                    {results.users.map((user: any) => (
                      <li
                        key={user.id}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-center gap-3"
                        onClick={() => handleSelect(`/users/${user.id}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image || "/placeholder.svg"}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <span className="text-sm">{user.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.department} • {user._count.questions} questions • {user._count.answers} answers
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No results */}
              {(!results.questions || results.questions.length === 0) &&
                (!results.tags || results.tags.length === 0) &&
                (!results.users || results.users.length === 0) && (
                  <div className="p-4 text-center text-muted-foreground">No results found for "{searchTerm}"</div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

