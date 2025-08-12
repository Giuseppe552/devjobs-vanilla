import { test, expect } from "@playwright/test";

test("loads and shows results", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DevJobs" })).toBeVisible();
  const cards = page.locator(".job-card");
  await expect(cards).toHaveCount(6);
});

test("filters by search text", async ({ page }) => {
  await page.goto("/");
  await page.fill("#searchText", "frontend");
  await page.click('button:has-text("Search")');
  const cards = page.locator(".job-card");
  await expect(cards).toHaveCount(2);
});

test("dark mode toggle persists", async ({ page, context }) => {
  await page.goto("/");
  await page.click("#themeToggle");
  await page.reload();
  const pressed = await page.getAttribute("#themeToggle", "aria-pressed");
  expect(pressed).toBe("true");
});
