"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {addTask} from "@/lib/api-client";
import {toast} from "sonner";
import {TaskCard} from "./task-card";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {DatePicker} from "./date-picker";

export function TaskManagement({tasks: initialTasks, allStaff = []}) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks || []);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        staffId: "",
        status: "Pending",
        priority: "Medium",
        dueDate: null,
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewTask((prev) => ({...prev, [name]: value}));
    };

    const handleSelectChange = (name, value) => {
        setNewTask((prev) => ({...prev, [name]: value}));
    };

    const handleDateChange = (date) => {
        setNewTask((prev) => ({...prev, dueDate: date}));
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            toast.error("Please provide a title for the task.");
            return;
        }
        setLoading(true);
        try {
            const addedTask = await addTask(newTask);
            setTasks((prev) => [addedTask, ...prev]);
            setNewTask({title: "", description: "", staffId: "", status: "Pending", priority: "Medium", dueDate: null});
            toast.success("Task added successfully!");
            router.refresh();
        } catch (error) {
            toast.error(`Failed to add task: ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        router.refresh();
    };

    const handleTaskDeleted = (taskId) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        router.refresh();
    };

    const handleTaskAdded = (addedTask) => {
        setTasks((prev) => [addedTask, ...prev]);
        router.refresh();
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Task Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Task</CardTitle>
                    <CardDescription>Create a new task and assign it to a staff member.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddTask} className="space-y-4">
                        <Input
                            name="title"
                            placeholder="Task Title *"
                            value={newTask.title}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <Textarea
                            name="description"
                            placeholder="Task Description"
                            value={newTask.description}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <Select
                            name="staffId"
                            value={newTask.staffId}
                            onValueChange={(value) => handleSelectChange("staffId", value)}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Staff Member"/>
                            </SelectTrigger>
                            <SelectContent>
                                {allStaff.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                        {staff.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select name="status" value={newTask.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}>
                                <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select name="priority" value={newTask.priority}
                                    onValueChange={(value) => handleSelectChange("priority", value)}>
                                <SelectTrigger><SelectValue placeholder="Priority"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <DatePicker date={newTask.dueDate} setDate={handleDateChange}/>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Task"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-bold mb-4">Existing Tasks</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                staff={allStaff}
                                onTaskUpdated={handleTaskUpdated}
                                onTaskDeleted={handleTaskDeleted}
                                onTaskAdded={handleTaskAdded}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full text-center py-8">
                            No tasks found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
