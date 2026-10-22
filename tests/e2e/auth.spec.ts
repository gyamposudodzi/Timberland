import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "demo@timberland.example";
const DEMO_PASSWORD = "demo1234";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("main").getByRole("button", { name: /sign in/i }).click();
}

test.describe("authentication", () => {
  test("rejects invalid credentials with a clear error", async ({ page }) => {
    await loginAs(page, DEMO_EMAIL, "wrong-password-123");
    await expect(page.getByText(/unable to sign in|invalid|incorrect/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("guards /account for guests and logs a demo user in", async ({ page }) => {
    // Unauthenticated access to the dashboard redirects to login.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);

    await loginAs(page, DEMO_EMAIL, DEMO_PASSWORD);
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole("heading", { name: /your shipments/i })).toBeVisible();
  });

  test("signed-in user can log out", async ({ page }) => {
    await loginAs(page, DEMO_EMAIL, DEMO_PASSWORD);
    await expect(page.getByRole("heading", { name: /your shipments/i })).toBeVisible();
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/(login|$)/);
  });
});
