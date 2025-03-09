"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Tag, User, MessageSquare, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { debounce } from "@/lib/utils"

export function SearchDialogContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<string>("all")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const performSearch = useCallback(
    debounce(async (term: string, type: string) => {
      if (!term || term.length < 2) {
        setResults(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&type=${type}`)
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
    performSearch(searchTerm, searchType)
  }, [searchTerm, searchType, performSearch])

  const handleSelect = (path: string) => {
    router.push(path)
    // Close dialog will be handled by parent component
  }

  const handleClear = () => {
    setSearchTerm("")
    setResults(null)
  }

  return (
    <>
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 border-b pb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <div className="relative flex-1">
            <Input
              placeholder="Search questions, tags, or users..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <Tabs defaultValue={searchType} className="mt-2" onValueChange={setSearchType}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex-1">
              Questions
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex-1">
              Tags
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              Users
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {loading && (
          <div className="p-4 text-center text-muted-foreground flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Searching...
          </div>
        )}

        {!loading && searchTerm.length < 2 && (
          <div className="p-4 text-center text-muted-foreground">Type at least 2 characters to search</div>
        )}

        {!loading && results && (
          <div className="space-y-6">
            {/* Questions */}
            {(searchType === "all" || searchType === "questions") &&
              results.questions &&
              results.questions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-primary" />
                    <h3 className="font-semibold">Questions</h3>
                  </div>
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
            {(searchType === "all" || searchType === "tags") && results.tags && results.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-primary" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleSelect(`/questions?tag=${tag.name}`)}
                    >
                      {tag.name} ({tag._count.questions})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {(searchType === "all" || searchType === "users") && results.users && results.users.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-primary" />
                  <h3 className="font-semibold">Users</h3>
                </div>
                <ul className="space-y-2">
                  {results.users.map((user: any) => (
                    <li
                      key={user.id}
                      className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-center gap-3"
                      onClick={() => handleSelect(`/users/${user.id}`)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || "/placeholder.svg?height=32&width=32"} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
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
    </>
  )
}

