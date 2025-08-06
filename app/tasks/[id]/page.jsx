import {getTaskById, getStaff} from "@/lib/database";
import {notFound} from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    ArrowLeftIcon,
    EditIcon,
    FlagIcon,
    CheckCircleIcon
} from "lucide-react";
import Link from "next/link";
import {formatDateTime} from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {TaskEditDialog} from "@/components/task-edit-dialog";

export default async function TaskDetailPage({params}) {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    let task;
    let staff = [];

    try {
        const [taskData, staffData] = await Promise.all([
            getTaskById(taskId),
            getStaff()
        ]);

        if (!taskData) {
            notFound();
        }

        task = taskData;
        staff = staffData;
    } catch (error) {
        console.error("Error fetching task:", error);
        notFound();
    }

    const assignedStaff = staff.find(s => s.id === task.staffId);
    const isOverdue = task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date();
    const isCompleted = task.status === 'Completed';

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-500 text-red-50';
            case 'High':
                return 'bg-orange-500 text-orange-50';
            case 'Medium':
                return 'bg-yellow-500 text-yellow-50';
            case 'Low':
                return 'bg-green-500 text-green-50';
            default:
                return 'bg-gray-500 text-gray-50';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Pending':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Blocked':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Cancelled':
                return 'bg-gray-100 text-gray-600 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{task.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/tasks">
                        <ArrowLeftIcon className="mr-2 h-4 w-4"/>
                        Back to Tasks
                    </Link>
                </Button>
                <TaskEditDialog
                    taskToEdit={task}
                    allStaff={staff}
                    trigger={
                        <Button variant="default" size="sm">
                            <EditIcon className="mr-2 h-4 w-4"/>
                            Edit Task
                        </Button>
                    }
                />
            </div>

            <div className="grid gap-6">
                {/* Main Task Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl">{task.title}</CardTitle>
                                <div className="flex items-center gap-3">
                                    <Badge className={getPriorityColor(task.priority)}>
                                        <FlagIcon className="mr-1 h-3 w-3"/>
                                        {task.priority} Priority
                                    </Badge>
                                    <Badge variant="outline" className={getStatusColor(task.status)}>
                                        {isCompleted && <CheckCircleIcon className="mr-1 h-3 w-3"/>}
                                        {task.status}
                                    </Badge>
                                    {isOverdue && (
                                        <Badge variant="destructive">
                                            Overdue
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description */}
                        {task.description && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Description</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Task Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assigned To */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Assigned To</h3>
                                {assignedStaff ? (
                                    <Link
                                        href={`/staff/${assignedStaff.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                                    >
                                        <UserIcon className="h-8 w-8 text-muted-foreground"/>
                                        <div>
                                            <p className="font-medium">{assignedStaff.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignedStaff.jobRole}
                                            </p>
                                            {assignedStaff.teamName && (
                                                <p className="text-xs text-muted-foreground">
                                                    Team: {assignedStaff.teamName}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                                        <UserIcon className="h-8 w-8 text-muted-foreground"/>
                                        <p className="text-muted-foreground">Unassigned</p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Timeline</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">Created:</span>
                                        <span>{formatDateTime(task.createdAt)}</span>
                                    </div>
                                    {task.dueDate && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <ClockIcon className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}/>
                                            <span className="font-medium">Due Date:</span>
                                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                                {formatDateTime(task.dueDate)}
                                            </span>
                                        </div>
                                    )}
                                    {task.completedAt && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <CheckCircleIcon className="h-4 w-4 text-green-500"/>
                                            <span className="font-medium">Completed:</span>
                                            <span className="text-green-600">{formatDateTime(task.completedAt)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">Last Updated:</span>
                                        <span>{formatDateTime(task.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common actions for this task</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <TaskEditDialog
                                taskToEdit={task}
                                allStaff={staff}
                                trigger={
                                    <Button variant="outline">
                                        <EditIcon className="mr-2 h-4 w-4"/>
                                        Edit Details
                                    </Button>
                                }
                            />
                            {assignedStaff && (
                                <Button variant="outline" asChild>
                                    <Link href={`/staff/${assignedStaff.id}`}>
                                        <UserIcon className="mr-2 h-4 w-4"/>
                                        View Assignee
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link href="/tasks">
                                    View All Tasks
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}