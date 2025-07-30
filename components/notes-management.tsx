"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { addNote } from "@/lib/api-client"
import type { Note, Staff } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { NoteCard } from "./note-card"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

type NotesManagementProps = {
  initialNotes: Note[]
  staff: Staff[]
  currentStaffId?: string // Optional, if managing notes for a specific staff member
}

export function NotesManagement({ initialNotes, staff, currentStaffId }: NotesManagementProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newNote, setNewNote] = useState<Omit<Note, "id" | "createdAt" | "updatedAt">>({
    staffId: currentStaffId || "",
    title: "",
    content: "",
  })

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewNote((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewNote((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content || !newNote.staffId) {
      toast.error("Title, content, and staff member are required for a new note.")
      return
    }
    try {
      const addedNote = await addNote(newNote)
      if (addedNote) {
        setNotes((prev) => [addedNote, ...prev])
        setNewNote({ staffId: currentStaffId || "", title: "", content: "" })
        toast.success("Note added successfully!")
      } else {
        toast.error("Failed to add note.")
      }
    } catch (error) {
      toast.error(`Failed to add note: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
  }

  const handleNoteDeleted = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Note</CardTitle>
          <CardDescription>Create a new note for a staff member.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                name="title"
                value={newNote.title}
                onChange={handleInputChange}
                placeholder="Meeting notes, feedback, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-staff">For Staff</Label>
              <Select
                name="staffId"
                value={newNote.staffId}
                onValueChange={(value) => handleSelectChange("staffId", value)}
                disabled={!!currentStaffId} // Disable if currentStaffId is provided
              >
                <SelectTrigger id="note-staff">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              name="content"
              value={newNote.content}
              onChange={handleInputChange}
              placeholder="Write your note here..."
              rows={4}
            />
          </div>
          <Button onClick={handleAddNote} className="w-full md:w-auto self-end">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Notes</CardTitle>
          <CardDescription>All notes for this staff member.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground">No notes found.</p>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                staff={staff}
                onNoteUpdated={handleNoteUpdated}
                onNoteDeleted={handleNoteDeleted}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
