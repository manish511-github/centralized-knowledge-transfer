"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface TeamSettingsFormProps {
  team: {
    id: string
    name: string
    description: string | null
    isPrivate: boolean
  }
  isOwner: boolean
}

export default function TeamSettingsForm({ team, isOwner }: TeamSettingsFormProps) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || "")
  const [isPrivate, setIsPrivate] = useState(team.isPrivate)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          isPrivate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update team")
      }

      toast({
        title: "Team updated",
        description: "Team settings have been updated successfully",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating team:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update team",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Engineering Team"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A place for engineering-related discussions and knowledge sharing"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="private-switch">Private Team</Label>
          <p className="text-sm text-muted-foreground">
            {isPrivate
              ? "Only team members can see and access team content"
              : "Anyone in the company can see team content"}
          </p>
        </div>
        <Switch id="private-switch" checked={isPrivate} onCheckedChange={setIsPrivate} disabled={!isOwner} />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

