import { type NextRequest, NextResponse } from "next/server"
import { getStaff, addStaff } from "@/lib/database"
import type { Staff } from "@/lib/types"

export async function GET() {
  try {
    console.log("Fetching all staff members...")
    const staff = await getStaff()
    console.log(`Successfully fetched ${staff.length} staff members`)
    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error in GET /api/staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new staff member...")
    const data: Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName" | "lineManagerName"> =
      await request.json()

    const newStaff = await addStaff(data)
    if (newStaff) {
      console.log(`Successfully created staff member: ${newStaff.name}`)
      return NextResponse.json(newStaff, { status: 201 })
    } else {
      console.error("Failed to create staff member - no result returned")
      return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in POST /api/staff:", error)
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 })
  }
}
