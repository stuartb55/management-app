// app/api/notes/[id]/route.js
import {getNoteById, updateNote, deleteNote} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {NoteSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    const resolvedParams = await params;
    return handleGetById(getNoteById, resolvedParams.id, "note");
}

export async function PUT(request, {params}) {
    const resolvedParams = await params;
    const data = await request.json();
    return handleUpdate(updateNote, resolvedParams.id, data, NoteSchema.partial(), "note");
}

export async function DELETE(request, {params}) {
    const resolvedParams = await params;
    return handleDelete(deleteNote, resolvedParams.id, "note");
}