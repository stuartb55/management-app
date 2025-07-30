import { type NextRequest, NextResponse } from "next/server"
import { getNotesByStaffId } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { staffId: string } }) {
  try {
    console.log(`Fetching notes for staff ID: ${params.staffId}`)
    const notes = await getNotesByStaffId(params.staffId)
    console.log(`Successfully fetched ${notes.length} notes for staff member`)
    return NextResponse.json(notes)
  } catch (error) {
    console.error(`Error in GET /api/notes/staff/${params.staffId}:`, error)
    return NextResponse.json({ error: "Failed to fetch notes for staff member" }, { status: 500 })
  }
}
