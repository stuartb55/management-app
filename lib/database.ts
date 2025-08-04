// lib/database.ts

import {Pool, type QueryResult} from "pg";
import type {Grade, Note, Staff, Task, Team} from "./types";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Generic query helper to execute SQL queries with parameters
async function query(text: string, params?: unknown[]): Promise<QueryResult> {
    const start = Date.now();
    try {
        // The await is necessary here because pool.query returns a Promise.
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("executed query", {text, duration, rows: res.rowCount});
        return res;
    } catch (error) {
        console.error("Database query error:", {text, error});
        throw error;
    }
}

// Utility to convert camelCase to snake_case for dynamic queries
function camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Simple regex to validate UUID format
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// --- Grade Management ---
export async function getGrades(): Promise<Grade[]> {
    const res = await query('SELECT id, name, description, created_at AS "createdAt", updated_at AS "updatedAt" FROM grades ORDER BY name');
    return res.rows;
}

export async function getGradeById(id: string): Promise<Grade | undefined> {
    if (!uuidRegex.test(id)) {
        console.warn(`Invalid UUID format for getGradeById: ${id}`);
        return undefined;
    }
    const res = await query('SELECT id, name, description, created_at AS "createdAt", updated_at AS "updatedAt" FROM grades WHERE id = $1', [id]);
    return res.rows[0];
}

export async function addGrade(grade: Omit<Grade, "id" | "createdAt" | "updatedAt">): Promise<Grade> {
    const res = await query(
        'INSERT INTO grades(name, description) VALUES($1, $2) RETURNING id, name, description, created_at AS "createdAt", updated_at AS "updatedAt"',
        [grade.name, grade.description]
    );
    return res.rows[0];
}

export async function updateGrade(id: string, data: Partial<Omit<Grade, "id" | "createdAt" | "updatedAt">>): Promise<Grade | undefined> {
    const keys = Object.keys(data);
    if (keys.length === 0) return getGradeById(id);

    const setClauses = keys.map((key, i) => `${camelToSnakeCase(key)} = $${i + 1}`);
    const values = Object.values(data);

    const queryText = `UPDATE grades
                       SET ${setClauses.join(", ")}
                       WHERE id = $${keys.length + 1} RETURNING id`;
    const res = await query(queryText, [...values, id]);

    return (res.rowCount ?? 0) > 0 ? getGradeById(id) : undefined;
}

export async function deleteGrade(id: string): Promise<boolean> {
    const res = await query("DELETE FROM grades WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
}

// --- Team Management ---
export async function getTeams(): Promise<Team[]> {
    const res = await query('SELECT id, name, description, created_at AS "createdAt", updated_at AS "updatedAt" FROM teams ORDER BY name');
    return res.rows;
}

export async function getTeamById(id: string): Promise<Team | undefined> {
    if (!uuidRegex.test(id)) {
        console.warn(`Invalid UUID format for getTeamById: ${id}`);
        return undefined;
    }
    const res = await query('SELECT id, name, description, created_at AS "createdAt", updated_at AS "updatedAt" FROM teams WHERE id = $1', [id]);
    return res.rows[0];
}

export async function addTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    const res = await query(
        'INSERT INTO teams(name, description) VALUES($1, $2) RETURNING id, name, description, created_at AS "createdAt", updated_at AS "updatedAt"',
        [team.name, team.description]
    );
    return res.rows[0];
}

export async function updateTeam(id: string, data: Partial<Omit<Team, "id" | "createdAt" | "updatedAt">>): Promise<Team | undefined> {
    const keys = Object.keys(data);
    if (keys.length === 0) return getTeamById(id);

    const setClauses = keys.map((key, i) => `${camelToSnakeCase(key)} = $${i + 1}`);
    const values = Object.values(data);

    const queryText = `UPDATE teams
                       SET ${setClauses.join(", ")}
                       WHERE id = $${keys.length + 1} RETURNING id`;
    const res = await query(queryText, [...values, id]);

    return (res.rowCount ?? 0) > 0 ? getTeamById(id) : undefined;
}

export async function deleteTeam(id: string): Promise<boolean> {
    const res = await query("DELETE FROM teams WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
}

// --- Staff Management ---
export async function getStaff(): Promise<Staff[]> {
    const res = await query(`
        SELECT s.id,
               s.name,
               s.email,
               s.staff_number    AS "staffNumber",
               s.job_role        AS "jobRole",
               s.job_id          AS "jobId",
               s.grade_id        AS "gradeId",
               s.team_id         AS "teamId",
               s.line_manager_id AS "lineManagerId",
               s.created_at      AS "createdAt",
               s.updated_at      AS "updatedAt",
               g.name            AS "gradeName",
               t.name            AS "teamName",
               lm.name           AS "lineManagerName"
        FROM staff s
                 LEFT JOIN grades g ON s.grade_id = g.id
                 LEFT JOIN teams t ON s.team_id = t.id
                 LEFT JOIN staff lm ON s.line_manager_id = lm.id
        ORDER BY s.name
    `);
    return res.rows;
}

export async function getStaffById(id: string): Promise<Staff | undefined> {
    if (!uuidRegex.test(id)) {
        console.warn(`Invalid UUID format for getStaffById: ${id}`);
        return undefined;
    }
    const res = await query(`
        SELECT s.id,
               s.name,
               s.email,
               s.staff_number    AS "staffNumber",
               s.job_role        AS "jobRole",
               s.job_id          AS "jobId",
               s.grade_id        AS "gradeId",
               s.team_id         AS "teamId",
               s.line_manager_id AS "lineManagerId",
               s.created_at      AS "createdAt",
               s.updated_at      AS "updatedAt",
               g.name            AS "gradeName",
               t.name            AS "teamName",
               lm.name           AS "lineManagerName"
        FROM staff s
                 LEFT JOIN grades g ON s.grade_id = g.id
                 LEFT JOIN teams t ON s.team_id = t.id
                 LEFT JOIN staff lm ON s.line_manager_id = lm.id
        WHERE s.id = $1
    `, [id]);
    return res.rows[0];
}

export async function addStaff(staff: Omit<Staff, "id" | "createdAt" | "updatedAt">): Promise<Staff> {
    const {
        name,
        email,
        staffNumber,
        jobRole,
        jobId,
        gradeId,
        teamId,
        lineManagerId,
    } = staff;

    const res = await query(
        `INSERT INTO staff(name, email, staff_number, job_role, job_id, grade_id, team_id, line_manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [name, email, staffNumber, jobRole, jobId, gradeId, teamId, lineManagerId]
    );
    const newStaff = await getStaffById(res.rows[0].id);
    if (!newStaff) throw new Error("Failed to retrieve new staff member after creation.");
    return newStaff;
}

export async function updateStaff(id: string, data: Partial<Omit<Staff, "id" | "createdAt" | "updatedAt">>): Promise<Staff | undefined> {
    const validColumns = [
        'name',
        'email',
        'staffNumber',
        'jobRole',
        'jobId',
        'gradeId',
        'teamId',
        'lineManagerId',
    ];

    const keys = Object.keys(data).filter(key => validColumns.includes(key));

    if (keys.length === 0) {
        return getStaffById(id);
    }

    const setClauses = keys.map((key, i) => `${camelToSnakeCase(key)} = $${i + 1}`);
    const values = keys.map(key => data[key as keyof typeof data]);

    const queryText = `UPDATE staff
                       SET ${setClauses.join(", ")}
                       WHERE id = $${keys.length + 1} RETURNING id`;

    const res = await query(queryText, [...values, id]);

    return (res.rowCount ?? 0) > 0 ? getStaffById(id) : undefined;
}


export async function deleteStaff(id: string): Promise<boolean> {
    const res = await query("DELETE FROM staff WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
}

// --- Task Management ---
export async function getTasks(staffId?: string): Promise<Task[]> {
    let queryText = `
        SELECT t.id,
               t.title,
               t.description,
               t.status,
               t.priority,
               t.staff_id          AS "staffId",
               t.due_date          AS "dueDate",
               t.completed_at      AS "completedAt",
               t.recurring_pattern AS "recurringPattern",
               t.next_due_date     AS "nextDueDate",
               t.original_task_id  AS "originalTaskId",
               t.created_at        AS "createdAt",
               t.updated_at        AS "updatedAt",
               s.name              AS "staffName"
        FROM tasks t
                 LEFT JOIN staff s ON t.staff_id = s.id
    `;
    const params: string[] = [];

    if (staffId) {
        queryText += ' WHERE t.staff_id = $1';
        params.push(staffId);
    }

    queryText += ' ORDER BY t.created_at DESC';

    const res = await query(queryText, params);
    return res.rows;
}

export async function getTaskById(id: string): Promise<Task | undefined> {
    if (!uuidRegex.test(id)) {
        console.warn(`Invalid UUID format for getTaskById: ${id}`);
        return undefined;
    }
    const res = await query(`
        SELECT t.id,
               t.title,
               t.description,
               t.status,
               t.priority,
               t.staff_id          AS "staffId",
               t.due_date          AS "dueDate",
               t.completed_at      AS "completedAt",
               t.recurring_pattern AS "recurringPattern",
               t.next_due_date     AS "nextDueDate",
               t.original_task_id  AS "originalTaskId",
               t.created_at        AS "createdAt",
               t.updated_at        AS "updatedAt",
               s.name              as "staffName"
        FROM tasks t
                 LEFT JOIN staff s ON t.staff_id = s.id
        WHERE t.id = $1
    `, [id]);
    return res.rows[0];
}

export async function getTasksByStaffId(staffId: string): Promise<Task[]> {
    return getTasks(staffId);
}

export async function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "staffName">): Promise<Task> {
    const res = await query(
        `INSERT INTO tasks(title, description, status, priority, due_date, completed_at, recurring_pattern,
                           next_due_date, original_task_id, staff_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [task.title, task.description, task.status, task.priority, task.dueDate, task.completedAt, task.recurringPattern, task.nextDueDate, task.originalTaskId, task.staffId]
    );
    const newTask = await getTaskById(res.rows[0].id);
    if (!newTask) throw new Error("Failed to retrieve new task after creation.");
    return newTask;
}

export async function updateTask(id: string, data: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "staffName">>): Promise<Task | undefined> {
    const keys = Object.keys(data);
    if (keys.length === 0) return getTaskById(id);

    const setClauses = keys.map((key, i) => `${camelToSnakeCase(key)} = $${i + 1}`);

    const values = keys.map(key => {
        const typedKey = key as keyof typeof data;
        const value = data[typedKey];

        if (typedKey === 'recurringPattern' && typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return value;
    });

    const queryText = `UPDATE tasks
                       SET ${setClauses.join(", ")}
                       WHERE id = $${keys.length + 1} RETURNING id`;
    const res = await query(queryText, [...values, id]);

    return (res.rowCount ?? 0) > 0 ? getTaskById(id) : undefined;
}

export async function deleteTask(id: string): Promise<boolean> {
    const res = await query("DELETE FROM tasks WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
}

// --- Note Management ---
export async function getNotes(staffId?: string): Promise<Note[]> {
    let queryText = `
        SELECT id, title, content, staff_id AS "staffId", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM notes
    `;
    const params: string[] = [];

    if (staffId) {
        queryText += ' WHERE staff_id = $1';
        params.push(staffId);
    }

    queryText += ' ORDER BY created_at DESC';

    const res = await query(queryText, params);
    return res.rows;
}

export async function getNotesByStaffId(staffId: string): Promise<Note[]> {
    return getNotes(staffId);
}

export async function getNoteById(id: string): Promise<Note | undefined> {
    if (!uuidRegex.test(id)) {
        console.warn(`Invalid UUID format for getNoteById: ${id}`);
        return undefined;
    }
    const res = await query(`
        SELECT id, title, content, staff_id AS "staffId", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM notes
        WHERE id = $1
    `, [id]);
    return res.rows[0];
}

export async function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    const res = await query(
        `INSERT INTO notes(staff_id, title, content)
         VALUES ($1, $2, $3)
         RETURNING id, title, content, staff_id AS "staffId", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [note.staffId, note.title, note.content]
    );
    return res.rows[0];
}

export async function updateNote(id: string, data: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>): Promise<Note | undefined> {
    const keys = Object.keys(data);
    if (keys.length === 0) return getNoteById(id);

    const setClauses = keys.map((key, i) => `${camelToSnakeCase(key)} = $${i + 1}`);
    const values = Object.values(data);

    const queryText = `UPDATE notes
                       SET ${setClauses.join(", ")}
                       WHERE id = $${keys.length + 1} RETURNING id`;
    const res = await query(queryText, [...values, id]);

    return (res.rowCount ?? 0) > 0 ? getNoteById(id) : undefined;
}

export async function deleteNote(id: string): Promise<boolean> {
    const res = await query("DELETE FROM notes WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
}
