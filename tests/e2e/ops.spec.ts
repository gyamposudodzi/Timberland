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

/**
 * Clicks a server-action submit and waits for a success signal. If a click
 * lands before the action handler is wired up it can be a no-op, so retry once.
 */
async function submitUntil(
  page: Page,
  button: RegExp,
  success: RegExp,
  beforeRetry?: () => Promise<void>,
) {
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

    // The success alert only renders when the server action returned ok:true.
    await submitUntil(
      page,
      /record update/i,
      /update recorded/i,
      async () => {
        await page.getByLabel(/new status/i).selectOption("CONFIRMED");
        await page.getByLabel(/location/i).fill("Portland Depot, US");
      },
    );

    // The public tracking page picks up the new (public) event.
    const tracking = page.locator("main").getByText(/^TB[0-9A-Z]{8,}$/).first();
    const code = (await tracking.textContent())?.trim() ?? "";
    await page.goto(`/track/${code}`);
    await expect(page.getByText(/confirmed/i).first()).toBeVisible();
  });

  test("status filter chips narrow the queue", async ({ page }) => {
    await login(page, "ops@timberland.example", "ops1234");
    await page.goto("/ops");

    // Click the "Active" chip (a link to ?status=ACTIVE).
    await page.getByRole("link", { name: /^active/i }).first().click();
    await expect(page).toHaveURL(/status=ACTIVE/);
    await expect(page.getByText(/filtered by active/i)).toBeVisible();
  });

  test("internal notes are visible to staff but hidden from guests", async ({ page }) => {
    const id = await findShipmentIdByStatus("DELIVERED");
    const marker = `E2E-PRIVATE-${Date.now()}`;

    await login(page, "ops@timberland.example", "ops1234");
    await page.goto(`/ops/shipments/${id}`);

    await page.getByLabel(/internal note/i).fill(marker);
    await submitUntil(page, /add note/i, new RegExp(marker), () =>
      page.getByLabel(/internal note/i).fill(marker),
    );

    // The same note must NOT appear on the public guest tracking page.
    const code = (await page.locator("main").getByText(/^TB[0-9A-Z]{8,}$/).first().textContent())?.trim() ?? "";
    await page.goto(`/track/${code}`);
    await expect(page.locator("body")).not.toContainText(marker);
  });
});
