import { getTasks, getStaff } from "@/lib/database"
import { TaskManagement } from "@/components/task-management"

export default async function TasksPage() {
  const [tasks, staff] = await Promise.all([getTasks(), getStaff()])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <p className="text-muted-foreground mt-2">Create and manage tasks for your team</p>
      </div>
      <TaskManagement initialTasks={tasks} staff={staff} />
    </div>
  )
}
