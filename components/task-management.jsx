"use client"

import {useState, useEffect} from "react"
import {addTask} from "@/lib/api-client"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {TaskCard} from "./task-card"
import {toast} from "sonner"
import {PlusCircle} from "lucide-react"

// Define the initial state for a new task outside the component
const getInitialNewTaskState = (staffId) => ({
    staffId: staffId || null,
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    completed: false,
    dueDate: null,
    completedAt: null,
    recurringPattern: null,
    nextDueDate: null,
    originalTaskId: null,
});


export function TaskManagement({
                                   tasks: initialTasks = [],
                                   allStaff = [],
                                   staffId,
                               }) {
    const [tasks, setTasks] = useState(initialTasks)
    // Use a lazy initialiser for the state to ensure it's only set once
    const [newTask, setNewTask] = useState(() => getInitialNewTaskState(staffId));


    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setNewTask(prev => ({...prev, [name]: value}))
    }

    const handleSelectChange = (name, value) => {
        // This is the key fix: only update the state if the value has actually changed.
        const newValue = value || null;
        setNewTask(prev => {
            if (prev[name] === newValue) {
                return prev; // Return the same state object if the value is unchanged
            }
            return {...prev, [name]: newValue}
        })
    }

    const handleAddTask = async () => {
        if (!newTask.title || !newTask.staffId) {
            toast.error("Title and assigned staff member are required.")
            return
        }
        try {
            const addedTask = await addTask(newTask)
            if (addedTask) {
                setTasks(prev => [addedTask, ...prev])
                // Reset the form correctly
                setNewTask(getInitialNewTaskState(staffId));
                toast.success("Task added successfully!")
            } else {
                toast.error("Failed to add task.")
            }
        } catch (error) {
            toast.error(
                `Failed to add task: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    const handleTaskUpdated = (updatedTask) => {
        setTasks(prev =>
            prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
        )
    }

    const handleTaskDeleted = (taskId) => {
        setTasks(prev => prev.filter(task => task.id !== taskId))
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Task</CardTitle>
                    <CardDescription>Assign a new task to a staff member.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            name="title"
                            value={newTask.title}
                            onChange={handleInputChange}
                            placeholder="E.g., Complete project report"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="task-staff">Assign To</Label>
                            <Select
                                name="staffId"
                                value={newTask.staffId || ""}
                                onValueChange={value => handleSelectChange("staffId", value)}
                                disabled={!!staffId}
                            >
                                <SelectTrigger id="task-staff">
                                    <SelectValue placeholder="Select staff"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {(allStaff || []).map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select
                                name="priority"
                                value={newTask.priority}
                                onValueChange={(value) => handleSelectChange("priority", value)}
                            >
                                <SelectTrigger id="task-priority">
                                    <SelectValue placeholder="Select priority"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                            id="task-description"
                            name="description"
                            value={newTask.description || ""}
                            onChange={handleInputChange}
                            placeholder="Add more details about the task..."
                            rows={3}
                        />
                    </div>
                    <Button onClick={handleAddTask} className="w-full md:w-auto self-end">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Task
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Existing Tasks</CardTitle>
                    <CardDescription>
                        {staffId ? "Tasks assigned to this staff member." : "All tasks."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {tasks.length === 0 ? (
                        <p className="text-center text-muted-foreground">No tasks found.</p>
                    ) : (
                        tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                allStaff={allStaff}
                                onTaskUpdated={handleTaskUpdated}
                                onTaskDeleted={handleTaskDeleted}
                            />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}