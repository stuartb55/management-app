import { type NextRequest, NextResponse } from "next/server"
import { updateTeam, deleteTeam } from "@/lib/database"
import type { Team } from "@/lib/types"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Updating team with ID: ${params.id}`)
    const updates: Partial<Team> = await request.json()

    const updatedTeam = await updateTeam(params.id, updates)
    if (updatedTeam) {
      console.log(`Successfully updated team: ${updatedTeam.name}`)
      return NextResponse.json(updatedTeam)
    } else {
      console.log(`Team not found for update: ${params.id}`)
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in PUT /api/teams/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Deleting team with ID: ${params.id}`)
    const success = await deleteTeam(params.id)

    if (success) {
      console.log(`Successfully deleted team: ${params.id}`)
      return NextResponse.json({ success: true })
    } else {
      console.log(`Team not found for deletion: ${params.id}`)
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in DELETE /api/teams/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
