"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Textarea} from "./ui/textarea";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {DatePicker} from "./date-picker";

export function TaskManagement({tasks: initialTasks, allStaff = [], staffId}) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks || []);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        staffId: staffId || "",
        status: "Pending", // Default changed to match schema
        priority: "Medium", // Default changed to match schema
        dueDate: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        setLoading(true);
        setError(null);

        const taskData = {
            ...newTask,
            staffId: staffId || newTask.staffId,
        };

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add task");
            }

            const addedTask = await response.json();
            setTasks((prev) => [...prev, addedTask]);
            setNewTask({
                title: "",
                description: "",
                staffId: staffId || "",
                status: "Pending",
                priority: "Medium",
                dueDate: null
            });
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>Fill out the form to add a new task.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddTask} className="space-y-4">
                    <Input
                        name="title"
                        placeholder="Task Title"
                        value={newTask.title}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                    />
                    <Textarea
                        name="description"
                        placeholder="Task Description"
                        value={newTask.description}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    {!staffId && (
                        <Select
                            name="staffId"
                            value={newTask.staffId}
                            onValueChange={(value) => handleSelectChange("staffId", value)}
                            required
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
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select name="status" value={newTask.status}
                                onValueChange={(value) => handleSelectChange("status", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Blocked">Blocked</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select name="priority" value={newTask.priority}
                                onValueChange={(value) => handleSelectChange("priority", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Priority"/>
                            </SelectTrigger>
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
                    {error && <p className="text-red-500">{error}</p>}
                </form>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Existing Tasks</h3>
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <Card key={task.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{task.title}</h4>
                                            <p className="text-sm text-gray-500">{task.description}</p>
                                        </div>
                                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                            task.priority === 'High' ? 'bg-red-200 text-red-800' :
                                                task.priority === 'Urgent' ? 'bg-red-200 text-red-800' :
                                                    task.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                                        'bg-green-200 text-green-800'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="text-xs mt-2">
                                        <p>Status: {task.status}</p>
                                        <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}