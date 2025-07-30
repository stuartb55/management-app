import { type NextRequest, NextResponse } from "next/server"
import { getStaffById, updateStaff, deleteStaff } from "@/lib/database"
import type { Staff } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Fetching staff member with ID: ${params.id}`)
    const staff = await getStaffById(params.id)

    if (!staff) {
      console.log(`Staff member not found: ${params.id}`)
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    console.log(`Successfully fetched staff member: ${staff.name}`)
    return NextResponse.json(staff)
  } catch (error) {
    console.error(`Error in GET /api/staff/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch staff member" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Updating staff member with ID: ${params.id}`)
    const updates: Partial<Omit<Staff, "gradeName" | "teamName" | "lineManagerName">> = await request.json()

    const updatedStaff = await updateStaff(params.id, updates)
    if (updatedStaff) {
      console.log(`Successfully updated staff member: ${updatedStaff.name}`)
      return NextResponse.json(updatedStaff)
    } else {
      console.log(`Staff member not found for update: ${params.id}`)
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in PUT /api/staff/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Deleting staff member with ID: ${params.id}`)
    const success = await deleteStaff(params.id)

    if (success) {
      console.log(`Successfully deleted staff member: ${params.id}`)
      return NextResponse.json({ success: true })
    } else {
      console.log(`Staff member not found for deletion: ${params.id}`)
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in DELETE /api/staff/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 })
  }
}
