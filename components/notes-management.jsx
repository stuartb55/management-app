"use client"

import React, {useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card, CardFooter} from "@/components/ui/card"
import {addNote, deleteNote} from "@/lib/api-client"
import {toast} from "sonner"
import {Trash2} from "lucide-react"
import {useRouter} from "next/navigation"

export function NotesManagement({staffId, initialNotes}) {
    const router = useRouter()
    // The state is initialized here. This is all we need.
    const [notes] = useState(initialNotes || [])
    const [newNote, setNewNote] = useState("")
    const [loading, setLoading] = useState(false)

    // The problematic useEffect has been removed.

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error("Note content cannot be empty.")
            return
        }
        setLoading(true)
        try {
            await addNote({staffId, content: newNote})
            toast.success("Note added successfully!")
            setNewNote("")
            router.refresh() // Re-fetch server data
        } catch (error) {
            toast.error("Failed to add note.")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteNote = async (noteId) => {
        if (!confirm("Are you sure you want to delete this note?")) return
        setLoading(true)
        try {
            await deleteNote(noteId)
            toast.success("Note deleted successfully!")
            router.refresh() // Re-fetch server data
        } catch (error) {
            toast.error("Failed to delete note.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <Card key={note.id} className="flex justify-between items-center p-3">
                            <p className="text-sm">{note.content}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No notes found.</p>
                )}
            </div>
            <CardFooter className="flex gap-2 p-0">
                <Input
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={loading}
                />
                <Button onClick={handleAddNote} disabled={loading}>
                    {loading ? "Adding..." : "Add Note"}
                </Button>
            </CardFooter>
        </div>
    )
}