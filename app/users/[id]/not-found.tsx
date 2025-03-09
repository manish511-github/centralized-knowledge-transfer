import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserX, Users, Home } from "lucide-react"

export default function UserNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <div className="flex justify-center mb-6">
        <div className="p-6 bg-muted rounded-full">
          <UserX size={48} className="text-muted-foreground" />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The user you're looking for doesn't exist or has been removed from the platform.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/users" className="flex items-center gap-2">
            <Users size={16} />
            Browse Users
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home size={16} />
            Go to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

