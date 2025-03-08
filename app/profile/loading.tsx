import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-12">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

