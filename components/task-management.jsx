"use client"

import React, {useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Checkbox} from "@/components/ui/checkbox"
import {CardFooter} from "@/components/ui/card"
import {addTask, deleteTask, updateTask} from "@/lib/api-client"
import {toast} from "sonner"
import {Trash2} from "lucide-react"
import {useRouter} from "next/navigation"

export function TaskManagement({staffId, initialTasks}) {
    const router = useRouter()
    const [tasks] = useState(initialTasks || [])
    const [newTask, setNewTask] = useState("")
    const [loading, setLoading] = useState(false)

    // The problematic useEffect has been removed.

    const handleAddTask = async () => {
        if (!newTask.trim()) {
            toast.error("Task description cannot be empty.")
            return
        }
        setLoading(true)
        try {
            await addTask({staffId, description: newTask, completed: false})
            toast.success("Task added successfully!")
            setNewTask("")
            router.refresh()
        } catch (error) {
            toast.error("Failed to add task.")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleTask = async (task) => {
        setLoading(true)
        try {
            await updateTask(task.id, {...task, completed: !task.completed})
            toast.success("Task updated!")
            router.refresh()
        } catch (error) {
            toast.error("Failed to update task.")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTask = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return
        setLoading(true)
        try {
            await deleteTask(taskId)
            toast.success("Task deleted successfully!")
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete task.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-md border">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={() => handleToggleTask(task)}
                                    disabled={loading}
                                />
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                    {task.description}
                                </label>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No tasks found.</p>
                )}
            </div>
            <CardFooter className="flex gap-2 p-0">
                <Input
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    disabled={loading}
                />
                <Button onClick={handleAddTask} disabled={loading}>
                    {loading ? "Adding..." : "Add Task"}
                </Button>
            </CardFooter>
        </div>
    )
}