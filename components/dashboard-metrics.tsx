"use client"

import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {
    Users,
    CheckSquare,
    Clock,
    PlayCircle,
    AlertTriangle,
    FileText,
    Target
} from "lucide-react"

interface DashboardMetricsProps {
    totalStaff: number
    pendingTasks: number
    inProgressTasks: number
    completedTasks: number
    overdueTasks: number
    totalNotes: number
}

export function DashboardMetrics({
                                     totalStaff,
                                     pendingTasks,
                                     inProgressTasks,
                                     completedTasks,
                                     overdueTasks,
                                     totalNotes
                                 }: DashboardMetricsProps) {
    const totalActiveTasks = pendingTasks + inProgressTasks
    const totalTasks = totalActiveTasks + completedTasks
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const metrics = [
        {
            title: "Team Members",
            value: totalStaff,
            icon: Users,
            description: "Active staff",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Active Tasks",
            value: totalActiveTasks,
            icon: Target,
            description: `${overdueTasks > 0 ? `${overdueTasks} overdue` : 'On track'}`,
            color: overdueTasks > 0 ? "text-red-600" : "text-green-600",
            bgColor: overdueTasks > 0 ? "bg-red-50" : "bg-green-50",
        },
        {
            title: "In Progress",
            value: inProgressTasks,
            icon: PlayCircle,
            description: "Currently working",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Completed",
            value: completedTasks,
            icon: CheckSquare,
            description: `${completionRate}% completion rate`,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Pending",
            value: pendingTasks,
            icon: Clock,
            description: "Awaiting start",
            color: "text-gray-600",
            bgColor: "bg-gray-50",
        },
        {
            title: "Documentation",
            value: totalNotes,
            icon: FileText,
            description: "Notes & records",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric) => (
                <Card key={metric.title} className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {metric.title}
                                </p>
                                <p className="text-2xl font-bold">{metric.value}</p>
                                <p className={`text-xs ${metric.color} font-medium`}>
                                    {metric.description}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                                <metric.icon className={`h-5 w-5 ${metric.color}`}/>
                            </div>
                        </div>

                        {/* Progress indicator for completion rate */}
                        {metric.title === "Completed" && totalTasks > 0 && (
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                        style={{width: `${completionRate}%`}}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Alert indicator for overdue tasks */}
                        {metric.title === "Active Tasks" && overdueTasks > 0 && (
                            <div className="absolute top-2 right-2">
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                    <AlertTriangle className="h-3 w-3"/>
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}