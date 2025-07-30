import { Pool } from "pg"
import type { Staff, Task, Note, Grade, Team } from "./types"
import { calculateNextDueDate } from "./utils" // Declare the variable before using it

// Create a connection pool with proper SSL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Helper function to execute queries
async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Test database connection
async function testConnection() {
  try {
    const result = await query("SELECT NOW() as current_time")
    console.log("Database connection successful:", result.rows[0].current_time)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Initialize connection test
testConnection()

// --- Grade Functions ---
export async function getGrades(): Promise<Grade[]> {
  try {
    const result = await query("SELECT id, name, description, created_at, updated_at FROM grades ORDER BY name")
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error("Database Error: Failed to fetch grades.", error)
    throw new Error("Failed to fetch grades.")
  }
}

export async function addGrade(grade: Omit<Grade, "id" | "createdAt" | "updatedAt">): Promise<Grade | null> {
  try {
    const result = await query(
      "INSERT INTO grades (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at, updated_at",
      [grade.name, grade.description || null],
    )
    const newGrade = result.rows[0]
    return newGrade
      ? {
          id: newGrade.id,
          name: newGrade.name,
          description: newGrade.description,
          createdAt: new Date(newGrade.created_at),
          updatedAt: new Date(newGrade.updated_at),
        }
      : null
  } catch (error) {
    console.error("Database Error: Failed to add grade.", error)
    throw new Error("Failed to add grade.")
  }
}

export async function updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | null> {
  try {
    const result = await query(
      `UPDATE grades 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, name, description, created_at, updated_at`,
      [updates.name || null, updates.description || null, id],
    )
    const updatedGrade = result.rows[0]
    return updatedGrade
      ? {
          id: updatedGrade.id,
          name: updatedGrade.name,
          description: updatedGrade.description,
          createdAt: new Date(updatedGrade.created_at),
          updatedAt: new Date(updatedGrade.updated_at),
        }
      : null
  } catch (error) {
    console.error(`Database Error: Failed to update grade ID: ${id}.`, error)
    throw new Error(`Failed to update grade ID: ${id}.`)
  }
}

export async function deleteGrade(id: string): Promise<boolean> {
  try {
    const result = await query("DELETE FROM grades WHERE id = $1", [id])
    return result.rowCount > 0
  } catch (error) {
    console.error(`Database Error: Failed to delete grade ID: ${id}.`, error)
    throw new Error(`Failed to delete grade ID: ${id}.`)
  }
}

// --- Team Functions ---
export async function getTeams(): Promise<Team[]> {
  try {
    const result = await query("SELECT id, name, description, created_at, updated_at FROM teams ORDER BY name")
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error("Database Error: Failed to fetch teams.", error)
    throw new Error("Failed to fetch teams.")
  }
}

export async function addTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team | null> {
  try {
    const result = await query(
      "INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at, updated_at",
      [team.name, team.description || null],
    )
    const newTeam = result.rows[0]
    return newTeam
      ? {
          id: newTeam.id,
          name: newTeam.name,
          description: newTeam.description,
          createdAt: new Date(newTeam.created_at),
          updatedAt: new Date(newTeam.updated_at),
        }
      : null
  } catch (error) {
    console.error("Database Error: Failed to add team.", error)
    throw new Error("Failed to add team.")
  }
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
  try {
    const result = await query(
      `UPDATE teams 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, name, description, created_at, updated_at`,
      [updates.name || null, updates.description || null, id],
    )
    const updatedTeam = result.rows[0]
    return updatedTeam
      ? {
          id: updatedTeam.id,
          name: updatedTeam.name,
          description: updatedTeam.description,
          createdAt: new Date(updatedTeam.created_at),
          updatedAt: new Date(updatedTeam.updated_at),
        }
      : null
  } catch (error) {
    console.error(`Database Error: Failed to update team ID: ${id}.`, error)
    throw new Error(`Failed to update team ID: ${id}.`)
  }
}

export async function deleteTeam(id: string): Promise<boolean> {
  try {
    const result = await query("DELETE FROM teams WHERE id = $1", [id])
    return result.rowCount > 0
  } catch (error) {
    console.error(`Database Error: Failed to delete team ID: ${id}.`, error)
    throw new Error(`Failed to delete team ID: ${id}.`)
  }
}

// --- Staff Functions ---
export async function getStaff(): Promise<Staff[]> {
  try {
    const result = await query(`
      SELECT
        s.id, s.name, s.email, s.staff_number, s.job_role, s.job_id,
        s.grade_id, g.name AS grade_name,
        s.team_id, t.name AS team_name,
        s.line_manager_id, lm.name AS line_manager_name,
        s.created_at, s.updated_at
      FROM staff s
      LEFT JOIN grades g ON s.grade_id = g.id
      LEFT JOIN teams t ON s.team_id = t.id
      LEFT JOIN staff lm ON s.line_manager_id = lm.id
      ORDER BY s.name
    `)
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      staffNumber: row.staff_number,
      jobRole: row.job_role,
      jobId: row.job_id,
      gradeId: row.grade_id,
      gradeName: row.grade_name,
      teamId: row.team_id,
      teamName: row.team_name,
      lineManagerId: row.line_manager_id,
      lineManagerName: row.line_manager_name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error("Database Error: Failed to fetch staff.", error)
    throw new Error("Failed to fetch staff.")
  }
}

export async function getStaffById(id: string): Promise<Staff | null> {
  try {
    const result = await query(
      `
      SELECT
        s.id, s.name, s.email, s.staff_number, s.job_role, s.job_id,
        s.grade_id, g.name AS grade_name,
        s.team_id, t.name AS team_name,
        s.line_manager_id, lm.name AS line_manager_name,
        s.created_at, s.updated_at
      FROM staff s
      LEFT JOIN grades g ON s.grade_id = g.id
      LEFT JOIN teams t ON s.team_id = t.id
      LEFT JOIN staff lm ON s.line_manager_id = lm.id
      WHERE s.id = $1
    `,
      [id],
    )

    const staffMember = result.rows[0]
    return staffMember
      ? {
          id: staffMember.id,
          name: staffMember.name,
          email: staffMember.email,
          staffNumber: staffMember.staff_number,
          jobRole: staffMember.job_role,
          jobId: staffMember.job_id,
          gradeId: staffMember.grade_id,
          gradeName: staffMember.grade_name,
          teamId: staffMember.team_id,
          teamName: staffMember.team_name,
          lineManagerId: staffMember.line_manager_id,
          lineManagerName: staffMember.line_manager_name,
          createdAt: new Date(staffMember.created_at),
          updatedAt: new Date(staffMember.updated_at),
        }
      : null
  } catch (error) {
    console.error(`Database Error: Failed to fetch staff member ID: ${id}.`, error)
    throw new Error(`Failed to fetch staff member ID: ${id}.`)
  }
}

export async function addStaff(
  staff: Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName" | "lineManagerName">,
): Promise<Staff | null> {
  try {
    const result = await query(
      `INSERT INTO staff (name, email, staff_number, job_role, job_id, grade_id, team_id, line_manager_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        staff.name,
        staff.email,
        staff.staffNumber,
        staff.jobRole,
        staff.jobId || null,
        staff.gradeId || null,
        staff.teamId || null,
        staff.lineManagerId || null,
      ],
    )
    const newStaff = result.rows[0]
    // Re-fetch with joins to get gradeName, teamName, lineManagerName
    return newStaff ? await getStaffById(newStaff.id) : null
  } catch (error) {
    console.error("Database Error: Failed to add staff.", error)
    throw new Error("Failed to add staff.")
  }
}

export async function updateStaff(
  id: string,
  updates: Partial<Omit<Staff, "gradeName" | "teamName" | "lineManagerName">>,
): Promise<Staff | null> {
  try {
    const result = await query(
      `UPDATE staff
       SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         staff_number = COALESCE($3, staff_number),
         job_role = COALESCE($4, job_role),
         job_id = COALESCE($5, job_id),
         grade_id = COALESCE($6, grade_id),
         team_id = COALESCE($7, team_id),
         line_manager_id = COALESCE($8, line_manager_id),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id`,
      [
        updates.name || null,
        updates.email || null,
        updates.staffNumber || null,
        updates.jobRole || null,
        updates.jobId || null,
        updates.gradeId || null,
        updates.teamId || null,
        updates.lineManagerId || null,
        id,
      ],
    )
    const updatedStaff = result.rows[0]
    // Re-fetch with joins to get gradeName, teamName, lineManagerName
    return updatedStaff ? await getStaffById(updatedStaff.id) : null
  } catch (error) {
    console.error(`Database Error: Failed to update staff ID: ${id}.`, error)
    throw new Error(`Failed to update staff ID: ${id}.`)
  }
}

export async function deleteStaff(id: string): Promise<boolean> {
  try {
    const result = await query("DELETE FROM staff WHERE id = $1", [id])
    return result.rowCount > 0
  } catch (error) {
    console.error(`Database Error: Failed to delete staff ID: ${id}.`, error)
    throw new Error(`Failed to delete staff ID: ${id}.`)
  }
}

// --- Task Functions ---
export async function getTasks(): Promise<Task[]> {
  try {
    const result = await query(`
      SELECT
        id, title, description, status, priority, due_date, completed, completed_at,
        recurring_pattern, next_due_date, original_task_id, staff_id, created_at, updated_at
      FROM tasks
      ORDER BY due_date DESC NULLS LAST
    `)
    return result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as Task["status"],
      priority: row.priority as Task["priority"],
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      completed: row.completed,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      recurringPattern: row.recurring_pattern,
      nextDueDate: row.next_due_date ? new Date(row.next_due_date) : undefined,
      originalTaskId: row.original_task_id,
      staffId: row.staff_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error("Database Error: Failed to fetch tasks.", error)
    throw new Error("Failed to fetch tasks.")
  }
}

export async function getTasksByStaffId(staffId: string): Promise<Task[]> {
  try {
    const result = await query(
      `
      SELECT
        id, title, description, status, priority, due_date, completed, completed_at,
        recurring_pattern, next_due_date, original_task_id, staff_id, created_at, updated_at
      FROM tasks
      WHERE staff_id = $1
      ORDER BY due_date DESC NULLS LAST
    `,
      [staffId],
    )
    return result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as Task["status"],
      priority: row.priority as Task["priority"],
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      completed: row.completed,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      recurringPattern: row.recurring_pattern,
      nextDueDate: row.next_due_date ? new Date(row.next_due_date) : undefined,
      originalTaskId: row.original_task_id,
      staffId: row.staff_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error(`Database Error: Failed to fetch tasks for staff ID: ${staffId}.`, error)
    throw new Error(`Failed to fetch tasks for staff ID: ${staffId}.`)
  }
}

export async function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">): Promise<Task | null> {
  try {
    const result = await query(
      `INSERT INTO tasks (title, description, status, priority, due_date, recurring_pattern, next_due_date, original_task_id, staff_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, description, status, priority, due_date, completed, completed_at, recurring_pattern, next_due_date, original_task_id, staff_id, created_at, updated_at`,
      [
        task.title,
        task.description || null,
        task.status,
        task.priority,
        task.dueDate || null,
        task.recurringPattern ? JSON.stringify(task.recurringPattern) : null,
        task.nextDueDate || null,
        task.originalTaskId || null,
        task.staffId || null,
      ],
    )
    const newTask = result.rows[0]
    return newTask
      ? {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status as Task["status"],
          priority: newTask.priority as Task["priority"],
          dueDate: newTask.due_date ? new Date(newTask.due_date) : undefined,
          completed: newTask.completed,
          completedAt: newTask.completed_at ? new Date(newTask.completed_at) : undefined,
          recurringPattern: newTask.recurring_pattern,
          nextDueDate: newTask.next_due_date ? new Date(newTask.next_due_date) : undefined,
          originalTaskId: newTask.original_task_id,
          staffId: newTask.staff_id,
          createdAt: new Date(newTask.created_at),
          updatedAt: new Date(newTask.updated_at),
        }
      : null
  } catch (error) {
    console.error("Database Error: Failed to add task.", error)
    throw new Error("Failed to add task.")
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    const result = await query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         priority = COALESCE($4, priority),
         due_date = COALESCE($5, due_date),
         completed = COALESCE($6, completed),
         completed_at = CASE WHEN $6 = true THEN COALESCE($7, CURRENT_TIMESTAMP) WHEN $6 = false THEN NULL ELSE completed_at END,
         recurring_pattern = COALESCE($8, recurring_pattern),
         next_due_date = COALESCE($9, next_due_date),
         original_task_id = COALESCE($10, original_task_id),
         staff_id = COALESCE($11, staff_id),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING id, title, description, status, priority, due_date, completed, completed_at, recurring_pattern, next_due_date, original_task_id, staff_id, created_at, updated_at`,
      [
        updates.title || null,
        updates.description || null,
        updates.status || null,
        updates.priority || null,
        updates.dueDate || null,
        updates.completed !== undefined ? updates.completed : null,
        updates.completedAt || null,
        updates.recurringPattern ? JSON.stringify(updates.recurringPattern) : null,
        updates.nextDueDate || null,
        updates.originalTaskId || null,
        updates.staffId || null,
        id,
      ],
    )
    const updatedTask = result.rows[0]
    return updatedTask
      ? {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status as Task["status"],
          priority: updatedTask.priority as Task["priority"],
          dueDate: updatedTask.due_date ? new Date(updatedTask.due_date) : undefined,
          completed: updatedTask.completed,
          completedAt: updatedTask.completed_at ? new Date(updatedTask.completed_at) : undefined,
          recurringPattern: updatedTask.recurring_pattern,
          nextDueDate: updatedTask.next_due_date ? new Date(updatedTask.next_due_date) : undefined,
          originalTaskId: updatedTask.original_task_id,
          staffId: updatedTask.staff_id,
          createdAt: new Date(updatedTask.created_at),
          updatedAt: new Date(updatedTask.updated_at),
        }
      : null
  } catch (error) {
    console.error(`Database Error: Failed to update task ID: ${id}.`, error)
    throw new Error(`Failed to update task ID: ${id}.`)
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const result = await query("DELETE FROM tasks WHERE id = $1", [id])
    return result.rowCount > 0
  } catch (error) {
    console.error(`Database Error: Failed to delete task ID: ${id}.`, error)
    throw new Error(`Failed to delete task ID: ${id}.`)
  }
}

// Recurring task functions

export async function createRecurringTaskInstance(originalTask: Task): Promise<Task | null> {
  console.log(`Attempting to create recurring task instance for original task: ${originalTask.title}`)
  if (!originalTask.recurringPattern || !originalTask.nextDueDate) {
    console.warn("Cannot create recurring task instance: missing recurring info.")
    return null
  }

  const pattern = originalTask.recurringPattern

  // Check if we've reached max occurrences
  if (pattern.maxOccurrences && pattern.currentOccurrence >= pattern.maxOccurrences) {
    console.warn(`Max occurrences reached for recurring task: ${originalTask.title}`)
    return null
  }

  // Check if we've passed the end date
  if (pattern.endDate && originalTask.nextDueDate > pattern.endDate) {
    console.warn(`End date passed for recurring task: ${originalTask.title}`)
    return null
  }

  try {
    // Create new instance
    const newTaskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed"> = {
      title: originalTask.title,
      description: originalTask.description,
      status: "Pending", // New instance starts as pending
      priority: originalTask.priority,
      dueDate: new Date(originalTask.nextDueDate),
      recurringPattern: {
        ...pattern,
        currentOccurrence: pattern.currentOccurrence + 1,
      },
      nextDueDate: undefined, // Will be calculated and updated on the original task
      originalTaskId: originalTask.originalTaskId || originalTask.id,
      staffId: originalTask.staffId,
    }

    const newTask = await addTask(newTaskData)
    if (!newTask) {
      console.error(`Failed to add new recurring task instance for ${originalTask.title}.`)
      return null
    }

    // Calculate next due date for the *original* recurring task
    const nextDue = calculateNextDueDate(originalTask.nextDueDate, pattern)

    // Update original task's next due date and current occurrence
    await updateTask(originalTask.id, {
      nextDueDate: nextDue,
      recurringPattern: {
        ...pattern,
        currentOccurrence: pattern.currentOccurrence + 1,
      },
    })
    console.log(`Successfully created recurring instance for ${originalTask.title}.`)
    return newTask
  } catch (error) {
    console.error(`Error creating recurring task instance for ${originalTask.title}:`, error)
    return null
  }
}

export async function checkAndCreateRecurringTasks(): Promise<Task[]> {
  console.log("Checking for overdue recurring tasks to create new instances.")
  try {
    const tasks = await getTasks()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const newTasks: Task[] = []

    for (const task of tasks) {
      if (task.recurringPattern && task.nextDueDate) {
        const nextDue = new Date(task.nextDueDate)
        nextDue.setHours(0, 0, 0, 0)

        if (nextDue <= today) {
          console.log(`Found overdue recurring task: ${task.title}. Creating new instance.`)
          const newTask = await createRecurringTaskInstance(task)
          if (newTask) {
            newTasks.push(newTask)
          }
        }
      }
    }
    console.log(`Finished checking recurring tasks. Created ${newTasks.length} new instances.`)
    return newTasks
  } catch (error) {
    console.error("Error checking recurring tasks:", error)
    return []
  }
}

// --- Notes Functions ---
export async function getNotes(): Promise<Note[]> {
  try {
    const result = await query(`
      SELECT id, staff_id, title, content, created_at, updated_at
      FROM notes
      ORDER BY created_at DESC
    `)

    return result.rows.map((row: any) => ({
      id: row.id,
      staffId: row.staff_id,
      title: row.title,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error("Database Error: Failed to fetch notes.", error)
    throw new Error("Failed to fetch notes.")
  }
}

export async function getNotesByStaffId(staffId: string): Promise<Note[]> {
  try {
    const result = await query(
      `
      SELECT id, staff_id, title, content, created_at, updated_at
      FROM notes
      WHERE staff_id = $1
      ORDER BY created_at DESC
    `,
      [staffId],
    )
    return result.rows.map((row: any) => ({
      id: row.id,
      staffId: row.staff_id,
      title: row.title,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error(`Database Error: Failed to fetch notes for staff ID: ${staffId}.`, error)
    throw new Error(`Failed to fetch notes for staff ID: ${staffId}.`)
  }
}

export async function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note | null> {
  try {
    const result = await query(
      "INSERT INTO notes (staff_id, title, content) VALUES ($1, $2, $3) RETURNING id, staff_id, title, content, created_at, updated_at",
      [note.staffId, note.title, note.content],
    )

    const newNote = result.rows[0]
    return newNote
      ? {
          id: newNote.id,
          staffId: newNote.staff_id,
          title: newNote.title,
          content: newNote.content,
          createdAt: new Date(newNote.created_at),
          updatedAt: new Date(newNote.updated_at),
        }
      : null
  } catch (error) {
    console.error(`Database Error: Failed to add note for staff ID: ${note.staffId}.`, error)
    throw new Error(`Failed to add note for staff ID: ${note.staffId}.`)
  }
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  try {
    const result = await query(
      `UPDATE notes
       SET
         staff_id = COALESCE($1, staff_id),
         title = COALESCE($2, title),
         content = COALESCE($3, content),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, staff_id, title, content, created_at, updated_at`,
      [updates.staffId || null, updates.title || null, updates.content || null, id],
    )
    const updatedNote = result.rows[0]
    return updatedNote
      ? {
          id: updatedNote.id,
          staffId: updatedNote.staff_id,
          title: updatedNote.title,
          content: updatedNote.content,
          createdAt: new Date(updatedNote.created_at),
          updatedAt: new Date(updatedNote.updated_at),
        }
      : null
  } catch (error) {
    console.error(`Database Error: Failed to update note ID: ${id}.`, error)
    throw new Error(`Failed to update note ID: ${id}.`)
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const result = await query("DELETE FROM notes WHERE id = $1", [id])
    return result.rowCount > 0
  } catch (error) {
    console.error(`Database Error: Failed to delete note ID: ${id}.`, error)
    throw new Error(`Failed to delete note ID: ${id}.`)
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  pool.end()
})

process.on("SIGTERM", () => {
  pool.end()
})
