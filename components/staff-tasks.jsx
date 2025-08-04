"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {CardFooter} from "@/components/ui/card";
import {addTask, deleteTask, updateTask} from "@/lib/api-client";
import {toast} from "sonner";
import {Trash2} from "lucide-react";

export function StaffTasks({staffId, initialTasks}) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks || []);
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskDescription.trim()) {
            toast.error("Task description cannot be empty.");
            return;
        }
        setLoading(true);
        try {
            // Create a minimal task object for adding
            const newTaskData = {
                title: newTaskDescription, // Assuming title is the main description for simple add
                description: newTaskDescription,
                status: 'Pending',
                priority: 'Medium',
                staffId: staffId,
                dueDate: null,
            };
            const addedTask = await addTask(newTaskData);
            setTasks((prev) => [addedTask, ...prev]);
            setNewTaskDescription("");
            toast.success("Task added successfully!");
            router.refresh();
        } catch (error) {
            toast.error(`Failed to add task: ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (task) => {
        setLoading(true);
        try {
            const updatedTask = await updateTask(task.id, {
                ...task,
                status: task.status === 'Completed' ? 'Pending' : 'Completed',
                completedAt: task.status !== 'Completed' ? new Date().toISOString() : null
            });
            setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
            toast.success("Task updated!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to update task.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        setLoading(true);
        try {
            await deleteTask(taskId);
            setTasks((prev) => prev.filter((task) => task.id !== taskId));
            toast.success("Task deleted successfully!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-md border">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.status === 'Completed'}
                                    onCheckedChange={() => handleToggleTask(task)}
                                    disabled={loading}
                                />
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className={`text-sm ${task.status === 'Completed' ? "line-through text-muted-foreground" : ""}`}
                                >
                                    {task.title}
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
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks found for this staff
                        member.</p>
                )}
            </div>
            <form onSubmit={handleAddTask}>
                <CardFooter className="flex gap-2 p-0">
                    <Input
                        placeholder="Add a new task..."
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Task"}
                    </Button>
                </CardFooter>
            </form>
        </div>
    );
}
