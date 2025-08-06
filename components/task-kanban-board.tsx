"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, User, AlertTriangle, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import { updateTask } from "@/lib/api-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TaskEditDialog } from "@/components/task-edit-dialog"
import type { Task, Staff } from "@/lib/types"

interface TaskKanbanBoardProps {
    tasks: Task[]
    staff: Staff[]
}

const columns = [
    { id: 'Pending', title: 'Pending', color: 'border-gray-200 bg-gray-50' },
    { id: 'In Progress', title: 'In Progress', color: 'border-blue-200 bg-blue-50' },
    { id: 'Completed', title: 'Completed', color: 'border-green-200 bg-green-50' },
    { id: 'Blocked', title: 'Blocked', color: 'border-red-200 bg-red-50' }
]

export function TaskKanbanBoard({ tasks, staff }: TaskKanbanBoardProps) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [boardTasks, setBoardTasks] = useState<Task[]>(tasks)
    const router = useRouter()

    const getStaffMember = (staffId: string | null) => {
        if (!staffId) return null
        return staff.find(s => s.id === staffId)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-500'
            case 'High':
                return 'bg-orange-500'
            case 'Medium':
                return 'bg-yellow-500'
            case 'Low':
                return 'bg-green-500'
            default:
                return 'bg-gray-500'
        }
    }

    const isOverdue = (task: Task) => {
        return task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date()
    }

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null)
            return
        }

        setIsUpdating(draggedTask.id)

        try {
            const updatedTask = await updateTask(draggedTask.id, {
                status: newStatus as "Pending" | "In Progress" | "Completed" | "Blocked" | "Cancelled",
                completedAt: newStatus === 'Completed' ? new Date().toISOString() : null
            })

            // Update local state
            setBoardTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            )

            toast.success(`Task moved to ${newStatus}`)
            router.refresh()
        } catch {
            toast.error('Failed to update task status')
        } finally {
            setIsUpdating(null)
            setDraggedTask(null)
        }
    }

    const handleEditTask = (task: Task) => {
        setEditingTask(task)
        setIsEditDialogOpen(true)
    }

    const handleTaskUpdated = (updatedTask: Task) => {
        setBoardTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        )
        router.refresh()
    }

    const TaskCard = ({ task }: { task: Task }) => {
        const staffMember = getStaffMember(task.staffId)
        const overdue = isOverdue(task)

        return (
            <Card
                className={cn(
                    "mb-3 cursor-move hover:shadow-md transition-shadow group",
                    isUpdating === task.id && "opacity-50",
                    overdue && "border-red-300"
                )}
                draggable={!isUpdating}
                onDragStart={(e) => handleDragStart(e, task)}
            >
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Header with priority and edit button */}
                        <div className="flex items-start gap-2">
                            <div
                                className={cn(
                                    "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                                    getPriorityColor(task.priority)
                                )}
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                                {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditTask(task)
                                }}
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* Task metadata */}
                        <div className="space-y-2">
                            {/* Due date */}
                            {task.dueDate && (
                                <div className={cn(
                                    "flex items-center gap-1 text-xs",
                                    overdue ? "text-red-600" : "text-muted-foreground"
                                )}>
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(task.dueDate).split(' ')[0]}
                                    {overdue && <AlertTriangle className="h-3 w-3 ml-1" />}
                                </div>
                            )}

                            {/* Assigned staff */}
                            {staffMember && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {staffMember.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Link
                                        href={`/staff/${staffMember.id}`}
                                        className="text-xs text-muted-foreground hover:underline truncate"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {staffMember.name}
                                    </Link>
                                </div>
                            )}

                            {/* Priority badge */}
                            <div className="flex justify-between items-center">
                                <Badge
                                    variant={
                                        task.priority === 'Urgent' ? 'destructive' :
                                            task.priority === 'High' ? 'secondary' :
                                                'outline'
                                    }
                                    className="text-xs"
                                >
                                    {task.priority}
                                </Badge>

                                {overdue && (
                                    <Badge variant="destructive" className="text-xs">
                                        Overdue
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((column) => {
                    const columnTasks = boardTasks.filter(task => task.status === column.id)

                    return (
                        <div
                            key={column.id}
                            className={cn(
                                "rounded-lg border-2 border-dashed p-4 min-h-[400px]",
                                column.color
                            )}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-sm text-gray-700">
                                    {column.title}
                                </h3>
                                <Badge variant="outline" className="text-xs bg-white">
                                    {columnTasks.length}
                                </Badge>
                            </div>

                            <div className="space-y-0">
                                {columnTasks.length > 0 ? (
                                    columnTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-3">
                                            <User className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No tasks in {column.title.toLowerCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Edit Task Dialog */}
            <TaskEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                taskToEdit={editingTask}
                allStaff={staff}
                onTaskUpdated={handleTaskUpdated}
            />
        </>
    )
}