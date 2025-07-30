export type RecurringFrequency = "daily" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "yearly"

export interface RecurringPattern {
  frequency: RecurringFrequency
  interval: number
  startDate: Date
  endDate?: Date
  maxOccurrences?: number
  currentOccurrence: number
}

export interface Grade {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Staff {
  id: string
  name: string
  email: string
  staffNumber: string
  jobRole: string
  jobId?: string
  gradeId?: string
  gradeName?: string
  teamId?: string
  teamName?: string
  lineManagerId?: string
  lineManagerName?: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "Pending" | "In Progress" | "Completed" | "Blocked"
  priority: "Low" | "Medium" | "High" | "Urgent"
  dueDate?: Date
  completed: boolean
  completedAt?: Date
  recurringPattern?: RecurringPattern
  nextDueDate?: Date
  originalTaskId?: string
  staffId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  staffId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}
