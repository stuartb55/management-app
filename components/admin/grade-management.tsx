"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { getGrades, addGrade, updateGrade, deleteGrade } from "@/lib/api-client"
import type { Grade } from "@/lib/types"
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

export function GradeManagement() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    setIsLoading(true)
    try {
      const data = await getGrades()
      setGrades(data)
    } catch (error) {
      toast.error("Failed to fetch grades.")
      console.error("Error fetching grades:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddOrUpdateGrade = async () => {
    try {
      if (editingGrade) {
        const updated = await updateGrade(editingGrade.id, formData)
        if (updated) {
          toast.success("Grade updated successfully!")
        } else {
          toast.error("Failed to update grade.")
        }
      } else {
        const newGrade = await addGrade(formData)
        if (newGrade) {
          toast.success("Grade added successfully!")
        } else {
          toast.error("Failed to add grade.")
        }
      }
      resetForm()
      setIsDialogOpen(false)
      fetchGrades()
    } catch (error) {
      toast.error(`Operation failed: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Error adding/updating grade:", error)
    }
  }

  const handleDeleteGrade = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        const success = await deleteGrade(id)
        if (success) {
          toast.success("Grade deleted successfully!")
          fetchGrades()
        } else {
          toast.error("Failed to delete grade.")
        }
      } catch (error) {
        toast.error(`Deletion failed: ${error instanceof Error ? error.message : String(error)}`)
        console.error("Error deleting grade:", error)
      }
    }
  }

  const handleEditClick = (grade: Grade) => {
    setEditingGrade(grade)
    setFormData({
      name: grade.name,
      description: grade.description || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingGrade(null)
    setFormData({
      name: "",
      description: "",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p>Loading grades...</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Grades</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Grade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGrade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
              <DialogDescription>
                {editingGrade
                  ? "Make changes to the grade here. Click save when you're done."
                  : "Fill in the details for the new grade."}
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
              <Button type="submit" onClick={handleAddOrUpdateGrade}>
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
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No grades found.
                </TableCell>
              </TableRow>
            ) : (
              grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.name}</TableCell>
                  <TableCell>{grade.description || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(grade)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGrade(grade.id)}>
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
