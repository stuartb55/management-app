import { type NextRequest, NextResponse } from "next/server"
import { updateNote, deleteNote } from "@/lib/database"
import type { Note } from "@/lib/types"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Updating note with ID: ${params.id}`)
    const updates: Partial<Note> = await request.json()

    const updatedNote = await updateNote(params.id, updates)
    if (updatedNote) {
      console.log(`Successfully updated note: ${updatedNote.title}`)
      return NextResponse.json(updatedNote)
    } else {
      console.log(`Note not found for update: ${params.id}`)
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in PUT /api/notes/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Deleting note with ID: ${params.id}`)
    const success = await deleteNote(params.id)

    if (success) {
      console.log(`Successfully deleted note: ${params.id}`)
      return NextResponse.json({ success: true })
    } else {
      console.log(`Note not found for deletion: ${params.id}`)
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in DELETE /api/notes/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
