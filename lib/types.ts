// lib/types.ts
import {z} from 'zod';
import {GradeSchema, TeamSchema, StaffSchema, TaskSchema, NoteSchema} from './schemas';

export type RecurringFrequency = "daily" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "yearly";
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Blocked" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface RecurringPattern {
    frequency: RecurringFrequency;
    interval: number;
    startDate: string;
    endDate?: string;
    maxOccurrences?: number;
    currentOccurrence: number;
}

// Infer types from Zod schemas
export type Grade = z.infer<typeof GradeSchema> & {
    id: string;
    createdAt: string;
    updatedAt: string;
};

export type Team = z.infer<typeof TeamSchema> & {
    id: string;
    createdAt: string;
    updatedAt: string;
};

export type Staff = z.infer<typeof StaffSchema> & {
    id: string;
    createdAt: string;
    updatedAt: string;
    gradeName?: string;
    teamName?: string;
    lineManagerName?: string;
};

export type Task = z.infer<typeof TaskSchema> & {
    id: string;
    createdAt: string;
    updatedAt: string;
    staffName?: string;
};

export type Note = z.infer<typeof NoteSchema> & {
    id: string;
    createdAt: string;
    updatedAt: string;
};
