import { test, expect, type Page } from "@playwright/test";
import { findShipmentIdByStatus, closePrisma } from "./helpers";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  const submit = page.getByRole("main").getByRole("button", { name: /sign in/i });
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await submit.click();
  // Leave /login once the session sticks. A first submit can be a no-op if it
  // beats client hydration, so retry once by resubmitting.
  try {
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 8000 });
  } catch {
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await submit.click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 10000 });
  }
}

test.afterAll(async () => {
  await closePrisma();
});

test.describe("back office", () => {
  test("customers are blocked from /ops", async ({ page }) => {
    await login(page, "demo@timberland.example", "demo1234");
    await expect(page.getByRole("heading", { name: /your shipments/i })).toBeVisible();

    await page.goto("/ops");
    // Role gate bounces non-operators back to their dashboard.
    await expect(page).toHaveURL(/\/account$/);
  });

  test("staff see the queue and can advance a shipment", async ({ page }) => {
    const id = await findShipmentIdByStatus("CREATED");

    await login(page, "ops@timberland.example", "ops1234");
    await page.goto("/ops");
    await expect(page.getByRole("heading", { name: /shipment queue/i })).toBeVisible();

    await page.goto(`/ops/shipments/${id}`);
    await expect(page.getByRole("heading", { name: /record an update/i })).toBeVisible();

    // CREATED → CONFIRMED is the first allowed transition.
    await page.getByLabel(/new status/i).selectOption("CONFIRMED");
    await page.getByLabel(/location/i).fill("Portland Depot, US");
    await page.getByRole("button", { name: /record update/i }).click();

    // Detail reflects the new status (heading shows the current status label).
    await expect(page.locator("h1 + p, main p").filter({ hasText: /confirmed/i }).first()).toBeVisible();

    // The public tracking page picks up the new (public) event.
    const tracking = page.locator("main").getByText(/^TB[0-9A-Z]{8,}$/).first();
    const code = (await tracking.textContent())?.trim() ?? "";
    await page.goto(`/track/${code}`);
    await expect(page.getByText(/confirmed/i).first()).toBeVisible();
  });
});
