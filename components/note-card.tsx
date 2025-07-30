"use client"

import type * as React from "react"
import { useState } from "react"
import { formatDateTime } from "@/lib/utils"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { updateNote, deleteNote } from "@/lib/api-client"
import type { Note, Staff } from "@/lib/types"

type NoteCardProps = {
  note: Note
  staff: Staff[]
  onNoteUpdated: (updatedNote: Note) => void
  onNoteDeleted: (noteId: string) => void
}

export function NoteCard({ note, staff, onNoteUpdated, onNoteDeleted }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedNote, setEditedNote] = useState<Note>(note)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedNote((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditedNote((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      const updated = await updateNote(editedNote.id, editedNote)
      if (updated) {
        setEditedNote(updated)
        onNoteUpdated(updated)
        setIsEditing(false)
        toast.success("Note updated successfully!")
      } else {
        toast.error("Failed to update note.")
      }
    } catch (error) {
      toast.error(`Failed to save note: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete note "${note.title}"?`)) {
      try {
        const success = await deleteNote(note.id)
        if (success) {
          onNoteDeleted(note.id)
          toast.success("Note deleted successfully!")
        } else {
          toast.error("Failed to delete note.")
        }
      } catch (error) {
        toast.error(`Failed to delete note: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isEditing ? (
          <Input name="title" value={editedNote.title} onChange={handleInputChange} className="text-lg font-bold" />
        ) : (
          <CardTitle className="text-lg">{editedNote.title}</CardTitle>
        )}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {isEditing ? (
          <Textarea name="content" value={editedNote.content} onChange={handleInputChange} placeholder="Note content" />
        ) : (
          <CardDescription>{editedNote.content}</CardDescription>
        )}

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="staffId">For Staff</Label>
            {isEditing ? (
              <Select
                name="staffId"
                value={editedNote.staffId || ""}
                onValueChange={(value) => handleSelectChange("staffId", value)}
              >
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm">{staff.find((s) => s.id === editedNote.staffId)?.name || "N/A"}</p>
            )}
          </div>
          <div>
            <Label>Created At</Label>
            <p className="text-sm">{formatDateTime(editedNote.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
