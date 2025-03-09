import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-64 mb-6" />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

