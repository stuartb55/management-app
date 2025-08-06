"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {CheckSquare, FileText, Clock} from "lucide-react"
import {formatDateTime} from "@/lib/utils"
import Link from "next/link"
import type {Task, Note, Staff} from "@/lib/types"

interface RecentActivityProps {
    tasks: Task[]
    notes: Note[]
    staff: Staff[]
}

interface ActivityItem {
    id: string
    type: 'task' | 'note'
    title: string
    description: string
    timestamp: string
    staffName: string
    staffId: string
    status?: string
    priority?: string
}

export function RecentActivity({tasks, notes, staff}: RecentActivityProps) {
    const getStaffName = (staffId: string | null) => {
        if (!staffId) return "Unassigned"
        const staffMember = staff.find(s => s.id === staffId)
        return staffMember ? staffMember.name : "Unknown Staff"
    }

    // Combine and sort recent activities
    const recentActivities: ActivityItem[] = [
        // Recent tasks (created or updated)
        ...tasks.slice(0, 10).map(task => ({
            id: task.id,
            type: 'task' as const,
            title: task.title,
            description: task.description || 'No description',
            timestamp: task.updatedAt || task.createdAt,
            staffName: getStaffName(task.staffId),
            staffId: task.staffId || '',
            status: task.status,
            priority: task.priority
        })),
        // Recent notes
        ...notes.slice(0, 10).map(note => ({
            id: note.id,
            type: 'note' as const,
            title: note.title,
            description: note.content,
            timestamp: note.updatedAt || note.createdAt,
            staffName: getStaffName(note.staffId),
            staffId: note.staffId || ''
        }))
    ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8) // Show only 8 most recent items

    const getActivityIcon = (type: string, status?: string) => {
        if (type === 'task') {
            return status === 'Completed' ?
                <CheckSquare className="h-4 w-4 text-green-600"/> :
                <Clock className="h-4 w-4 text-blue-600"/>
        }
        return <FileText className="h-4 w-4 text-purple-600"/>
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800'
            case 'In Progress':
                return 'bg-blue-100 text-blue-800'
            case 'Blocked':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-100 text-red-800'
            case 'High':
                return 'bg-orange-100 text-orange-800'
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'Low':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5"/>
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentActivities.length > 0 ? (
                    <>
                        {recentActivities.map((activity) => (
                            <div key={`${activity.type}-${activity.id}`}
                                 className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getActivityIcon(activity.type, activity.status)}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-sm truncate">
                                            {activity.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(activity.timestamp).split(' ')[0]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/staff/${activity.staffId}`}
                                            className="text-xs text-muted-foreground hover:underline"
                                        >
                                            {activity.staffName}
                                        </Link>
                                        <div className="flex gap-1">
                                            {activity.type === 'task' && activity.status && (
                                                <Badge
                                                    className={`text-xs px-2 py-0 ${getStatusColor(activity.status)}`}
                                                >
                                                    {activity.status}
                                                </Badge>
                                            )}
                                            {activity.type === 'task' && activity.priority && (
                                                <Badge
                                                    className={`text-xs px-2 py-0 ${getPriorityColor(activity.priority)}`}
                                                >
                                                    {activity.priority}
                                                </Badge>
                                            )}
                                            {activity.type === 'note' && (
                                                <Badge className="text-xs px-2 py-0 bg-purple-100 text-purple-800">
                                                    Note
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 border-t">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <Link href="/tasks">View All Tasks</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <Link href="/notes">View All Notes</Link>
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}