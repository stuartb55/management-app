import {z} from "zod";

export const GradeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

export const TeamSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

export const StaffSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    staffNumber: z.string().min(1, "Staff number is required"),
    jobRole: z.string().min(1, "Job role is required"),
    jobId: z.string().optional(),
    gradeId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    lineManagerId: z.string().uuid().optional().nullable(),
});

export const TaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    status: z.enum(["Pending", "In Progress", "Completed", "Blocked", "Cancelled"]),
    priority: z.enum(["Low", "Medium", "High", "Urgent"]),
    dueDate: z.string().datetime().optional().nullable(),
    completedAt: z.string().datetime().optional().nullable(),
    recurringPattern: z.any().optional().nullable(),
    nextDueDate: z.string().datetime().optional().nullable(),
    originalTaskId: z.string().uuid().optional().nullable(),
    staffId: z.string().uuid().optional().nullable(),
});

export const NoteSchema = z.object({
    staffId: z.string().uuid("A valid staff ID is required"),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
});