import { test, expect, type Page } from "@playwright/test";

const RESET_EMAIL = "reset@timberland.example";
const NEW_PASSWORD = "reset5678";

/** Click a server-action submit and wait for a success signal, retrying once (guards a pre-hydration no-op). */
async function submitUntil(page: Page, button: RegExp, success: RegExp, beforeRetry?: () => Promise<void>) {
  const trigger = page.getByRole("button", { name: button });
  const ok = page.getByText(success).first();
  await trigger.click();
  try {
    await ok.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    await beforeRetry?.();
    await trigger.click();
    await ok.waitFor({ state: "visible", timeout: 10000 });
  }
}

test.describe("password reset", () => {
  test("requests a link, sets a new password, logs in, and the token is single-use", async ({ page }) => {
    // 1. Request a reset link.
    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill(RESET_EMAIL);
    await submitUntil(page, /send reset link/i, /reset link is on its way/i, () =>
      page.getByLabel(/email/i).fill(RESET_EMAIL),
    );

    // 2. No SMTP in the test env → the dev link is surfaced; open it.
    const devLink = page.getByRole("link", { name: /reset-password/i });
    await expect(devLink).toBeVisible();
    await devLink.click();
    await expect(page).toHaveURL(/\/reset-password\?token=.+/);
    await expect(page.getByRole("heading", { name: /choose a new password/i })).toBeVisible();

    // 3. Set a new password.
    await page.getByLabel(/new password/i).fill(NEW_PASSWORD);
    await page.getByLabel(/confirm password/i).fill(NEW_PASSWORD);
    await submitUntil(page, /update password/i, /password has been updated/i, async () => {
      await page.getByLabel(/new password/i).fill(NEW_PASSWORD);
      await page.getByLabel(/confirm password/i).fill(NEW_PASSWORD);
    });
    const usedUrl = page.url();

    // 4. Sign in with the new password.
    await page.getByRole("link", { name: /go to sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel(/email/i).fill(RESET_EMAIL);
    await page.getByLabel(/password/i).fill(NEW_PASSWORD);
    await page.getByRole("main").getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /your shipments/i })).toBeVisible();

    // 5. The consumed token no longer works.
    await page.goto(usedUrl);
    await page.getByLabel(/new password/i).fill("anotherpass");
    await page.getByLabel(/confirm password/i).fill("anotherpass");
    await submitUntil(page, /update password/i, /invalid or has expired/i, async () => {
      await page.getByLabel(/new password/i).fill("anotherpass");
      await page.getByLabel(/confirm password/i).fill("anotherpass");
    });
  });

  test("unknown email still returns a generic success (no account enumeration)", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill("nobody@nowhere.example");
    await submitUntil(page, /send reset link/i, /reset link is on its way/i, () =>
      page.getByLabel(/email/i).fill("nobody@nowhere.example"),
    );
    // No dev link should be offered for an address with no account.
    await expect(page.getByRole("link", { name: /reset-password/i })).toHaveCount(0);
  });
});
