import { type NextRequest, NextResponse } from "next/server"
import { updateGrade, deleteGrade } from "@/lib/database"
import type { Grade } from "@/lib/types"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Updating grade with ID: ${params.id}`)
    const updates: Partial<Grade> = await request.json()

    const updatedGrade = await updateGrade(params.id, updates)
    if (updatedGrade) {
      console.log(`Successfully updated grade: ${updatedGrade.name}`)
      return NextResponse.json(updatedGrade)
    } else {
      console.log(`Grade not found for update: ${params.id}`)
      return NextResponse.json({ error: "Grade not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in PUT /api/grades/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update grade" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Deleting grade with ID: ${params.id}`)
    const success = await deleteGrade(params.id)

    if (success) {
      console.log(`Successfully deleted grade: ${params.id}`)
      return NextResponse.json({ success: true })
    } else {
      console.log(`Grade not found for deletion: ${params.id}`)
      return NextResponse.json({ error: "Grade not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in DELETE /api/grades/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete grade" }, { status: 500 })
  }
}
