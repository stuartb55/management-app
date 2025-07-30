import { type NextRequest, NextResponse } from "next/server"
import { updateTask, deleteTask } from "@/lib/database"
import type { Task } from "@/lib/types"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Updating task with ID: ${params.id}`)
    const updates: Partial<Task> = await request.json()

    const updatedTask = await updateTask(params.id, updates)
    if (updatedTask) {
      console.log(`Successfully updated task: ${updatedTask.title}`)
      return NextResponse.json(updatedTask)
    } else {
      console.log(`Task not found for update: ${params.id}`)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in PUT /api/tasks/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Deleting task with ID: ${params.id}`)
    const success = await deleteTask(params.id)

    if (success) {
      console.log(`Successfully deleted task: ${params.id}`)
      return NextResponse.json({ success: true })
    } else {
      console.log(`Task not found for deletion: ${params.id}`)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error in DELETE /api/tasks/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
