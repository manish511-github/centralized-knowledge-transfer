import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile-form"

export default async function SettingsPage() {
  // Ensure user is authenticated
  const user = await requireAuth()

  // Fetch user data
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      department: true,
      bio: true,
      image: true,
    },
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and how it appears on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={userData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Email Notifications</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notify-answers" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="notify-answers">Notify me when someone answers my question</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notify-comments" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="notify-comments">Notify me when someone comments on my post</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notify-accepts" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="notify-accepts">Notify me when my answer is accepted</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Privacy Settings</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-email" className="rounded border-gray-300" />
                  <Label htmlFor="show-email">Show my email address on my profile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-activity" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="show-activity">Show my activity feed on my profile</Label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

