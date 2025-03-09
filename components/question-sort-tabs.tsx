"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function QuestionSortTabs() {
  const searchParams = useSearchParams()
  const currentParams = new URLSearchParams(searchParams.toString())
  const sortMethod = searchParams.get("sort") || "newest"

  // Create URLs with the current search parameters but different sort values
  const createSortUrl = (sort: string) => {
    const params = new URLSearchParams(currentParams)
    params.set("sort", sort)
    return `/?${params.toString()}`
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Link href={createSortUrl("newest")}>
        <Button variant={sortMethod === "newest" || !sortMethod ? "outline" : "ghost"} size="sm">
          Newest
        </Button>
      </Link>
      <Link href={createSortUrl("most-answered")}>
        <Button variant={sortMethod === "most-answered" ? "outline" : "ghost"} size="sm">
          Most Answered
        </Button>
      </Link>
      <Link href={createSortUrl("most-viewed")}>
        <Button variant={sortMethod === "most-viewed" ? "outline" : "ghost"} size="sm">
          Most Viewed
        </Button>
      </Link>
    </div>
  )
}

