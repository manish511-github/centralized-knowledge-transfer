"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function CreateTeamPage() {
  // State for form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("private")
  const [department, setDepartment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/teams/create")
    return null
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          isPrivate: visibility === "private",
          department: department || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create team")
      }

      const data = await response.json()

      toast({
        title: "Team created",
        description: `"${name}" has been created successfully`,
      })

      // Redirect to the new team page
      router.push(`/team/${data.team.id}`)
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create a New Team</h1>
          <p className="text-muted-foreground">Set up a team to collaborate with others</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Provide details about your new team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Team Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter team name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this team is about"
                  className="min-h-[100px]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <Label>Team Visibility</Label>
                <RadioGroup
                  value={visibility}
                  onValueChange={setVisibility}
                  className="flex flex-col space-y-3"
                  disabled={isSubmitting}
                >
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="public" id="public" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="public" className="font-medium">
                        Public Team
                      </Label>
                      <p className="text-sm text-muted-foreground">Anyone in the company can see and join this team</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="private" id="private" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="private" className="font-medium">
                        Private Team
                      </Label>
                      <p className="text-sm text-muted-foreground">Only invited members can see and access this team</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Associate with a department"
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/teams">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Team"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}

