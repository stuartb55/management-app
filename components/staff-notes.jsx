"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardFooter} from "@/components/ui/card";
import {addNote, deleteNote} from "@/lib/api-client";
import {toast} from "sonner";
import {Trash2} from "lucide-react";

export function StaffNotes({staffId, initialNotes}) {
    const router = useRouter();
    const [notes, setNotes] = useState(initialNotes || []);
    const [newNote, setNewNote] = useState({title: "", content: ""});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewNote((prev) => ({...prev, [name]: value}));
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.title.trim() || !newNote.content.trim()) {
            toast.error("Title and content cannot be empty.");
            return;
        }
        setLoading(true);
        try {
            const addedNote = await addNote({...newNote, staffId});
            setNotes((prev) => [addedNote, ...prev]);
            setNewNote({title: "", content: ""});
            toast.success("Note added successfully!");
            router.refresh();
        } catch (error) {
            toast.error(`Failed to add note: ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        setLoading(true);
        try {
            await deleteNote(noteId);
            setNotes((prev) => prev.filter((note) => note.id !== noteId));
            toast.success("Note deleted successfully!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete note.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <Card key={note.id} className="p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{note.title}</p>
                                    <p className="text-sm text-muted-foreground">{note.content}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={loading}
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No notes found for this staff
                        member.</p>
                )}
            </div>
            <form onSubmit={handleAddNote}>
                <CardFooter className="flex flex-col items-start gap-2 p-0">
                    <Input
                        name="title"
                        placeholder="New Note Title..."
                        value={newNote.title}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    <Textarea
                        name="content"
                        placeholder="Add a new note..."
                        value={newNote.content}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Note"}
                    </Button>
                </CardFooter>
            </form>
        </div>
    );
}
