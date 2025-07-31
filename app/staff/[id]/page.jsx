import {getStaff, getStaffById} from "@/lib/database";
import {getTasksByStaffId} from "@/lib/api-client";
import {TaskManagement} from "@/components/task-management";
import {NotesManagement} from "@/components/notes-management";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";

export default async function StaffProfilePage({params}) {
    const {id} = params;

    let staffMember;
    let tasks = [];
    let allStaff = [];

    try {
        // Using Promise.all to fetch data concurrently for better performance
        const [member, staffList] = await Promise.all([
            getStaffById(id),
            getStaff(),
        ]);

        staffMember = member;
        allStaff = staffList;

        if (staffMember) {
            tasks = await getTasksByStaffId(staffMember.id);
        }
    } catch (error) {
        console.error("Failed to fetch staff profile data:", error);
    }

    if (!staffMember) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Staff member not found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center space-x-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage
                            src={`/placeholder-user.jpg`}
                            alt={staffMember.name}
                        />
                        <AvatarFallback>
                            {staffMember.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl">{staffMember.name}</CardTitle>
                        <p className="text-muted-foreground">{staffMember.email}</p>
                        <div className="flex space-x-2 pt-2">
                            <Badge variant="outline">{staffMember.gradeName}</Badge>
                            <Badge variant="secondary">{staffMember.teamName}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {staffMember.lineManagerName && (
                        <p className="text-sm text-muted-foreground">
                            Line Manager: {staffMember.lineManagerName}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TaskManagement
                    initialTasks={tasks}
                    staffId={staffMember.id}
                    staff={allStaff}
                />
                <NotesManagement staffId={staffMember.id}/>
            </div>
        </div>
    );
}