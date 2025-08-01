// types.ts

export type RecurringFrequency = "daily" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "yearly";
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Blocked" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface RecurringPattern {
    frequency: RecurringFrequency;
    interval: number;
    startDate: string; // Changed to string for API safety
    endDate?: string;
    maxOccurrences?: number;
    currentOccurrence: number;
}

export interface Grade {
    id: string;
    name: string;
    description?: string;
    createdAt: string; // Changed to string
    updatedAt: string; // Changed to string
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    createdAt: string; // Changed to string
    updatedAt: string; // Changed to string
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    staffNumber: string;
    jobRole: string;
    jobId?: string;
    gradeId?: string;
    teamId?: string;
    lineManagerId?: string;
    createdAt: string; // Changed to string
    updatedAt: string; // Changed to string
    // Optional fields from JOINs
    gradeName?: string;
    teamName?: string;
    lineManagerName?: string;
}

export type Task = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    completed: boolean;
    staffId: string | null;
    dueDate: string | null;
    completedAt: string | null;
    recurringPattern: string | null;
    nextDueDate: string | null;
    originalTaskId: string | null;
    createdAt: string;
    updatedAt: string;
    staffName?: string;
};

export interface Note {
    id: string;
    staffId: string;
    title: string;
    content: string;
    createdAt: string; // Changed to string
    updatedAt: string; // Changed to string
}