import { test, expect } from "@playwright/test"

test.describe("Notes Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/notes")
  })

  test("should display notes management page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Notes Management" })).toBeVisible()
    await expect(page.getByText("Add New Note")).toBeVisible()
    await expect(page.getByText("Existing Notes")).toBeVisible()
  })

  test("should show note creation form", async ({ page }) => {
    await expect(page.getByLabel("Title")).toBeVisible()
    await expect(page.getByLabel("Content")).toBeVisible()
    await expect(page.getByLabel("For Staff")).toBeVisible()
  })

  test("should validate note form", async ({ page }) => {
    // Try to submit without required fields
    await page.getByRole("button", { name: "Add Note" }).click()

    // Title should be required
    const titleField = page.getByLabel("Title")
    await expect(titleField).toHaveAttribute("required")
  })

  test("should fill note form", async ({ page }) => {
    await page.getByLabel("Title").fill("Test Note")
    await page.getByLabel("Content").fill("This is a test note content")

    // The form should be filled
    await expect(page.getByLabel("Title")).toHaveValue("Test Note")
    await expect(page.getByLabel("Content")).toHaveValue("This is a test note content")
  })

  test("should show empty state for notes", async ({ page }) => {
    await expect(page.getByText("No notes found.")).toBeVisible()
  })
})
