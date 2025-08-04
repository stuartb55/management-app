// app/api/notes/[id]/route.js
import {getNoteById, updateNote, deleteNote} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {NoteSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    return handleGetById(getNoteById, params.id, "note");
}

export async function PUT(request, {params}) {
    const data = await request.json();
    return handleUpdate(updateNote, params.id, data, NoteSchema.partial(), "note");
}

export async function DELETE(request, {params}) {
    return handleDelete(deleteNote, params.id, "note");
}