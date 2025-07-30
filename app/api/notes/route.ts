import { type NextRequest, NextResponse } from "next/server"
import { getNotes, addNote } from "@/lib/database"
import type { Note } from "@/lib/types"

export async function GET() {
  try {
    console.log("Fetching all notes...")
    const notes = await getNotes()
    console.log(`Successfully fetched ${notes.length} notes`)
    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error in GET /api/notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new note...")
    const data: Omit<Note, "id" | "createdAt" | "updatedAt"> = await request.json()

    const newNote = await addNote(data)
    if (newNote) {
      console.log(`Successfully created note: ${newNote.title}`)
      return NextResponse.json(newNote, { status: 201 })
    } else {
      console.error("Failed to create note - no result returned")
      return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in POST /api/notes:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
