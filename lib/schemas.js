// lib/schemas.ts
import {z} from "zod";


// Grade Schema
export const GradeSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Grade name is required"),
    description: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

// Team Schema
export const TeamSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Team name is required"),
    description: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

// Staff Schema with proper lineManagerId handling
export const StaffSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    staffNumber: z.string().min(1, "Staff number is required"),
    jobRole: z.string().min(1, "Job role is required"),
    jobId: z.string().nullable().optional(),
    gradeId: z.string().uuid("Valid grade ID is required"),
    teamId: z.string().uuid("Valid team ID is required"),
    // lineManagerId can be null, undefined, or a valid UUID
    lineManagerId: z.string().uuid().nullable().optional(),
    // These fields are computed/read-only, so they should be optional for updates
    gradeName: z.string().optional(),
    teamName: z.string().optional(),
    lineManagerName: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

// Create a separate schema for updates that excludes computed fields
export const StaffUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Valid email is required").optional(),
    staffNumber: z.string().min(1, "Staff number is required").optional(),
    jobRole: z.string().min(1, "Job role is required").optional(),
    jobId: z.string().nullable().optional(),
    gradeId: z.string().uuid("Valid grade ID is required").optional(),
    teamId: z.string().uuid("Valid team ID is required").optional(),
    lineManagerId: z.string().uuid().nullable().optional(),
});

// Task Schema
export const TaskSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    status: z.enum(["Pending", "In Progress", "Completed", "Blocked", "Cancelled"]).default("Pending"),
    priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
    staffId: z.string().uuid("Valid staff ID is required"),
    dueDate: z.string().nullable().optional(),
    completedAt: z.string().nullable().optional(),
    recurringPattern: z.any().optional(), // JSON field
    nextDueDate: z.string().nullable().optional(),
    originalTaskId: z.string().uuid().nullable().optional(),
    staffName: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

// Note Schema
export const NoteSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Note title is required"),
    content: z.string().min(1, "Note content is required"),
    staffId: z.string().uuid("Valid staff ID is required"),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});