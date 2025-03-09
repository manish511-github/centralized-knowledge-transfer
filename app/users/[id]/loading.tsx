import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList } from "@/components/ui/tabs"

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" disabled className="mb-6">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-24" />
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-muted/50"></div>
            <CardContent className="pt-0 relative">
              <div className="flex flex-col items-center -mt-12 text-center">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="h-6 w-24 mt-2" />

                <div className="mt-4 w-full">
                  <div className="flex justify-between items-center mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-24 mt-1 ml-auto" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Skeleton className="h-9 w-32" />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 flex-shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
              <Skeleton className="h-px w-full my-2" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-28" />
              ))}
            </TabsList>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

