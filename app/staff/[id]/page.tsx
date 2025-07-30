import {notFound} from "next/navigation";
import {
    getStaffById,
    getStaff,
    getTasks, // Change from getTasksByStaffId
    getNotes, // Change from getNotesByStaffId
} from "@/lib/database";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Separator} from "@/components/ui/separator";
import {TaskManagement} from "@/components/task-management";
import {NotesManagement} from "@/components/notes-management";
import {TaskDependencyGraph} from "@/components/task-dependency-graph";
import {getInitials, getStaffName} from "@/lib/utils";

export default async function StaffProfilePage({
                                                   params,
                                               }: {
    params: { id: string };
}) {
    const {id} = params;

    let staffMember;
    let tasks = [];
    let notes = [];
    let allStaff = [];
    let error: string | null = null;

    try {
        [staffMember, tasks, notes, allStaff] = await Promise.all([
            getStaffById(id),
            getTasks(id), // Call getTasks with staffId
            getNotes(id), // Call getNotes with staffId
            getStaff(), // Needed for line manager dropdowns in StaffManagement, if it were used here.
        ]);
    } catch (err) {
        console.error("Failed to fetch staff profile data:", err);
        error = "Failed to load staff data. Please try again.";
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <h1 className="mb-6 text-3xl font-bold">Staff Profile</h1>
                <div className="flex items-center justify-center p-8 text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!staffMember) {
        notFound();
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-user.jpg" alt={`${staffMember.firstName} ${staffMember.lastName}`}/>
                    <AvatarFallback className="text-3xl">
                        {getInitials(`${staffMember.firstName} ${staffMember.lastName}`)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">
                        {getStaffName(staffMember)}
                    </h1>
                    <p className="text-muted-foreground">{staffMember.email}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Staff Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Grade</p>
                            <p className="text-base">{staffMember.gradeName || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Team</p>
                            <p className="text-base">{staffMember.teamName || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Line Manager
                            </p>
                            <p className="text-base">
                                {staffMember.lineManagerId
                                    ? getStaffName(
                                        allStaff.find((s) => s.id === staffMember.lineManagerId),
                                    )
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Joined</p>
                            <p className="text-base">
                                {staffMember.createdAt
                                    ? new Date(staffMember.createdAt).toLocaleDateString("en-GB")
                                    : "N/A"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TaskManagement initialTasks={tasks} staffId={id}/>
                        <Separator className="my-6"/>
                        <h3 className="mb-4 text-lg font-semibold">Task Dependencies</h3>
                        {tasks.length > 0 ? (
                            <TaskDependencyGraph tasks={tasks}/>
                        ) : (
                            <p className="text-muted-foreground">No tasks to display dependencies for.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NotesManagement initialNotes={notes} currentStaffId={id}/>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}