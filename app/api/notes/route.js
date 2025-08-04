// app/api/notes/route.js
import {getNotes, addNote} from "@/lib/database";
import {handleGetAll, handleCreate} from "@/lib/api-helpers";
import {NoteSchema} from "@/lib/schemas";

export async function GET() {
    return handleGetAll(getNotes, "notes");
}

export async function POST(request) {
    const data = await request.json();
    return handleCreate(addNote, data, NoteSchema, "note");
}