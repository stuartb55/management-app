import { type NextRequest, NextResponse } from "next/server"
import { getTeams, addTeam } from "@/lib/database"
import type { Team } from "@/lib/types"

export async function GET() {
  try {
    console.log("Fetching all teams...")
    const teams = await getTeams()
    console.log(`Successfully fetched ${teams.length} teams`)
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error in GET /api/teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new team...")
    const data: Omit<Team, "id" | "createdAt" | "updatedAt"> = await request.json()

    const newTeam = await addTeam(data)
    if (newTeam) {
      console.log(`Successfully created team: ${newTeam.name}`)
      return NextResponse.json(newTeam, { status: 201 })
    } else {
      console.error("Failed to create team - no result returned")
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in POST /api/teams:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
