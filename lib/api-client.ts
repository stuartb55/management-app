import type { Staff, Task, Note, Grade, Team } from "./types"

const API_BASE_URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"

async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  console.log(`Fetching: ${url}`)
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`HTTP Error ${response.status}: ${errorText}`)
      throw new Error(`HTTP Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched data from ${url}`)
    return data
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    throw error
  }
}

// --- Grade API Functions ---
export async function getGrades(): Promise<Grade[]> {
  return fetchWithErrorHandling("/api/grades")
}

export async function addGrade(grade: Omit<Grade, "id" | "createdAt" | "updatedAt">): Promise<Grade | null> {
  return fetchWithErrorHandling("/api/grades", {
    method: "POST",
    body: JSON.stringify(grade),
  })
}

export async function updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | null> {
  return fetchWithErrorHandling(`/api/grades/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteGrade(id: string): Promise<boolean> {
  const result = await fetchWithErrorHandling(`/api/grades/${id}`, {
    method: "DELETE",
  })
  return result.success
}

// --- Team API Functions ---
export async function getTeams(): Promise<Team[]> {
  return fetchWithErrorHandling("/api/teams")
}

export async function addTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team | null> {
  return fetchWithErrorHandling("/api/teams", {
    method: "POST",
    body: JSON.stringify(team),
  })
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
  return fetchWithErrorHandling(`/api/teams/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteTeam(id: string): Promise<boolean> {
  const result = await fetchWithErrorHandling(`/api/teams/${id}`, {
    method: "DELETE",
  })
  return result.success
}

// --- Staff API Functions ---
export async function getStaff(): Promise<Staff[]> {
  return fetchWithErrorHandling("/api/staff")
}

export async function getStaffById(id: string): Promise<Staff | null> {
  return fetchWithErrorHandling(`/api/staff/${id}`)
}

export async function addStaff(
  staff: Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName" | "lineManagerName">,
): Promise<Staff | null> {
  return fetchWithErrorHandling("/api/staff", {
    method: "POST",
    body: JSON.stringify(staff),
  })
}

export async function updateStaff(
  id: string,
  updates: Partial<Omit<Staff, "gradeName" | "teamName" | "lineManagerName">>,
): Promise<Staff | null> {
  return fetchWithErrorHandling(`/api/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteStaff(id: string): Promise<boolean> {
  const result = await fetchWithErrorHandling(`/api/staff/${id}`, {
    method: "DELETE",
  })
  return result.success
}

// --- Task API Functions ---
export async function getTasks(): Promise<Task[]> {
  return fetchWithErrorHandling("/api/tasks")
}

export async function getTasksByStaffId(staffId: string): Promise<Task[]> {
  return fetchWithErrorHandling(`/api/tasks/staff/${staffId}`)
}

export async function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">): Promise<Task | null> {
  return fetchWithErrorHandling("/api/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  })
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  return fetchWithErrorHandling(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await fetchWithErrorHandling(`/api/tasks/${id}`, {
    method: "DELETE",
  })
  return result.success
}

// --- Note API Functions ---
export async function getNotes(): Promise<Note[]> {
  return fetchWithErrorHandling("/api/notes")
}

export async function getNotesByStaffId(staffId: string): Promise<Note[]> {
  return fetchWithErrorHandling(`/api/notes/staff/${staffId}`)
}

export async function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note | null> {
  return fetchWithErrorHandling("/api/notes", {
    method: "POST",
    body: JSON.stringify(note),
  })
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  return fetchWithErrorHandling(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await fetchWithErrorHandling(`/api/notes/${id}`, {
    method: "DELETE",
  })
  return result.success
}
