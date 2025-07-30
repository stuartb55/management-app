import { type NextRequest, NextResponse } from "next/server"
import { getTasksByStaffId } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { staffId: string } }) {
  try {
    console.log(`Fetching tasks for staff ID: ${params.staffId}`)
    const tasks = await getTasksByStaffId(params.staffId)
    console.log(`Successfully fetched ${tasks.length} tasks for staff member`)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error(`Error in GET /api/tasks/staff/${params.staffId}:`, error)
    return NextResponse.json({ error: "Failed to fetch tasks for staff member" }, { status: 500 })
  }
}
