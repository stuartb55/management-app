"use client"

import type * as React from "react"
import {useState, useEffect} from "react"
import {addTask} from "@/lib/api-client"
import type {Task, Staff, RecurringPattern, RecurringFrequency} from "@/lib/types"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {TaskCard} from "./task-card"
import {toast} from "sonner"
import {PlusCircle} from "lucide-react"
import {DatePicker} from "@/components/date-picker"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {calculateNextDueDate} from "@/lib/utils"

type TaskManagementProps = {
    initialTasks: Task[]
    staff: Staff[]
    currentStaffId?: string
}

// Define a version of the Task type for the component's internal state
type NewTaskState = Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">;

export function TaskManagement({initialTasks, staff, currentStaffId}: TaskManagementProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [newTask, setNewTask] = useState<NewTaskState>({
        title: "",
        description: "",
        status: "Pending",
        priority: "Medium",
        dueDate: undefined,
        staffId: currentStaffId || "",
        recurringPattern: undefined,
        nextDueDate: undefined,
        originalTaskId: undefined,
    });
    const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
    const [recurringFormData, setRecurringFormData] = useState<RecurringPattern>({
        frequency: "weekly",
        interval: 1,
        startDate: new Date().toISOString(), // Use ISO string to match the type
        currentOccurrence: 1,
    });

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setNewTask((prev) => ({...prev, [name]: value}));
    };

    const handleSelectChange = (name: string, value: string) => {
        setNewTask((prev) => ({...prev, [name]: value}));
    };

    // Correctly handle date changes by converting to ISO string for state
    const handleDateChange = (date: Date | undefined) => {
        setNewTask((prev) => ({...prev, dueDate: date?.toISOString()}));
    };

    const handleRecurringFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setRecurringFormData((prev) => ({
            ...prev,
            [name]: name === "interval" || name === "maxOccurrences" ? Number(value) : value,
        }));
    };

    // Correctly handle recurring date changes by converting to ISO string
    const handleRecurringDateChange = (date: Date | undefined, field: "startDate" | "endDate") => {
        setRecurringFormData((prev) => ({...prev, [field]: date?.toISOString()}));
    };

    const handleAddOrUpdateTask = async () => {
        if (!newTask.title || !newTask.staffId) {
            toast.error("Title and assigned staff member are required for a new task.");
            return;
        }

        const taskToSubmit = {...newTask};

        if (isRecurringDialogOpen && newTask.dueDate) {
            const pattern: RecurringPattern = {
                ...recurringFormData,
                startDate: recurringFormData.startDate, // Already a string
                currentOccurrence: 1,
            };
            taskToSubmit.recurringPattern = pattern;

            // Assuming calculateNextDueDate takes a Date and returns a Date
            const nextDueDateObj = calculateNextDueDate(new Date(newTask.dueDate), pattern);
            taskToSubmit.nextDueDate = nextDueDateObj?.toISOString();
        } else {
            taskToSubmit.recurringPattern = undefined;
            taskToSubmit.nextDueDate = undefined;
            taskToSubmit.originalTaskId = undefined;
        }

        try {
            // The addTask function expects all dates to be strings, which they now are.
            const addedTask = await addTask(taskToSubmit);
            if (addedTask) {
                setTasks((prev) => [addedTask, ...prev]);
                setNewTask({
                    title: "",
                    description: "",
                    status: "Pending",
                    priority: "Medium",
                    dueDate: undefined,
                    staffId: currentStaffId || "",
                    recurringPattern: undefined,
                    nextDueDate: undefined,
                    originalTaskId: undefined,
                });
                setRecurringFormData({
                    frequency: "weekly",
                    interval: 1,
                    startDate: new Date().toISOString(),
                    currentOccurrence: 1,
                });
                setIsRecurringDialogOpen(false);
                toast.success("Task added successfully!");
            } else {
                toast.error("Failed to add task.");
            }
        } catch (error) {
            toast.error(`Failed to add task: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    };

    const handleTaskDeleted = (taskId: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
    };

    const handleTaskAdded = (addedTask: Task) => {
        setTasks((prev) => [addedTask, ...prev]);
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Task</CardTitle>
                    <CardDescription>Create a new task and assign it to a staff member.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {/* ... (Input fields for title, staff, description, status, priority) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="task-title">Title</Label>
                            <Input id="task-title" name="title" value={newTask.title} onChange={handleInputChange}
                                   placeholder="Task title"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-staff">Assigned To</Label>
                            <Select name="staffId" value={newTask.staffId || ""}
                                    onValueChange={(value) => handleSelectChange("staffId", value)}
                                    disabled={!!currentStaffId}>
                                <SelectTrigger id="task-staff"><SelectValue
                                    placeholder="Select a staff member"/></SelectTrigger>
                                <SelectContent>{staff?.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea id="task-description" name="description" value={newTask.description || ""}
                                  onChange={handleInputChange} placeholder="Task description (optional)" rows={3}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="task-status">Status</Label>
                            <Select name="status" value={newTask.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}>
                                <SelectTrigger id="task-status"><SelectValue
                                    placeholder="Select status"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select name="priority" value={newTask.priority}
                                    onValueChange={(value) => handleSelectChange("priority", value)}>
                                <SelectTrigger id="task-priority"><SelectValue
                                    placeholder="Select priority"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-dueDate">Due Date</Label>
                            {/* Convert string from state back to Date object for the picker */}
                            <DatePicker date={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                                        setDate={handleDateChange}/>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Popover open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        size="sm">{newTask.recurringPattern ? "Edit Recurrence" : "Set Recurrence"}</Button>
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
                                        <Select name="frequency" value={recurringFormData.frequency}
                                                onValueChange={(value) => setRecurringFormData((prev) => ({
                                                    ...prev,
                                                    frequency: value as RecurringFrequency
                                                }))}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
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
                                        <Input id="interval" name="interval" type="number"
                                               value={recurringFormData.interval} onChange={handleRecurringFormChange}
                                               min="1"/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        {/* Convert string from state back to Date object for the picker */}
                                        <DatePicker date={new Date(recurringFormData.startDate)}
                                                    setDate={(date) => handleRecurringDateChange(date, "startDate")}/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="endDate">End Date (Optional)</Label>
                                        {/* Convert string from state back to Date object for the picker */}
                                        <DatePicker
                                            date={recurringFormData.endDate ? new Date(recurringFormData.endDate) : undefined}
                                            setDate={(date) => handleRecurringDateChange(date, "endDate")}/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="maxOccurrences">Max Occurrences (Optional)</Label>
                                        <Input id="maxOccurrences" name="maxOccurrences" type="number"
                                               value={recurringFormData.maxOccurrences || ""}
                                               onChange={handleRecurringFormChange} min="1" placeholder="e.g., 10"/>
                                    </div>
                                    <Button onClick={() => setIsRecurringDialogOpen(false)}>Confirm Recurrence</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleAddOrUpdateTask} className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Task
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Tasks</CardTitle>
                    <CardDescription>All tasks assigned to the selected staff member.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {tasks.length === 0 ? (
                        <p className="text-center text-muted-foreground">No tasks found.</p>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                staff={staff}
                                onTaskUpdated={handleTaskUpdated}
                                onTaskDeleted={handleTaskDeleted}
                                onTaskAdded={handleTaskAdded}
                            />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}