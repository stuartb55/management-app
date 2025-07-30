import {Pool, QueryResult} from "pg";
import {Grade, Note, Staff, Task, Team} from "./types";
import {calculateNextDueDate} from "./utils";

// Configure PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? {rejectUnauthorized: false} : false,
});

// Graceful shutdown
process.on("SIGINT", () => {
    pool.end(() => {
        console.log("Database pool disconnected due to app termination");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    pool.end(() => {
        console.log("Database pool disconnected due to app termination");
        process.exit(0);
    });
});

// Helper function for database queries
export async function query(
    text: string,
    params?: any[],
): Promise<QueryResult> {
    try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("executed query", {text, duration, rows: res.rowCount});
        return res;
    } catch (error) {
        console.error("Database query error:", error);
        throw new Error("Database query failed.");
    }
}

// --- Grade Management ---
export async function getGrades(): Promise<Grade[]> {
    const res = await query("SELECT id, name FROM grades ORDER BY name");
    return res.rows;
}

export async function getGradeById(id: string): Promise<Grade | undefined> {
    const res = await query("SELECT id, name FROM grades WHERE id = $1", [id]);
    return res.rows[0];
}

export async function addGrade(grade: { name: string }): Promise<Grade> {
    const res = await query(
        "INSERT INTO grades(name) VALUES($1) RETURNING id, name, created_at, updated_at",
        [grade.name],
    );
    return res.rows[0];
}

export async function updateGrade(
    id: string,
    grade: { name: string },
): Promise<Grade | undefined> {
    const res = await query(
        "UPDATE grades SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, created_at, updated_at",
        [grade.name, id],
    );
    return res.rows[0];
}

export async function deleteGrade(id: string): Promise<boolean> {
    const res = await query("DELETE FROM grades WHERE id = $1", [id]);
    return res.rowCount > 0;
}

// --- Team Management ---
export async function getTeams(): Promise<Team[]> {
    const res = await query("SELECT id, name FROM teams ORDER BY name");
    return res.rows;
}

export async function addTeam(team: { name: string }): Promise<Team> {
    const res = await query(
        "INSERT INTO teams(name) VALUES($1) RETURNING id, name, created_at, updated_at",
        [team.name],
    );
    return res.rows[0];
}

export async function updateTeam(
    id: string,
    team: { name: string },
): Promise<Team | undefined> {
    const res = await query(
        "UPDATE teams SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, created_at, updated_at",
        [team.name, id],
    );
    return res.rows[0];
}

export async function deleteTeam(id: string): Promise<boolean> {
    const res = await query("DELETE FROM teams WHERE id = $1", [id]);
    return res.rowCount > 0;
}

// --- Staff Management ---
export async function getStaff(): Promise<Staff[]> {
    const res = await query(`
        SELECT s.id,
               s.first_name,
               s.last_name,
               s.email,
               s.grade_id,
               s.team_id,
               s.line_manager_id,
               s.created_at,
               s.updated_at,
               g.name        AS grade_name,
               t.name        AS team_name,
               lm.first_name AS line_manager_first_name,
               lm.last_name  AS line_manager_last_name
        FROM staff s
                 LEFT JOIN grades g ON s.grade_id = g.id
                 LEFT JOIN teams t ON s.team_id = t.id
                 LEFT JOIN staff lm ON s.line_manager_id = lm.id
        ORDER BY s.last_name, s.first_name
    `);
    return res.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        gradeId: row.grade_id,
        teamId: row.team_id,
        lineManagerId: row.line_manager_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        gradeName: row.grade_name,
        teamName: row.team_name,
        lineManagerName: row.line_manager_first_name
            ? `${row.line_manager_first_name} ${row.line_manager_last_name}`
            : undefined,
    }));
}

export async function getStaffById(id: string): Promise<Staff | undefined> {
    const res = await query(
        `
            SELECT s.id,
                   s.first_name,
                   s.last_name,
                   s.email,
                   s.grade_id,
                   s.team_id,
                   s.line_manager_id,
                   s.created_at,
                   s.updated_at,
                   g.name        AS grade_name,
                   t.name        AS team_name,
                   lm.first_name AS line_manager_first_name,
                   lm.last_name  AS line_manager_last_name
            FROM staff s
                     LEFT JOIN grades g ON s.grade_id = g.id
                     LEFT JOIN teams t ON s.team_id = t.id
                     LEFT JOIN staff lm ON s.line_manager_id = lm.id
            WHERE s.id = $1
        `,
        [id],
    );
    const row = res.rows[0];
    if (!row) return undefined;

    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        gradeId: row.grade_id,
        teamId: row.team_id,
        lineManagerId: row.line_manager_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        gradeName: row.grade_name,
        teamName: row.team_name,
        lineManagerName: row.line_manager_first_name
            ? `${row.line_manager_first_name} ${row.line_manager_last_name}`
            : undefined,
    };
}

export async function addStaff(
    staff: Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName">,
): Promise<Staff> {
    const res = await query(
        `INSERT INTO staff(first_name, last_name, email, grade_id, team_id, line_manager_id)
         VALUES ($1, $2, $3, $4, $5,
                 $6) RETURNING id, first_name, last_name, email, grade_id, team_id, line_manager_id, created_at, updated_at`,
        [
            staff.firstName,
            staff.lastName,
            staff.email,
            staff.gradeId,
            staff.teamId,
            staff.lineManagerId,
        ],
    );
    const newStaff = res.rows[0];
    // Re-fetch with join to get gradeName and teamName for consistency
    return (await getStaffById(newStaff.id)) as Staff;
}

export async function updateStaff(
    id: string,
    staff: Partial<
        Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName">
    >,
): Promise<Staff | undefined> {
    const fields = Object.keys(staff)
        .map((key, index) => `${camelToSnakeCase(key)} = $${index + 1}`)
        .join(", ");
    const values = Object.values(staff);

    if (fields.length === 0) return await getStaffById(id); // Nothing to update

    const res = await query(
        `UPDATE staff
         SET ${fields},
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $${
                 values.length + 1
         } RETURNING id`,
        [...values, id],
    );

    if (res.rowCount === 0) return undefined;
    return (await getStaffById(id)) as Staff; // Fetch the updated staff with joined data
}

export async function deleteStaff(id: string): Promise<boolean> {
    const res = await query("DELETE FROM staff WHERE id = $1", [id]);
    return res.rowCount > 0;
}

// --- Task Management ---
export async function getTasks(staffId?: string): Promise<Task[]> {
    const queryText = staffId
        ? `
                SELECT t.id,
                       t.staff_id,
                       t.title,
                       t.description,
                       t.status,
                       t.priority,
                       t.due_date,
                       t.completed,
                       t.completed_at,
                       t.created_at,
                       t.updated_at,
                       t.original_task_id,
                       t.recurring_pattern
                FROM tasks t
                WHERE t.staff_id = $1
                ORDER BY t.created_at DESC
        `
        : `
                SELECT t.id,
                       t.staff_id,
                       t.title,
                       t.description,
                       t.status,
                       t.priority,
                       t.due_date,
                       t.completed,
                       t.completed_at,
                       t.created_at,
                       t.updated_at,
                       t.original_task_id,
                       t.recurring_pattern,
                       s.first_name,
                       s.last_name
                FROM tasks t
                         JOIN staff s ON t.staff_id = s.id
                ORDER BY t.created_at DESC
        `;
    const params = staffId ? [staffId] : [];

    const res = await query(queryText, params);
    return res.rows.map((row) => ({
        id: row.id,
        staffId: row.staff_id,
        staffName: row.first_name ? `${row.first_name} ${row.last_name}` : undefined,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        completed: row.completed,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        originalTaskId: row.original_task_id,
        recurringPattern: row.recurring_pattern
            ? JSON.parse(row.recurring_pattern)
            : undefined,
    }));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
    const res = await query(
        `
            SELECT t.id,
                   t.staff_id,
                   t.title,
                   t.description,
                   t.status,
                   t.priority,
                   t.due_date,
                   t.completed,
                   t.completed_at,
                   t.created_at,
                   t.updated_at,
                   t.original_task_id,
                   t.recurring_pattern,
                   s.first_name,
                   s.last_name
            FROM tasks t
                     JOIN staff s ON t.staff_id = s.id
            WHERE t.id = $1
        `,
        [id],
    );
    const row = res.rows[0];
    if (!row) return undefined;

    return {
        id: row.id,
        staffId: row.staff_id,
        staffName: `${row.first_name} ${row.last_name}`,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        completed: row.completed,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        originalTaskId: row.original_task_id,
        recurringPattern: row.recurring_pattern
            ? JSON.parse(row.recurring_pattern)
            : undefined,
    };
}

export async function addTask(
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "staffName" | "completedAt">,
): Promise<Task> {
    const res = await query(
        `INSERT INTO tasks(staff_id, title, description, status, priority, due_date, completed, original_task_id,
                           recurring_pattern)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                 $9) RETURNING id, staff_id, title, description, status, priority, due_date, completed, completed_at, created_at, updated_at, original_task_id, recurring_pattern`,
        [
            task.staffId,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.dueDate,
            task.completed,
            task.originalTaskId,
            task.recurringPattern ? JSON.stringify(task.recurringPattern) : null,
        ],
    );
    const newTask = res.rows[0];
    return (await getTaskById(newTask.id)) as Task; // Fetch the new task with staffName
}

export async function updateTask(
    id: string,
    task: Partial<
        Omit<Task, "id" | "createdAt" | "updatedAt" | "staffName" | "originalTaskId">
    >,
): Promise<Task | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key in task) {
        if (
            Object.prototype.hasOwnProperty.call(task, key) &&
            key !== "id" &&
            key !== "createdAt" &&
            key !== "updatedAt" &&
            key !== "staffName" &&
            key !== "originalTaskId"
        ) {
            if (key === "recurringPattern") {
                fields.push(`recurring_pattern = $${paramIndex++}`);
                values.push(
                    task[key] ? JSON.stringify(task[key]) : null,
                );
            } else if (key === "dueDate" || key === "completedAt") {
                fields.push(`${camelToSnakeCase(key)} = $${paramIndex++}`);
                values.push(task[key] || null); // Ensure null for undefined dates
            } else {
                fields.push(`${camelToSnakeCase(key)} = $${paramIndex++}`);
                values.push((task as any)[key]);
            }
        }
    }

    if (fields.length === 0) return await getTaskById(id);

    const res = await query(
        `UPDATE tasks
         SET ${fields.join(", ")},
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex} RETURNING id`,
        [...values, id],
    );

    if (res.rowCount === 0) return undefined;
    return (await getTaskById(id)) as Task;
}

export async function deleteTask(id: string): Promise<boolean> {
    const res = await query("DELETE FROM tasks WHERE id = $1", [id]);
    return res.rowCount > 0;
}

export async function createRecurringTaskInstance(
    originalTask: Task,
    newDueDate: Date,
): Promise<Task | undefined> {
    const newTaskData: Omit<
        Task,
        "id" | "createdAt" | "updatedAt" | "staffName" | "completedAt"
    > = {
        staffId: originalTask.staffId,
        title: originalTask.title,
        description: originalTask.description,
        status: "not_started", // New instances start as 'not_started'
        priority: originalTask.priority,
        dueDate: newDueDate,
        completed: false, // New instances are not completed
        originalTaskId: originalTask.id,
        recurringPattern: originalTask.recurringPattern,
    };
    return await addTask(newTaskData);
}

export async function checkAndCreateRecurringTasks(): Promise<void> {
    const res = await query(
        `
            SELECT id, title, staff_id, due_date, recurring_pattern
            FROM tasks
            WHERE recurring_pattern IS NOT NULL
              AND completed = FALSE
              AND (due_date IS NULL OR due_date <= NOW())
        `,
    );

    for (const row of res.rows) {
        const originalTask: Task = {
            id: row.id,
            title: row.title,
            staffId: row.staff_id,
            dueDate: row.due_date,
            recurringPattern: JSON.parse(row.recurring_pattern),
            description: "", // Placeholder, not fetched by this query
            status: "not_started", // Placeholder
            priority: "medium", // Placeholder
            completed: false, // Placeholder
            createdAt: new Date(), // Placeholder
            updatedAt: new Date(), // Placeholder
        };

        const pattern = originalTask.recurringPattern;
        if (!pattern) continue;

        let currentDueDate = originalTask.dueDate || new Date(); // Use current date if no due date
        let createdInstances = 0;

        // Keep creating instances until the next due date is in the future
        // and we haven't exceeded max occurrences (if defined)
        while (
            new Date(currentDueDate) <= new Date() &&
            (pattern.maxOccurrences === undefined ||
                createdInstances < pattern.maxOccurrences)
            ) {
            const nextDueDate = calculateNextDueDate(currentDueDate, pattern);

            if (pattern.endDate && nextDueDate > new Date(pattern.endDate)) {
                break; // Stop if next instance is beyond end date
            }

            // Check if an instance for this exact date already exists to prevent duplicates
            const existingInstanceRes = await query(
                `SELECT id
                 FROM tasks
                 WHERE original_task_id = $1
                   AND due_date = $2`,
                [originalTask.id, nextDueDate],
            );

            if (existingInstanceRes.rowCount === 0) {
                await createRecurringTaskInstance(originalTask, nextDueDate);
                createdInstances++;
            }
            currentDueDate = nextDueDate;
        }
    }
}

// --- Note Management ---
export async function getNotes(staffId?: string): Promise<Note[]> {
    const queryText = staffId
        ? `
                SELECT n.id, n.staff_id, n.content, n.created_at, n.updated_at
                FROM notes n
                WHERE n.staff_id = $1
                ORDER BY n.created_at DESC
        `
        : `
                SELECT n.id,
                       n.staff_id,
                       n.content,
                       n.created_at,
                       n.updated_at,
                       s.first_name,
                       s.last_name
                FROM notes n
                         JOIN staff s ON n.staff_id = s.id
                ORDER BY n.created_at DESC
        `;
    const params = staffId ? [staffId] : [];

    const res = await query(queryText, params);
    return res.rows.map((row) => ({
        id: row.id,
        staffId: row.staff_id,
        staffName: row.first_name ? `${row.first_name} ${row.last_name}` : undefined,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

export async function getNoteById(id: string): Promise<Note | undefined> {
    const res = await query(
        `
            SELECT n.id,
                   n.staff_id,
                   n.content,
                   n.created_at,
                   n.updated_at,
                   s.first_name,
                   s.last_name
            FROM notes n
                     JOIN staff s ON n.staff_id = s.id
            WHERE n.id = $1
        `,
        [id],
    );
    const row = res.rows[0];
    if (!row) return undefined;

    return {
        id: row.id,
        staffId: row.staff_id,
        staffName: `${row.first_name} ${row.last_name}`,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function addNote(
    note: Omit<Note, "id" | "createdAt" | "updatedAt" | "staffName">,
): Promise<Note> {
    const res = await query(
        `INSERT INTO notes(staff_id, content)
         VALUES ($1, $2) RETURNING id, staff_id, content, created_at, updated_at`,
        [note.staffId, note.content],
    );
    const newNote = res.rows[0];
    return (await getNoteById(newNote.id)) as Note;
}

export async function updateNote(
    id: string,
    note: Partial<Omit<Note, "id" | "createdAt" | "updatedAt" | "staffName">>,
): Promise<Note | undefined> {
    const fields = Object.keys(note)
        .map((key, index) => `${camelToSnakeCase(key)} = $${index + 1}`)
        .join(", ");
    const values = Object.values(note);

    if (fields.length === 0) return await getNoteById(id);

    const res = await query(
        `UPDATE notes
         SET ${fields},
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $${
                 values.length + 1
         } RETURNING id`,
        [...values, id],
    );

    if (res.rowCount === 0) return undefined;
    return (await getNoteById(id)) as Note;
}

export async function deleteNote(id: string): Promise<boolean> {
    const res = await query("DELETE FROM notes WHERE id = $1", [id]);
    return res.rowCount > 0;
}

// Helper to convert camelCase to snake_case for database columns
function camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}