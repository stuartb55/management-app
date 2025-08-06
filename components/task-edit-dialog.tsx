"use client";

import React, {useState, useEffect} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {DatePicker} from "@/components/ui/date-picker";
import {updateTask} from "@/lib/api-client";
import {toast} from "sonner";
import type {Task, Staff} from "@/lib/types";

interface TaskFormData extends Omit<Task, 'dueDate'> {
    dueDate: Date | null;
}

interface TaskEditDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    taskToEdit: Task | null;
    allStaff: Staff[];
    onTaskUpdated?: (task: Task) => void;
    trigger?: React.ReactNode;
}

export function TaskEditDialog({
                                   open,
                                   onOpenChange,
                                   taskToEdit,
                                   allStaff,
                                   onTaskUpdated,
                                   trigger,
                               }: TaskEditDialogProps) {
    const [formData, setFormData] = useState<Partial<TaskFormData>>({});
    const [loading, setLoading] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    useEffect(() => {
        if (taskToEdit) {
            const { dueDate, ...otherProps } = taskToEdit;
            setFormData({
                ...otherProps,
                dueDate: dueDate ? new Date(dueDate) : null,
            });
        }
    }, [taskToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleDateChange = (date: Date | undefined) => {
        setFormData((prev) => ({...prev, dueDate: date || null}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!taskToEdit || !formData.title?.trim()) {
            toast.error("Task title is required.");
            return;
        }

        setLoading(true);

        try {
            // Prepare data for API
            const submitData = {
                title: formData.title,
                description: formData.description || "",
                status: formData.status,
                priority: formData.priority,
                staffId: formData.staffId,
                dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
                completedAt: formData.status === 'Completed' && !taskToEdit.completedAt
                    ? new Date().toISOString()
                    : formData.status !== 'Completed'
                        ? null
                        : formData.completedAt
            };

            const updatedTask = await updateTask(taskToEdit.id, submitData);
            onTaskUpdated?.(updatedTask);
            setDialogOpen(false);
            toast.success("Task updated successfully!");
            
            // Refresh the page to reflect changes
            window.location.reload();
        } catch (error) {
            toast.error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setDialogOpen(false);
        if (taskToEdit) {
            const { dueDate, ...otherProps } = taskToEdit;
            setFormData({
                ...otherProps,
                dueDate: dueDate ? new Date(dueDate) : null,
            });
        }
    };

    if (!taskToEdit) return null;

    if (trigger) {
        return (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Update the task details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title || ""}
                                onChange={handleInputChange}
                                placeholder="Task title"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange}
                                placeholder="Task description"
                                rows={3}
                                disabled={loading}
                            />
                        </div>

                        {/* Staff Assignment */}
                        <div className="space-y-2">
                            <Label htmlFor="staffId">Assigned To</Label>
                            <Select
                                value={formData.staffId || ""}
                                onValueChange={(value) => handleSelectChange("staffId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff member"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {allStaff.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.name} - {staff.jobRole}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status and Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status || "Pending"}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status"/>
                                    </SelectTrigger>
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
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority || "Medium"}
                                    onValueChange={(value) => handleSelectChange("priority", value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
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

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <DatePicker
                                date={formData.dueDate instanceof Date ? formData.dueDate : undefined}
                                setDate={handleDateChange}
                                placeholder="Select due date"
                            />
                        </div>

                        {/* Task Info */}
                        {taskToEdit.createdAt && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                <p>Created: {new Date(taskToEdit.createdAt).toLocaleDateString()}</p>
                                {taskToEdit.completedAt && (
                                    <p>Completed: {new Date(taskToEdit.completedAt).toLocaleDateString()}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Update the task details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title || ""}
                                onChange={handleInputChange}
                                placeholder="Task title"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange}
                                placeholder="Task description"
                                rows={3}
                                disabled={loading}
                            />
                        </div>

                        {/* Staff Assignment */}
                        <div className="space-y-2">
                            <Label htmlFor="staffId">Assigned To</Label>
                            <Select
                                value={formData.staffId || ""}
                                onValueChange={(value) => handleSelectChange("staffId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff member"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {allStaff.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.name} - {staff.jobRole}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status and Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status || "Pending"}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status"/>
                                    </SelectTrigger>
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
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority || "Medium"}
                                    onValueChange={(value) => handleSelectChange("priority", value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
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

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <DatePicker
                                date={formData.dueDate instanceof Date ? formData.dueDate : undefined}
                                setDate={handleDateChange}
                                placeholder="Select due date"
                            />
                        </div>

                        {/* Task Info */}
                        {taskToEdit.createdAt && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                <p>Created: {new Date(taskToEdit.createdAt).toLocaleDateString()}</p>
                                {taskToEdit.completedAt && (
                                    <p>Completed: {new Date(taskToEdit.completedAt).toLocaleDateString()}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}