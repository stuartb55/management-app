import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should display the main dashboard", async ({ page }) => {
    await page.goto("/")

    // Check main heading
    await expect(page.getByRole("heading", { name: "Staff Management Dashboard" })).toBeVisible()

    // Check navigation
    await expect(page.getByText("Staff Manager")).toBeVisible()
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Staff" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Tasks" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Notes" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible()

    // Check quick action cards
    await expect(page.getByText("Manage Staff")).toBeVisible()
    await expect(page.getByText("Manage Tasks")).toBeVisible()
    await expect(page.getByText("Manage Notes")).toBeVisible()

    // Check statistics cards
    await expect(page.getByText("Total Staff")).toBeVisible()
    await expect(page.getByText("Pending Tasks")).toBeVisible()
    await expect(page.getByText("Completed Tasks")).toBeVisible()
    await expect(page.getByText("Total Notes")).toBeVisible()
  })

  test("should navigate to staff page", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("link", { name: "Staff" }).click()
    await expect(page).toHaveURL("/staff")
    await expect(page.getByRole("heading", { name: "Staff Management" })).toBeVisible()
  })

  test("should navigate to tasks page", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("link", { name: "Tasks" }).click()
    await expect(page).toHaveURL("/tasks")
    await expect(page.getByRole("heading", { name: "Task Management" })).toBeVisible()
  })

  test("should navigate to notes page", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("link", { name: "Notes" }).click()
    await expect(page).toHaveURL("/notes")
    await expect(page.getByRole("heading", { name: "Notes Management" })).toBeVisible()
  })

  test("should navigate to admin page", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("link", { name: "Admin" }).click()
    await expect(page).toHaveURL("/admin")
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible()
  })
})
