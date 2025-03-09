"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchQuestions() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsSearching(true)

    // Debounce search to avoid too many URL updates
    const timer = setTimeout(() => {
      updateSearchParams(e.target.value)
      setIsSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("")
    updateSearchParams("")
  }

  // Update URL search params
  const updateSearchParams = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative flex-1">
      <Search
        className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearching ? "text-primary" : "text-muted-foreground"}`}
      />
      <Input
        type="search"
        placeholder="Search questions..."
        className="pl-8"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {searchQuery && (
        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={handleClearSearch}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}

