import { test, expect } from "@playwright/test"

test.describe("Responsive Design", () => {
  const viewports = [
    { name: "Mobile", width: 375, height: 667 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1200, height: 800 },
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`should work on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto("/")

      // Check that main content is visible
      await expect(page.getByRole("heading", { name: "Staff Management Dashboard" })).toBeVisible()

      // Check navigation
      await expect(page.getByText("Staff Manager")).toBeVisible()

      if (width < 768) {
        // Mobile: hamburger menu should be visible
        await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible()
      } else {
        // Desktop/Tablet: full navigation should be visible
        await expect(page.getByRole("link", { name: "Dashboard" }).first()).toBeVisible()
        await expect(page.getByRole("link", { name: "Staff" }).first()).toBeVisible()
      }

      // Check that cards are responsive
      const statsCards = page
        .locator('[data-testid="stats-card"]')
        .or(page.getByText("Total Staff").locator("..").locator(".."))
      if ((await statsCards.count()) > 0) {
        await expect(statsCards.first()).toBeVisible()
      }
    })
  })

  test("should handle mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Open mobile menu
    await page.getByRole("button", { name: "Toggle menu" }).click()

    // Navigate to staff page
    await page.getByRole("link", { name: "Staff" }).last().click()

    await expect(page).toHaveURL("/staff")
    await expect(page.getByRole("heading", { name: "Staff Management" })).toBeVisible()
  })
})
