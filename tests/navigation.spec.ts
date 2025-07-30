import { test, expect } from "@playwright/test"

test.describe("Navigation", () => {
  test("should toggle theme", async ({ page }) => {
    await page.goto("/")

    // Check initial theme (should be light by default)
    const html = page.locator("html")
    await expect(html).not.toHaveClass(/dark/)

    // Click theme toggle
    await page.getByRole("button", { name: "Toggle theme" }).click()

    // Should now be dark theme
    await expect(html).toHaveClass(/dark/)
  })

  test("should work on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Mobile menu button should be visible
    await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible()

    // Desktop navigation should be hidden
    await expect(page.getByRole("link", { name: "Dashboard" }).first()).not.toBeVisible()

    // Open mobile menu
    await page.getByRole("button", { name: "Toggle menu" }).click()

    // Mobile navigation should be visible
    await expect(page.getByRole("link", { name: "Dashboard" }).last()).toBeVisible()
    await expect(page.getByRole("link", { name: "Staff" }).last()).toBeVisible()
  })

  test("should highlight active page", async ({ page }) => {
    await page.goto("/staff")

    // Staff link should be highlighted (have different styling)
    const staffLink = page.getByRole("link", { name: "Staff" }).first()
    await expect(staffLink).toHaveClass(/bg-primary/)
  })
})
