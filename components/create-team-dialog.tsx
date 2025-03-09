"use client"

import type React from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

interface CreateTeamDialogProps {
  open: boolean
  onClose: () => void
  onCreate: () => void // Placeholder for create team logic
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ open, onClose, onCreate }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Team</DialogTitle>
      <DialogContent className="flex items-center justify-center">
        {" "}
        {/* Centering classes added here */}
        <DialogContentText>Are you sure you want to create a new team?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreate} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateTeamDialog

