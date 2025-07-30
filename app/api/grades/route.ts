import { type NextRequest, NextResponse } from "next/server"
import { getGrades, addGrade } from "@/lib/database"
import type { Grade } from "@/lib/types"

export async function GET() {
  try {
    console.log("Fetching all grades...")
    const grades = await getGrades()
    console.log(`Successfully fetched ${grades.length} grades`)
    return NextResponse.json(grades)
  } catch (error) {
    console.error("Error in GET /api/grades:", error)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new grade...")
    const data: Omit<Grade, "id" | "createdAt" | "updatedAt"> = await request.json()

    const newGrade = await addGrade(data)
    if (newGrade) {
      console.log(`Successfully created grade: ${newGrade.name}`)
      return NextResponse.json(newGrade, { status: 201 })
    } else {
      console.error("Failed to create grade - no result returned")
      return NextResponse.json({ error: "Failed to create grade" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in POST /api/grades:", error)
    return NextResponse.json({ error: "Failed to create grade" }, { status: 500 })
  }
}
