// lib/api-client.ts

import type {Staff, Task, Note, Grade, Team} from "./types";

// Enhanced error handling
class ApiError extends Error {
    constructor(message: string, public status?: number, public response?: Response) {
        super(message);
        this.name = 'ApiError';
    }
}

// Generic API request handler with better error handling
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
                // If we can't parse error JSON, use the default message
            }

            throw new ApiError(errorMessage, response.status, response);
        }

        // Handle empty responses (like for DELETE operations)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors or other fetch errors
        throw new ApiError(
            error instanceof Error ? error.message : 'An unexpected error occurred'
        );
    }
}

// Staff API functions
export async function getStaff(): Promise<Staff[]> {
    return apiRequest<Staff[]>('/api/staff');
}

export async function getStaffById(id: string): Promise<Staff> {
    return apiRequest<Staff>(`/api/staff/${id}`);
}

export async function addStaff(staff: Omit<Staff, "id" | "createdAt" | "updatedAt">): Promise<Staff> {
    return apiRequest<Staff>('/api/staff', {
        method: 'POST',
        body: JSON.stringify(staff),
    });
}

export async function updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
    return apiRequest<Staff>(`/api/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(staff),
    });
}

export async function deleteStaff(id: string): Promise<boolean> {
    await apiRequest(`/api/staff/${id}`, {
        method: 'DELETE',
    });
    return true;
}

// Task API functions
export async function getTasks(): Promise<Task[]> {
    return apiRequest<Task[]>('/api/tasks');
}

export async function getTaskById(id: string): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`);
}

export async function getTasksByStaffId(staffId: string): Promise<Task[]> {
    return apiRequest<Task[]>(`/api/tasks/staff/${staffId}`);
}

export async function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "staffName">): Promise<Task> {
    return apiRequest<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
    });
}

export async function deleteTask(id: string): Promise<boolean> {
    await apiRequest(`/api/tasks/${id}`, {
        method: 'DELETE',
    });
    return true;
}

// Batch update tasks (useful for Kanban drag & drop)
export async function updateTaskStatus(id: string, status: string): Promise<Task> {
    return updateTask(id, {
        status: status as "Pending" | "In Progress" | "Completed" | "Blocked" | "Cancelled",
        completedAt: status === 'Completed' ? new Date().toISOString() : null
    });
}

// Note API functions
export async function getNotes(): Promise<Note[]> {
    return apiRequest<Note[]>('/api/notes');
}

export async function getNoteById(id: string): Promise<Note> {
    return apiRequest<Note>(`/api/notes/${id}`);
}

export async function getNotesByStaffId(staffId: string): Promise<Note[]> {
    return apiRequest<Note[]>(`/api/notes/staff/${staffId}`);
}

export async function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    return apiRequest<Note>('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note),
    });
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note> {
    return apiRequest<Note>(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note),
    });
}

export async function deleteNote(id: string): Promise<boolean> {
    await apiRequest(`/api/notes/${id}`, {
        method: 'DELETE',
    });
    return true;
}

// Grade API functions
export async function getGrades(): Promise<Grade[]> {
    return apiRequest<Grade[]>('/api/grades');
}

export async function getGradeById(id: string): Promise<Grade> {
    return apiRequest<Grade>(`/api/grades/${id}`);
}

export async function addGrade(grade: Omit<Grade, "id" | "createdAt" | "updatedAt">): Promise<Grade> {
    return apiRequest<Grade>('/api/grades', {
        method: 'POST',
        body: JSON.stringify(grade),
    });
}

export async function updateGrade(id: string, grade: Partial<Grade>): Promise<Grade> {
    return apiRequest<Grade>(`/api/grades/${id}`, {
        method: 'PUT',
        body: JSON.stringify(grade),
    });
}

export async function deleteGrade(id: string): Promise<boolean> {
    await apiRequest(`/api/grades/${id}`, {
        method: 'DELETE',
    });
    return true;
}

// Team API functions
export async function getTeams(): Promise<Team[]> {
    return apiRequest<Team[]>('/api/teams');
}

export async function getTeamById(id: string): Promise<Team> {
    return apiRequest<Team>(`/api/teams/${id}`);
}

export async function addTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    return apiRequest<Team>('/api/teams', {
        method: 'POST',
        body: JSON.stringify(team),
    });
}

export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    return apiRequest<Team>(`/api/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(team),
    });
}

export async function deleteTeam(id: string): Promise<boolean> {
    await apiRequest(`/api/teams/${id}`, {
        method: 'DELETE',
    });
    return true;
}

// Utility functions for dashboard analytics
export async function getStaffWithMetrics(): Promise<(Staff & {
    taskCount: number;
    completedTasks: number;
    noteCount: number;
    completionRate: number
})[]> {
    const [staff, tasks, notes] = await Promise.all([
        getStaff(),
        getTasks(),
        getNotes()
    ]);

    return staff.map(member => {
        const memberTasks = tasks.filter(task => task.staffId === member.id);
        const completedTasks = memberTasks.filter(task => task.status === 'Completed').length;
        const memberNotes = notes.filter(note => note.staffId === member.id);

        return {
            ...member,
            taskCount: memberTasks.length,
            completedTasks,
            noteCount: memberNotes.length,
            completionRate: memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0
        };
    });
}

export async function getDashboardMetrics(): Promise<{
    totalStaff: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalNotes: number;
    topPerformers: Staff[];
    recentActivity: Array<{
        id: string;
        type: 'task' | 'note';
        title: string;
        staffName: string;
        timestamp: string;
    }>;
}> {
    const [staff, tasks, notes] = await Promise.all([
        getStaff(),
        getTasks(),
        getNotes()
    ]);

    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const overdueTasks = tasks.filter(task =>
        task.status !== 'Completed' &&
        task.dueDate &&
        new Date(task.dueDate) < new Date()
    ).length;

    // Calculate top performers
    const staffWithMetrics = await getStaffWithMetrics();
    const topPerformers = staffWithMetrics
        .filter(member => member.taskCount > 0)
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 5);

    // Get recent activity
    const recentActivity = [
        ...tasks.slice(0, 10).map(task => ({
            id: task.id,
            type: 'task' as const,
            title: task.title,
            staffName: staff.find(s => s.id === task.staffId)?.name || 'Unknown',
            timestamp: task.updatedAt || task.createdAt
        })),
        ...notes.slice(0, 10).map(note => ({
            id: note.id,
            type: 'note' as const,
            title: note.title,
            staffName: staff.find(s => s.id === note.staffId)?.name || 'Unknown',
            timestamp: note.updatedAt || note.createdAt
        }))
    ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    return {
        totalStaff: staff.length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalNotes: notes.length,
        topPerformers,
        recentActivity
    };
}

// Export the ApiError class for use in components
export {ApiError};