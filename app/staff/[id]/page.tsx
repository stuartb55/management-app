import {getStaffById, getTasksByStaffId, getNotesByStaffId, getStaff} from "@/lib/database"
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge"
import {Mail, Phone, Briefcase, Calendar, ClipboardList, FileText, User} from "lucide-react"
import {TaskManagement} from "@/components/task-management"
import {NotesManagement} from "@/components/notes-management"
import {TaskDependencyGraph} from "@/components/task-dependency-graph"
import type {Staff} from "@/lib/types"
import {formatDate} from "@/lib/utils"

type StaffDetailPageProps = {
    params: {
        id: string
    }
}

export default async function StaffDetailPage({params}: StaffDetailPageProps) {
    const {id} = params

    let staffMember: Staff | null = null
    let tasks = []
    let notes = []
    let allStaff: Staff[] = []
    let error: string | null = null

    try {
        const [staffData, tasksData, notesData, allStaffData] = await Promise.all([
            getStaffById(id),
            getTasksByStaffId(id),
            getNotesByStaffId(id),
            getStaff(), // Fetch all staff for line manager dropdowns
        ])
        staffMember = staffData
        tasks = tasksData
        notes = notesData
        allStaff = allStaffData
    } catch (err) {
        console.error("Failed to fetch staff details:", err)
        error = "Failed to load staff details. Please try again."
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!staffMember) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Staff Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The staff member with ID &quot;{id}&quot; could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Staff Profile Card */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`/placeholder.svg?text=${staffMember.name.charAt(0)}`}
                                         alt={staffMember.name}/>
                            <AvatarFallback>{staffMember.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <CardTitle className="text-2xl">{staffMember.name}</CardTitle>
                            <CardDescription>{staffMember.jobRole}</CardDescription>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {staffMember.gradeName && <Badge variant="secondary">{staffMember.gradeName}</Badge>}
                                {staffMember.teamName && <Badge variant="secondary">{staffMember.teamName}</Badge>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Separator/>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                <p className="text-sm">{staffMember.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground"/>
                                <p className="text-sm">Staff #: {staffMember.staffNumber}</p>
                            </div>
                            {staffMember.jobId && (
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm">Job ID: {staffMember.jobId}</p>
                                </div>
                            )}
                            {staffMember.lineManagerName && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm">Line Manager: {staffMember.lineManagerName}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <p className="text-sm">Joined: {formatDate(staffMember.createdAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Management Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5"/> Tasks
                        </CardTitle>
                        <CardDescription>Manage tasks assigned to {staffMember.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskManagement initialTasks={tasks} staff={allStaff} currentStaffId={staffMember.id}/>
                    </CardContent>
                </Card>
            </div>

            {/* Notes Management Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5"/> Notes
                    </CardTitle>
                    <CardDescription>View and add notes for {staffMember.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NotesManagement initialNotes={notes} staff={allStaff} currentStaffId={staffMember.id}/>
                </CardContent>
            </Card>

            {/* Task Dependency Graph Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5"/> Task Dependency Graph
                    </CardTitle>
                    <CardDescription>Visualize task dependencies for {staffMember.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TaskDependencyGraph tasks={tasks}/>
                </CardContent>
            </Card>
        </main>
    )
}
