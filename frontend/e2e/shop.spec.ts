import { test, expect } from "@playwright/test";

test.describe("Shop flow", () => {
  test("homepage loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("HEXASHOP");
    await expect(page.getByText("Shop Now")).toBeVisible();
  });

  test("shop page shows product grid", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("h1")).toContainText("Shop");
  });

  test("search works with autocomplete", async ({ page }) => {
    await page.goto("/shop");
    await page.click('[aria-label="Search"]');
    await page.fill('input[type="search"]', "hoodie");
    await expect(page.locator('[placeholder*="Search"]')).toHaveValue("hoodie");
  });

  test("cart drawer opens on cart click", async ({ page }) => {
    await page.goto("/");
    await page.click('[aria-label*="Cart"]');
    await expect(page.getByText("Your Cart")).toBeVisible();
  });

  test("404 page renders correctly", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("h2")).toContainText("Page Not Found");
    await expect(page.getByText("Back to Home")).toBeVisible();
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("register page renders form", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByText("Create Account")).toBeVisible();
  });
});
