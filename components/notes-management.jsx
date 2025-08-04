"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addNote } from "@/lib/api-client"
import { toast } from "sonner"
import { NoteCard } from "./note-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

export function NotesManagement({ notes: initialNotes, allStaff }) {
    const router = useRouter();
    const [notes, setNotes] = useState(initialNotes || []);
    const [newNote, setNewNote] = useState({ title: "", content: "", staffId: "" });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNote((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        setNewNote((prev) => ({ ...prev, staffId: value }));
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.title.trim() || !newNote.content.trim() || !newNote.staffId) {
            toast.error("Please fill in all fields: Title, Content, and Staff.");
            return;
        }
        setLoading(true);
        try {
            const addedNote = await addNote(newNote);
            setNotes((prev) => [addedNote, ...prev]);
            setNewNote({ title: "", content: "", staffId: "" });
            toast.success("Note added successfully!");
            router.refresh();
        } catch (error) {
            toast.error(`Failed to add note: ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNoteUpdated = (updatedNote) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
        );
        router.refresh();
    };

    const handleNoteDeleted = (noteId) => {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
        router.refresh();
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Note</CardTitle>
                    <CardDescription>Create a new note and assign it to a staff member.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddNote} className="space-y-4">
                        <Input
                            name="title"
                            placeholder="Note Title *"
                            value={newNote.title}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <Textarea
                            name="content"
                            placeholder="Note Content *"
                            value={newNote.content}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <Select
                            name="staffId"
                            value={newNote.staffId}
                            onValueChange={handleSelectChange}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Staff Member *" />
                            </SelectTrigger>
                            <SelectContent>
                                {allStaff.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                        {staff.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Note"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-bold mb-4">Existing Notes</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {notes.length > 0 ? (
                        notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                staff={allStaff}
                                onNoteUpdated={handleNoteUpdated}
                                onNoteDeleted={handleNoteDeleted}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full text-center py-8">
                            No notes found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
