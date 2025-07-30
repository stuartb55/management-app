import { test, expect } from "@playwright/test"

test.describe("Admin Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin")
  })

  test("should display admin page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible()
    await expect(page.getByText("Grade Management")).toBeVisible()
    await expect(page.getByText("Team Management")).toBeVisible()
  })

  test("should show grade management section", async ({ page }) => {
    await expect(page.getByText("Grades")).toBeVisible()
    await expect(page.getByRole("button", { name: "Add Grade" })).toBeVisible()
  })

  test("should show team management section", async ({ page }) => {
    await expect(page.getByText("Teams")).toBeVisible()
    await expect(page.getByRole("button", { name: "Add Team" })).toBeVisible()
  })

  test("should open add grade dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Grade" }).click()

    await expect(page.getByText("Add New Grade")).toBeVisible()
    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Description")).toBeVisible()
  })

  test("should open add team dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Team" }).click()

    await expect(page.getByText("Add New Team")).toBeVisible()
    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Description")).toBeVisible()
  })
})
