"use client"

import React, {useState} from "react"
import {format} from "date-fns"
import {CheckCircle2, CircleDotDashed, Clock, XCircle} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Select, SelectContent, SelectItem} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Checkbox} from "@/components/ui/checkbox"
import {toast} from "sonner"
import {updateTask, deleteTask, addTask} from "@/lib/api-client"
import {calculateNextDueDate} from "@/lib/utils"
import {DatePicker} from "@/components/date-picker"
import {formatDate} from "@/lib/utils"

export function TaskCard({task, staff, onTaskUpdated, onTaskDeleted, onTaskAdded}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedTask, setEditedTask] = useState(task)
    const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false)
    const [recurringFormData, setRecurringFormData] = useState(
        task.recurringPattern || {
            frequency: "weekly",
            interval: 1,
            startDate: new Date(),
            currentOccurrence: 1,
        },
    )

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setEditedTask((prev) => ({...prev, [name]: value}))
    }

    const handleSelectChange = (name, value) => {
        setEditedTask((prev) => ({...prev, [name]: value}))
    }

    const handleDateChange = (date) => {
        setEditedTask((prev) => ({...prev, dueDate: date}))
    }

    const handleCompletedChange = async (checked) => {
        const updated = await updateTask(editedTask.id, {
            completed: checked,
            completedAt: checked ? new Date() : null,
            status: checked ? "Completed" : "Pending",
        })
        if (updated) {
            setEditedTask(updated)
            onTaskUpdated(updated)
            toast.success(`Task "${updated.title}" marked as ${checked ? "completed" : "pending"}.`)
        } else {
            toast.error("Failed to update task completion status.")
        }
    }

    const handleSave = async () => {
        try {
            const updated = await updateTask(editedTask.id, editedTask)
            if (updated) {
                setEditedTask(updated)
                onTaskUpdated(updated)
                setIsEditing(false)
                toast.success("Task updated successfully!")
            } else {
                toast.error("Failed to update task.")
            }
        } catch (error) {
            toast.error(`Failed to save task: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
            try {
                const success = await deleteTask(task.id)
                if (success) {
                    onTaskDeleted(task.id)
                    toast.success("Task deleted successfully!")
                } else {
                    toast.error("Failed to delete task.")
                }
            } catch (error) {
                toast.error(`Failed to delete task: ${error instanceof Error ? error.message : String(error)}`)
            }
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "Completed":
                return <CheckCircle2 className="h-4 w-4 text-green-500"/>
            case "In Progress":
                return <CircleDotDashed className="h-4 w-4 text-blue-500"/>
            case "Blocked":
                return <XCircle className="h-4 w-4 text-red-500"/>
            case "Pending":
            default:
                return <Clock className="h-4 w-4 text-yellow-500"/>
        }
    }

    const getPriorityClass = (priority) => {
        switch (priority) {
            case "Urgent":
                return "text-red-600 font-semibold"
            case "High":
                return "text-orange-500"
            case "Medium":
                return "text-yellow-600"
            case "Low":
                return "text-green-600"
            default:
                return ""
        }
    }

    const handleRecurringFormChange = (e) => {
        const {name, value} = e.target
        setRecurringFormData((prev) => ({
            ...prev,
            [name]: name === "interval" || name === "maxOccurrences" ? Number(value) : value,
        }))
    }

    const handleRecurringDateChange = (date, field) => {
        setRecurringFormData((prev) => ({...prev, [field]: date}))
    }

    const handleSaveRecurring = async () => {
        if (!editedTask.dueDate) {
            toast.error("Due date is required for recurring tasks.")
            return
        }

        const updatedPattern = {
            ...recurringFormData,
            startDate: recurringFormData.startDate || new Date(editedTask.dueDate), // Ensure start date is set
            currentOccurrence: 1, // Reset occurrence count for new recurring setup
        }

        // Calculate the initial nextDueDate for the original task
        const initialNextDueDate = calculateNextDueDate(new Date(editedTask.dueDate), updatedPattern)

        const updated = await updateTask(editedTask.id, {
            recurringPattern: updatedPattern,
            nextDueDate: initialNextDueDate,
            originalTaskId: null, // This task becomes the original recurring task
        })

        if (updated) {
            setEditedTask(updated)
            onTaskUpdated(updated)
            setIsRecurringDialogOpen(false)
            toast.success("Recurring pattern saved!")
        } else {
            toast.error("Failed to save recurring pattern.")
        }
    }

    const handleCreateInstance = async () => {
        if (!editedTask.recurringPattern || !editedTask.nextDueDate) {
            toast.error("This task is not set up for recurrence or is missing next due date.")
            return
        }

        try {
            const newTaskData = {
                title: editedTask.title,
                description: editedTask.description,
                status: "Pending",
                priority: editedTask.priority,
                dueDate: new Date(editedTask.nextDueDate),
                recurringPattern: {
                    ...editedTask.recurringPattern,
                    currentOccurrence: (editedTask.recurringPattern.currentOccurrence || 0) + 1,
                },
                nextDueDate: undefined, // This instance doesn't have a next due date
                originalTaskId: editedTask.originalTaskId || editedTask.id,
                staffId: editedTask.staffId,
            }

            const newInstance = await addTask(newTaskData)
            if (newInstance) {
                // Update the original task's nextDueDate and currentOccurrence
                const nextDueForOriginal = calculateNextDueDate(editedTask.nextDueDate, editedTask.recurringPattern)
                const updatedOriginal = await updateTask(editedTask.id, {
                    nextDueDate: nextDueForOriginal,
                    recurringPattern: {
                        ...editedTask.recurringPattern,
                        currentOccurrence: (editedTask.recurringPattern.currentOccurrence || 0) + 1,
                    },
                })

                if (updatedOriginal) {
                    setEditedTask(updatedOriginal) // Update the state of the original task card
                    onTaskUpdated(updatedOriginal)
                    onTaskAdded(newInstance) // Add the new instance to the list
                    toast.success("New recurring task instance created!")
                } else {
                    toast.error("Failed to update original task after creating instance.")
                }
            } else {
                toast.error("Failed to create new recurring task instance.")
            }
        } catch (error) {
            toast.error(`Error creating instance: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    {getStatusIcon(editedTask.status)}
                    {isEditing ? (
                        <Input name="title" value={editedTask.title} onChange={handleInputChange}
                               className="text-lg font-bold"/>
                    ) : (
                        <CardTitle className="text-lg">{editedTask.title}</CardTitle>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`completed-${task.id}`}
                        checked={editedTask.completed}
                        onCheckedChange={handleCompletedChange}
                        aria-label="Mark task as completed"
                    />
                    <Label htmlFor={`completed-${task.id}`} className="text-sm">
                        Completed
                    </Label>
                </div>
            </CardHeader>
            <CardContent className="grid gap-2">
                {isEditing ? (
                    <Textarea
                        name="description"
                        value={editedTask.description || ""}
                        onChange={handleInputChange}
                        placeholder="Task description"
                    />
                ) : (
                    <CardDescription>{editedTask.description || "No description provided."}</CardDescription>
                )}

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        {isEditing ? (
                            <Select
                                name="status"
                                value={editedTask.status}
                                onValueChange={(value) => handleSelectChange("status", value)}
                            >
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm font-medium">{editedTask.status}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="priority">Priority</Label>
                        {isEditing ? (
                            <Select
                                name="priority"
                                value={editedTask.priority}
                                onValueChange={(value) => handleSelectChange("priority", value)}
                            >
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className={cn("text-sm font-medium", getPriorityClass(editedTask.priority))}>{editedTask.priority}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        {isEditing ? (
                            <DatePicker date={editedTask.dueDate} setDate={handleDateChange}/>
                        ) : (
                            <p className="text-sm">{editedTask.dueDate ? formatDate(editedTask.dueDate) : "No due date"}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="staffId">Assigned To</Label>
                        {isEditing ? (
                            <Select
                                name="staffId"
                                value={editedTask.staffId || "Unassigned"}
                                onValueChange={(value) => handleSelectChange("staffId", value)}
                            >
                                <SelectContent>
                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                    {staff.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm">{staff.find((s) => s.id === editedTask.staffId)?.name || "Unassigned"}</p>
                        )}
                    </div>
                </div>

                {editedTask.recurringPattern && (
                    <div className="mt-4 p-3 border rounded-md bg-muted/50">
                        <h4 className="font-semibold text-sm mb-1">Recurring Task Details:</h4>
                        <p className="text-xs text-muted-foreground">
                            Frequency:
                            Every {editedTask.recurringPattern.interval} {editedTask.recurringPattern.frequency}
                        </p>
                        {editedTask.nextDueDate && (
                            <p className="text-xs text-muted-foreground">Next Instance
                                Due: {formatDate(editedTask.nextDueDate)}</p>
                        )}
                        {editedTask.recurringPattern.endDate && (
                            <p className="text-xs text-muted-foreground">
                                Ends: {format(new Date(editedTask.recurringPattern.endDate), "PPP")}
                            </p>
                        )}
                        {editedTask.recurringPattern.maxOccurrences && (
                            <p className="text-xs text-muted-foreground">
                                Occurrences: {editedTask.recurringPattern.currentOccurrence} /{" "}
                                {editedTask.recurringPattern.maxOccurrences}
                            </p>
                        )}
                        {editedTask.originalTaskId && (
                            <p className="text-xs text-muted-foreground">
                                Instance of original task ID: {editedTask.originalTaskId.substring(0, 8)}...
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>Save</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                Delete
                            </Button>
                            <Popover open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        {editedTask.recurringPattern ? "Edit Recurrence" : "Set Recurrence"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Recurring Pattern</h4>
                                            <p className="text-sm text-muted-foreground">Define how often this task
                                                repeats.</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="frequency">Frequency</Label>
                                            <Select
                                                name="frequency"
                                                value={recurringFormData.frequency}
                                                onValueChange={(value) =>
                                                    setRecurringFormData((prev) => ({
                                                        ...prev,
                                                        frequency: value
                                                    }))
                                                }
                                            >
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="interval">Interval</Label>
                                            <Input
                                                id="interval"
                                                name="interval"
                                                type="number"
                                                value={recurringFormData.interval}
                                                onChange={handleRecurringFormChange}
                                                min="1"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <DatePicker
                                                date={recurringFormData.startDate}
                                                setDate={(date) => handleRecurringDateChange(date, "startDate")}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="endDate">End Date (Optional)</Label>
                                            <DatePicker
                                                date={recurringFormData.endDate}
                                                setDate={(date) => handleRecurringDateChange(date, "endDate")}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="maxOccurrences">Max Occurrences (Optional)</Label>
                                            <Input
                                                id="maxOccurrences"
                                                name="maxOccurrences"
                                                type="number"
                                                value={recurringFormData.maxOccurrences || ""}
                                                onChange={handleRecurringFormChange}
                                                min="1"
                                                placeholder="e.g., 10"
                                            />
                                        </div>
                                        <Button onClick={handleSaveRecurring}>Save Recurrence</Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {editedTask.recurringPattern && (
                                <Button onClick={handleCreateInstance} size="sm" variant="secondary">
                                    Create Next Instance
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}