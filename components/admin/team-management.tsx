"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { getTeams, addTeam, updateTeam, deleteTeam } from "@/lib/api-client"
import type { Team } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Trash2, PlusCircle } from "lucide-react"
import { toast } from "sonner"

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setIsLoading(true)
    try {
      const data = await getTeams()
      setTeams(data)
    } catch (error) {
      toast.error("Failed to fetch teams.")
      console.error("Error fetching teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddOrUpdateTeam = async () => {
    try {
      if (editingTeam) {
        const updated = await updateTeam(editingTeam.id, formData)
        if (updated) {
          toast.success("Team updated successfully!")
        } else {
          toast.error("Failed to update team.")
        }
      } else {
        const newTeam = await addTeam(formData)
        if (newTeam) {
          toast.success("Team added successfully!")
        } else {
          toast.error("Failed to add team.")
        }
      }
      resetForm()
      setIsDialogOpen(false)
      fetchTeams()
    } catch (error) {
      toast.error(`Operation failed: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Error adding/updating team:", error)
    }
  }

  const handleDeleteTeam = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const success = await deleteTeam(id)
        if (success) {
          toast.success("Team deleted successfully!")
          fetchTeams()
        } else {
          toast.error("Failed to delete team.")
        }
      } catch (error) {
        toast.error(`Deletion failed: ${error instanceof Error ? error.message : String(error)}`)
        console.error("Error deleting team:", error)
      }
    }
  }

  const handleEditClick = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTeam(null)
    setFormData({
      name: "",
      description: "",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p>Loading teams...</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Teams</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
              <DialogDescription>
                {editingTeam
                  ? "Make changes to the team here. Click save when you're done."
                  : "Fill in the details for the new team."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddOrUpdateTeam}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No teams found.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.description || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(team)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
