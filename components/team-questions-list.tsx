"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import QuestionCard from "@/components/question-card"
import { Pagination } from "@/components/ui/pagination"
import { Plus } from "lucide-react"
import { Link } from "next/link"

interface TeamQuestionsListProps {
  teamId: string
  sort: string
  filter: string
  page: number
}

export default function TeamQuestionsList({ teamId, sort, filter, page }: TeamQuestionsListProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      try {
        // Build query parameters
        const params = new URLSearchParams()
        params.set("teamId", teamId)
        params.set("sort", sort)
        params.set("filter", filter)
        params.set("page", page.toString())
        params.set("limit", "10")

        const response = await fetch(`/api/team-questions?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch questions")
        }

        const data = await response.json()
        setQuestions(data.questions || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error("Error fetching team questions:", error)
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [teamId, sort, filter, page, toast])

  // Update URL when filters change
  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    params.set("page", "1") // Reset to page 1 when filters change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Team Questions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={sort} onValueChange={(value) => updateQueryParams("sort", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="active">Most Active</SelectItem>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={filter} onValueChange={(value) => updateQueryParams("filter", value)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="answered">Answered</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => updateQueryParams("page", newPage.toString())}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all"
                ? "No questions have been asked in this team yet."
                : `No ${filter} questions found in this team.`}
            </p>
            <Button asChild>
              <Link href={`/team/${teamId}/questions/ask`}>
                <Plus className="h-4 w-4 mr-1" />
                Ask the first question
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

