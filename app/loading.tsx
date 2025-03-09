import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ThumbsUp, BookOpen } from "lucide-react"

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-5 w-full max-w-3xl" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Departments</CardTitle>
                <CardDescription>Filter questions by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-full" />
            </div>

            <Tabs defaultValue="recent">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Questions
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Popular Questions
                </TabsTrigger>
                <TabsTrigger value="unanswered">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Unanswered
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4 mt-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}

