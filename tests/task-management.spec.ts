import { test, expect } from "@playwright/test"

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tasks")
  })

  test("should display task management page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Task Management" })).toBeVisible()
    await expect(page.getByText("Add New Task")).toBeVisible()
    await expect(page.getByText("Existing Tasks")).toBeVisible()
  })

  test("should show task creation form", async ({ page }) => {
    await expect(page.getByLabel("Title")).toBeVisible()
    await expect(page.getByLabel("Description")).toBeVisible()
    await expect(page.getByLabel("Assigned To")).toBeVisible()
    await expect(page.getByLabel("Status")).toBeVisible()
    await expect(page.getByLabel("Priority")).toBeVisible()
    await expect(page.getByLabel("Due Date")).toBeVisible()
  })

  test("should validate task form", async ({ page }) => {
    // Try to submit without required fields
    await page.getByRole("button", { name: "Add Task" }).click()

    // Title should be required
    const titleField = page.getByLabel("Title")
    await expect(titleField).toHaveAttribute("required")
  })

  test("should fill task form", async ({ page }) => {
    await page.getByLabel("Title").fill("Test Task")
    await page.getByLabel("Description").fill("This is a test task description")

    // Select priority
    await page.getByRole("combobox", { name: "Priority" }).click()
    await page.getByText("High").click()

    // Select status
    await page.getByRole("combobox", { name: "Status" }).click()
    await page.getByText("In Progress").click()

    // The form should be filled
    await expect(page.getByLabel("Title")).toHaveValue("Test Task")
    await expect(page.getByLabel("Description")).toHaveValue("This is a test task description")
  })

  test("should show empty state for tasks", async ({ page }) => {
    await expect(page.getByText("No tasks found.")).toBeVisible()
  })
})
