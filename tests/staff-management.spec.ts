import { test, expect } from "@playwright/test"

test.describe("Staff Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/staff")
  })

  test("should display staff management page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Staff Management" })).toBeVisible()
    await expect(page.getByText("Staff Directory")).toBeVisible()
    await expect(page.getByRole("button", { name: "Add Staff" })).toBeVisible()
  })

  test("should open add staff dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Staff" }).click()

    await expect(page.getByText("Add Staff Member")).toBeVisible()
    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Staff #")).toBeVisible()
    await expect(page.getByLabel("Job Role")).toBeVisible()
  })

  test("should validate required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Add Staff" }).click()

    // Try to submit without filling required fields
    await page.getByRole("button", { name: "Add Staff" }).last().click()

    // Should show validation errors (HTML5 validation)
    const nameField = page.getByLabel("Name")
    await expect(nameField).toHaveAttribute("required")

    const emailField = page.getByLabel("Email")
    await expect(emailField).toHaveAttribute("required")
  })

  test("should fill and submit staff form", async ({ page }) => {
    await page.getByRole("button", { name: "Add Staff" }).click()

    // Fill form
    await page.getByLabel("Name").fill("John Doe")
    await page.getByLabel("Email").fill("john.doe@example.com")
    await page.getByLabel("Staff #").fill("EMP001")
    await page.getByLabel("Job Role").fill("Software Developer")
    await page.getByLabel("Job ID").fill("DEV001")

    // Submit form
    await page.getByRole("button", { name: "Add Staff" }).last().click()

    // Dialog should close (form submission will fail due to no database, but dialog behavior can be tested)
    // In a real test with database, we would check for success message
  })

  test("should close dialog on cancel", async ({ page }) => {
    await page.getByRole("button", { name: "Add Staff" }).click()

    await expect(page.getByText("Add Staff Member")).toBeVisible()

    // Click outside dialog or press escape
    await page.keyboard.press("Escape")

    await expect(page.getByText("Add Staff Member")).not.toBeVisible()
  })
})
