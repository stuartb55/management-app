import { getStaff, getTasks, getNotes } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CheckSquare, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"

export default async function HomePage() {
  let staff = []
  let tasks = []
  let notes = []
  let error = null

  try {
    console.log("Fetching data for homepage...")
    const [staffData, tasksData, notesData] = await Promise.all([
      getStaff().catch((err) => {
        console.error("Failed to fetch staff:", err)
        return []
      }),
      getTasks().catch((err) => {
        console.error("Failed to fetch tasks:", err)
        return []
      }),
      getNotes().catch((err) => {
        console.error("Failed to fetch notes:", err)
        return []
      }),
    ])

    staff = staffData
    tasks = tasksData
    notes = notesData
    console.log(`Successfully loaded: ${staff.length} staff, ${tasks.length} tasks, ${notes.length} notes`)
  } catch (err) {
    console.error("Error loading homepage data:", err)
    error = "Failed to load data. Please check your database connection."
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Database Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please ensure your PostgreSQL database is running and the DATABASE_URL environment variable is correctly
              set.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed).length
  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date(),
  ).length

  const recentTasks = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5)

  const recentNotes = notes.slice(0, 5)

  const getStaffName = (staffId: string | undefined) => {
    if (!staffId) return "Unassigned"
    const staffMember = staff.find((s) => s.id === staffId)
    return staffMember ? staffMember.name : "Unknown Staff"
  }

  const getPriorityColour = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "destructive"
      case "High":
        return "secondary"
      case "Medium":
        return "outline"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Staff Management Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your team, tasks, and notes efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/staff">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/staff">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Add, edit, and manage team members</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/tasks">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Create and track tasks for your team</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/notes">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Document important information and updates</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks > 0 && <span className="text-destructive">{overdueTasks} overdue</span>}
              {overdueTasks === 0 && "All on track"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">Documentation entries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staff List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Your current staff members</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/staff">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No staff members found</p>
                  <Button asChild>
                    <Link href="/staff">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Staff Member
                    </Link>
                  </Button>
                </div>
              ) : (
                staff.slice(0, 6).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.jobRole} • {member.teamName || "No team"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/staff/${member.id}`}>View</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks that need attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No pending tasks</p>
                  <Button asChild>
                    <Link href="/tasks">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Task
                    </Link>
                  </Button>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Assigned to: {getStaffName(task.staffId)}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">Due: {formatDateTime(task.dueDate)}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getPriorityColour(task.priority)}>{task.priority}</Badge>
                      {task.dueDate && new Date(task.dueDate) < new Date() && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notes */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>Latest documentation and updates</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/notes">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground mb-4">No notes available</p>
                <Button asChild>
                  <Link href="/notes">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Note
                  </Link>
                </Button>
              </div>
            ) : (
              recentNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{note.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{note.content}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{getStaffName(note.staffId)}</span>
                    <span>{formatDateTime(note.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
