"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TeamDangerZoneProps {
  teamId: string
  teamName: string
}

export default function TeamDangerZone({ teamId, teamName }: TeamDangerZoneProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteTeam = async () => {
    if (confirmText !== teamName) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete team")
      }

      toast({
        title: "Team deleted",
        description: "The team has been permanently deleted",
      })

      router.push("/")
    } catch (error) {
      console.error("Error deleting team:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete team",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-destructive/50 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div>
            <h3 className="font-medium text-destructive">Delete Team</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete this team and all its content. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            Delete Team
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Team</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the team and all its content.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">
              To confirm, please type <strong>{teamName}</strong> below:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={teamName}
              className="border-destructive/50"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={confirmText !== teamName || isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

