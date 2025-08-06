import {getStaff, getTasks, getNotes} from "@/lib/database"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Users, CheckSquare, Plus, Calendar, AlertTriangle} from "lucide-react"
import Link from "next/link"
import {formatDateTime} from "@/lib/utils"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {TaskKanbanBoard} from "@/components/task-kanban-board"
import {StaffQuickSearch} from "@/components/staff-quick-search"
import {DashboardMetrics} from "@/components/dashboard-metrics"
import {RecentActivity} from "@/components/recent-activity"

export default async function HomePage() {
    let staff = []
    let tasks = []
    let notes = []
    let error = null

    try {
        console.log("Fetching data for homepage...")
        const [staffData, tasksData, notesData] = await Promise.all([
            getStaff().catch(err => {
                console.error("Failed to fetch staff:", err)
                return []
            }),
            getTasks().catch(err => {
                console.error("Failed to fetch tasks:", err)
                return []
            }),
            getNotes().catch(err => {
                console.error("Failed to fetch notes:", err)
                return []
            }),
        ])

        staff = staffData
        tasks = tasksData
        notes = notesData
        console.log(
            `Successfully loaded: ${staff.length} staff, ${tasks.length} tasks, ${notes.length} notes`,
        )
    } catch (err) {
        console.error("Error loading homepage data:", err)
        error = "Failed to load data. Please check your database connection."
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive"/>
                            Database Connection Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive mb-4">{error}</p>
                        <p className="text-sm text-muted-foreground">
                            Please ensure your PostgreSQL database is running and the
                            DATABASE_URL environment variable is correctly set.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const completedTasks = tasks.filter(task => task.status === 'Completed').length
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length
    const overdueTasks = tasks.filter(
        task => task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date(),
    ).length


    const upcomingDeadlines = tasks
        .filter(task => task.status !== 'Completed' && task.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Team Dashboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your team, track progress, and stay organized.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <StaffQuickSearch staff={staff}/>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/tasks">
                                <Plus className="mr-2 h-4 w-4"/>
                                New Task
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/staff/new">
                                <Plus className="mr-2 h-4 w-4"/>
                                Add Staff
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <DashboardMetrics
                totalStaff={staff.length}
                pendingTasks={pendingTasks}
                inProgressTasks={inProgressTasks}
                completedTasks={completedTasks}
                overdueTasks={overdueTasks}
                totalNotes={notes.length}
            />

            {/* Quick Actions and Urgent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Upcoming Deadlines - More prominent */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Calendar className="h-5 w-5"/>
                            Urgent & Upcoming Tasks
                        </CardTitle>
                        <CardDescription>Tasks that need immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingDeadlines.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingDeadlines.map((task) => {
                                    const isOverdue = new Date(task.dueDate) < new Date()
                                    const staffMember = staff.find(s => s.id === task.staffId)
                                    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))

                                    return (
                                        <Card key={task.id} className={`p-4 ${isOverdue ? 'border-destructive bg-destructive/5' : daysUntilDue <= 3 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}`}>
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link href={`/tasks/${task.id}`} className="font-medium hover:underline truncate">
                                                        {task.title}
                                                    </Link>
                                                    <Badge variant={isOverdue ? "destructive" : daysUntilDue <= 3 ? "outline" : "secondary"}
                                                           className="text-xs shrink-0">
                                                        {isOverdue ? "Overdue" : `${daysUntilDue}d left`}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {staffMember?.name || "Unassigned"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Due: {formatDateTime(task.dueDate).split(' ')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                                <p className="text-muted-foreground">No urgent tasks - great work!</p>
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" asChild className="w-full">
                                <Link href="/tasks">View All Tasks</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <RecentActivity tasks={tasks} notes={notes} staff={staff}/>
            </div>

            {/* Main Task Board */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Task Board</CardTitle>
                        <CardDescription>Drag and drop tasks to update their status</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/tasks">
                            <Plus className="mr-2 h-4 w-4"/>
                            Add Task
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <TaskKanbanBoard tasks={tasks} staff={staff}/>
                </CardContent>
            </Card>

            {/* Team Overview Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Team Overview</CardTitle>
                        <CardDescription>Your team at a glance</CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/staff">View All Staff</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {staff.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {staff.slice(0, 8).map((member) => {
                                const memberTasks = tasks.filter(task => task.staffId === member.id)
                                const memberNotes = notes.filter(note => note.staffId === member.id)
                                const activeTasks = memberTasks.filter(task => task.status !== 'Completed').length
                                const overdueTasks = memberTasks.filter(task => 
                                    task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date()
                                ).length

                                return (
                                    <Card key={member.id} className={`hover:shadow-md transition-shadow ${overdueTasks > 0 ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' : ''}`}>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <Link
                                                        href={`/staff/${member.id}`}
                                                        className="font-semibold hover:underline truncate block"
                                                    >
                                                        {member.name}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {member.jobRole}
                                                    </p>
                                                    {member.teamName && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {member.teamName}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {activeTasks > 0 && (
                                                        <Badge variant={overdueTasks > 0 ? "destructive" : "outline"}>
                                                            {activeTasks} active
                                                            {overdueTasks > 0 && ` (${overdueTasks} overdue)`}
                                                        </Badge>
                                                    )}
                                                    {memberNotes.length > 0 && (
                                                        <Badge variant="secondary">
                                                            {memberNotes.length} notes
                                                        </Badge>
                                                    )}
                                                    {activeTasks === 0 && (
                                                        <Badge variant="outline" className="text-green-600">
                                                            No active tasks
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Add your first team member to get started
                            </p>
                            <Button asChild>
                                <Link href="/staff/new">
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Add First Staff Member
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}