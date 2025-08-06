"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {StaffDetails} from "@/components/enhanced-staff-details";
import {StaffEditDialog} from "@/components/staff-edit-dialog";
import {StaffNotes} from "@/components/staff-notes";
import {TaskManagement} from "@/components/task-management";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    FileText,
    CheckSquare,
    Calendar,
    TrendingUp,
    Clock,
    AlertTriangle
} from "lucide-react";
import {formatDateTime} from "@/lib/utils";
import Link from "next/link";

export function EnhancedStaffDetailsView({staffMember, allStaff, notes, tasks}: any) {
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleSaveSuccess = () => {
        setIsEditDialogOpen(false);
        router.refresh();
    };

    // Calculate task statistics
    const taskStats = {
        total: tasks.length,
        completed: tasks.filter((task: any) => task.status === 'Completed').length,
        pending: tasks.filter((task: any) => task.status === 'Pending').length,
        inProgress: tasks.filter((task: any) => task.status === 'In Progress').length,
        overdue: tasks.filter((task: any) =>
            task.status !== 'Completed' &&
            task.dueDate &&
            new Date(task.dueDate) < new Date()
        ).length
    };

    // Get recent activity (tasks and notes combined)
    const recentActivity = [
        ...tasks.slice(0, 5).map((task: any) => ({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description || 'No description',
            timestamp: task.updatedAt || task.createdAt,
            status: task.status,
            priority: task.priority
        })),
        ...notes.slice(0, 5).map((note: any) => ({
            id: note.id,
            type: 'note',
            title: note.title,
            description: note.content,
            timestamp: note.updatedAt || note.createdAt
        }))
    ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

    const upcomingTasks = tasks
        .filter((task: any) => task.status !== 'Completed' && task.dueDate)
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    const getStatusColor = (status: any) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Blocked':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: any) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-100 text-red-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <div className="container mx-auto p-6 space-y-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/staff">Staff</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{staffMember.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Enhanced Staff Details with Stats */}
                <StaffDetails
                    staffMember={staffMember}
                    onEditClick={() => setIsEditDialogOpen(true)}
                    taskStats={taskStats}
                    noteCount={notes.length}
                />

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid grid-cols-4 w-full lg:w-auto">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4"/>
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4"/>
                            Tasks ({tasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="flex items-center gap-2">
                            <FileText className="h-4 w-4"/>
                            Notes ({notes.length})
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4"/>
                            Schedule
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5"/>
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <div key={`${activity.type}-${activity.id}`}
                                                 className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {activity.type === 'task' ? (
                                                        <CheckSquare className="h-4 w-4 text-blue-600"/>
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-purple-600"/>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-sm">{activity.title}</h4>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDateTime(activity.timestamp).split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {activity.description}
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {activity.type === 'task' && activity.status && (
                                                            <Badge
                                                                className={`text-xs px-2 py-0 ${getStatusColor(activity.status)}`}>
                                                                {activity.status}
                                                            </Badge>
                                                        )}
                                                        {activity.type === 'task' && activity.priority && (
                                                            <Badge
                                                                className={`text-xs px-2 py-0 ${getPriorityColor(activity.priority)}`}>
                                                                {activity.priority}
                                                            </Badge>
                                                        )}
                                                        {activity.type === 'note' && (
                                                            <Badge
                                                                className="text-xs px-2 py-0 bg-purple-100 text-purple-800">
                                                                Note
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No recent activity
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Upcoming Tasks */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5"/>
                                        Upcoming Deadlines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {upcomingTasks.length > 0 ? (
                                        upcomingTasks.map((task: any) => {
                                            const isOverdue = new Date(task.dueDate) < new Date();
                                            return (
                                                <div key={task.id}
                                                     className="flex items-start justify-between p-3 rounded-lg border">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{task.title}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Due: {formatDateTime(task.dueDate)}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge
                                                            className={`text-xs ${getPriorityColor(task.priority)}`}
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                        {isOverdue && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                <AlertTriangle className="h-3 w-3 mr-1"/>
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No upcoming deadlines
                                        </p>
                                    )}
                                    <Button variant="outline" size="sm" asChild className="w-full">
                                        <Link href="/tasks">View All Tasks</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TaskManagement
                                    staffId={staffMember.id}
                                    tasks={tasks}
                                    allStaff={allStaff}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes & Documentation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StaffNotes staffId={staffMember.id} initialNotes={notes}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule">
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule & Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Task Timeline</h3>
                                    {upcomingTasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {upcomingTasks.map((task: any) => (
                                                <div key={task.id}
                                                     className="flex items-center gap-4 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{task.title}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Due: {formatDateTime(task.dueDate)}
                                                        </div>
                                                    </div>
                                                    <Badge className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">
                                            No scheduled tasks
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <StaffEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                staffToEdit={staffMember}
                allStaff={allStaff}
                onSaveSuccess={handleSaveSuccess}
            />
        </>
    );
}