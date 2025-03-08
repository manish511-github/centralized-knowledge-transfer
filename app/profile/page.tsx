import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function ProfileRedirect() {
  // Get the current user
  const user = await getCurrentUser()

  // If user is not logged in, redirect to sign in
  if (!user) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  // Redirect to the user's profile page
  redirect(`/users/${user.id}`)
}

