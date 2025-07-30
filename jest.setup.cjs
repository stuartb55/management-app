"use client"

import "@testing-library/jest-dom"
import jest from "jest"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return "/"
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}))

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock database functions
jest.mock("@/lib/database", () => ({
  getStaff: jest.fn(),
  getStaffById: jest.fn(),
  addStaff: jest.fn(),
  updateStaff: jest.fn(),
  deleteStaff: jest.fn(),
  getTasks: jest.fn(),
  getTasksByStaffId: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getNotes: jest.fn(),
  getNotesByStaffId: jest.fn(),
  addNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  getGrades: jest.fn(),
  addGrade: jest.fn(),
  updateGrade: jest.fn(),
  deleteGrade: jest.fn(),
  getTeams: jest.fn(),
  addTeam: jest.fn(),
  updateTeam: jest.fn(),
  deleteTeam: jest.fn(),
  calculateNextDueDate: jest.fn(),
}))

// Mock API client
jest.mock("@/lib/api-client", () => ({
  getStaff: jest.fn(),
  getStaffById: jest.fn(),
  addStaff: jest.fn(),
  updateStaff: jest.fn(),
  deleteStaff: jest.fn(),
  getTasks: jest.fn(),
  getTasksByStaffId: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getNotes: jest.fn(),
  getNotesByStaffId: jest.fn(),
  addNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  getGrades: jest.fn(),
  addGrade: jest.fn(),
  updateGrade: jest.fn(),
  deleteGrade: jest.fn(),
  getTeams: jest.fn(),
  addTeam: jest.fn(),
  updateTeam: jest.fn(),
  deleteTeam: jest.fn(),
}))

// Global fetch mock
global.fetch = jest.fn()

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
