"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search } from "lucide-react"
import QuestionCard from "@/components/question-card"

interface SearchResultsProps {
  initialQuery: string
  initialType: string
}

export function SearchResults({ initialQuery, initialType }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState(initialType || "all")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Perform search when query or type changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults(null)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query, type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is already triggered by the useEffect, this is just to handle form submission
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions, tags, or users..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="questions">Questions</SelectItem>
            <SelectItem value="tags">Tags</SelectItem>
            <SelectItem value="users">Users</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      {loading && <div className="py-8 text-center text-muted-foreground">Searching...</div>}

      {!loading && results && (
        <div className="space-y-10">
          {/* Questions */}
          {(type === "all" || type === "questions") && results.questions && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Questions</h2>
                <span className="text-muted-foreground">{results.questions.length} results</span>
              </div>

              {results.questions.length > 0 ? (
                <div className="space-y-4">
                  {results.questions.map((question: any) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">No questions found matching "{query}"</p>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {(type === "all" || type === "tags") && results.tags && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Tags</h2>
                <span className="text-muted-foreground">{results.tags.length} results</span>
              </div>

              {results.tags.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.tags.map((tag: any) => (
                    <div key={tag.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <Link href={`/tags/${tag.name}`}>
                          <Badge className="px-3 py-1 text-base font-medium">{tag.name}</Badge>
                        </Link>
                        <span className="text-muted-foreground text-sm">{tag._count.questions} questions</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">No tags found matching "{query}"</p>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {(type === "all" || type === "users") && results.users && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Users</h2>
                <span className="text-muted-foreground">{results.users.length} results</span>
              </div>

              {results.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user: any) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="border rounded-lg p-4 hover:border-primary transition-colors flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                        {user.image ? (
                          <img
                            src={user.image || "/placeholder.svg"}
                            alt={user.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <span>{user.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {user._count.questions} questions • {user._count.answers} answers
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">No users found matching "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && query && !results && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Enter a search term to find results</p>
        </div>
      )}
    </div>
  )
}

