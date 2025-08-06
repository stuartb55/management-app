import type {Staff} from "@/lib/types"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {
    Pencil,
    Mail,
    Briefcase,
    Users,
    UserCheck,
    Calendar,
    Building
} from "lucide-react"

interface StaffDetailsProps {
    staffMember: Staff
    onEditClick: () => void
    taskStats?: {
        total: number
        completed: number
        pending: number
        overdue: number
    }
    noteCount?: number
}

export function StaffDetails({staffMember, onEditClick, taskStats, noteCount = 0}: StaffDetailsProps) {
    const completionRate = taskStats && taskStats.total > 0
        ? Math.round((taskStats.completed / taskStats.total) * 100)
        : 0

    const getPerformanceBadge = (rate: number) => {
        if (rate >= 80) return {variant: "default" as const, label: "Excellent"}
        if (rate >= 60) return {variant: "secondary" as const, label: "Good"}
        if (rate >= 40) return {variant: "outline" as const, label: "Average"}
        return {variant: "destructive" as const, label: "Needs Attention"}
    }

    const performanceBadge = getPerformanceBadge(completionRate)

    const contactDetails = [
        {
            icon: Mail,
            label: "Email",
            value: staffMember.email,
            link: `mailto:${staffMember.email}`
        },
        {
            icon: Briefcase,
            label: "Job Role",
            value: staffMember.jobRole
        },
        {
            icon: Building,
            label: "Staff Number",
            value: staffMember.staffNumber
        },
        {
            icon: Users,
            label: "Team",
            value: staffMember.teamName || "No team assigned"
        },
        {
            icon: UserCheck,
            label: "Line Manager",
            value: staffMember.lineManagerName || "No line manager assigned"
        },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-lg font-semibold">
                                    {staffMember.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{staffMember.name}</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    {staffMember.jobRole}
                                </CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        ID: {staffMember.staffNumber}
                                    </Badge>
                                    {taskStats && taskStats.total > 0 && (
                                        <Badge variant={performanceBadge.variant} className="text-xs">
                                            {completionRate}% Complete - {performanceBadge.label}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button onClick={onEditClick} size="sm">
                            <Pencil className="mr-2 h-4 w-4"/>
                            Edit Details
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contactDetails.map((detail) => (
                            <div key={detail.label} className="flex items-start gap-3">
                                <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
                                    <detail.icon className="h-4 w-4 text-muted-foreground"/>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {detail.label}
                                    </p>
                                    {detail.link ? (
                                        <a
                                            href={detail.link}
                                            className="text-sm hover:underline text-blue-600"
                                        >
                                            {detail.value}
                                        </a>
                                    ) : (
                                        <p className="text-sm">{detail.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {taskStats ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total Tasks</div>
                                </div>
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                                    <div className="text-xs text-muted-foreground">Completed</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
                                    <div className="text-xs text-muted-foreground">Pending</div>
                                </div>
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                                    <div className="text-xs text-muted-foreground">Overdue</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Completion Rate</span>
                                    <span className="font-medium">{completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{width: `${completionRate}%`}}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="text-2xl font-bold text-muted-foreground">0</div>
                            <div className="text-sm text-muted-foreground">No tasks assigned</div>
                        </div>
                    )}

                    {/* Notes Count */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Calendar className="h-4 w-4 text-purple-600"/>
                                </div>
                                <div>
                                    <div className="font-medium text-sm">Documentation</div>
                                    <div className="text-xs text-muted-foreground">
                                        {noteCount} notes recorded
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                {noteCount}
                            </Badge>
                        </div>
                    </div>

                    {/* Member Since */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600"/>
                            </div>
                            <div>
                                <div className="font-medium text-sm">Member Since</div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(staffMember.createdAt).toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}