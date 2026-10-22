import { test, expect, type Page } from "@playwright/test";
import {
  closePrisma,
  createScratchShipment,
  createScratchUser,
  getUserRole,
  shipmentExists,
} from "./helpers";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  const submit = page.getByRole("main").getByRole("button", { name: /sign in/i });
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await submit.click();
  try {
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 8000 });
  } catch {
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await submit.click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 10000 });
  }
}

/** Clicks a control and waits for a success signal, retrying once (pre-hydration no-op guard). */
async function clickUntil(page: Page, button: RegExp, success: RegExp) {
  const trigger = page.getByRole("button", { name: button });
  const ok = page.getByText(success).first();
  await trigger.click();
  try {
    await ok.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    await trigger.click();
    await ok.waitFor({ state: "visible", timeout: 10000 });
  }
}

test.afterAll(async () => {
  await closePrisma();
});

test.describe("admin (full control)", () => {
  test("STAFF cannot open the admin console", async ({ page }) => {
    await login(page, "ops@timberland.example", "ops1234");
    await page.goto("/ops/admin");
    // Page-level gate bounces non-admins back to the shipment queue.
    await expect(page).toHaveURL(/\/ops$/);
    await expect(page.getByRole("heading", { name: /admin console/i })).toHaveCount(0);
  });

  test("admin changes a user's role from the console", async ({ page }) => {
    const email = `e2e-role-${Date.now()}@timberland.example`;
    await createScratchUser(email);

    await login(page, "admin@timberland.example", "admin1234");
    await page.goto("/ops/admin");
    await expect(page.getByRole("heading", { name: /admin console/i })).toBeVisible();

    const row = page.getByTestId("user-row").filter({ hasText: email });
    await expect(row).toBeVisible();
    await row.locator("select").selectOption("STAFF");

    // Save is per-row, so scope the click + "Saved" signal to this row.
    const save = row.getByRole("button", { name: /save/i });
    await save.click();
    try {
      await expect(row.getByText(/saved/i)).toBeVisible({ timeout: 5000 });
    } catch {
      await save.click();
      await expect(row.getByText(/saved/i)).toBeVisible({ timeout: 10000 });
    }

    expect(await getUserRole(email)).toBe("STAFF");
  });

  test("the admin's own row cannot be demoted (lockout guard)", async ({ page }) => {
    await login(page, "admin@timberland.example", "admin1234");
    await page.goto("/ops/admin");
    const selfRow = page.getByTestId("user-row").filter({ hasText: "admin@timberland.example" });
    await expect(selfRow.getByText(/that’s you/i)).toBeVisible();
    await expect(selfRow.locator("select")).toBeDisabled();
  });

  test("admin forces an illegal status override that staff could not make", async ({ page }) => {
    const { id } = await createScratchShipment();

    await login(page, "admin@timberland.example", "admin1234");
    await page.goto(`/ops/shipments/${id}`);

    // CREATED → DELIVERED is not a legal state-machine transition.
    await page.getByLabel(/force status/i).selectOption("DELIVERED");
    await clickUntil(page, /override status/i, /status overridden/i);

    await expect(page.getByText(/delivered/i).first()).toBeVisible();
  });

  test("admin can permanently delete a shipment", async ({ page }) => {
    const { id } = await createScratchShipment();

    await login(page, "admin@timberland.example", "admin1234");
    await page.goto(`/ops/shipments/${id}`);

    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /delete shipment/i }).click();
    await expect(page).toHaveURL(/\/ops$/, { timeout: 15000 });

    expect(await shipmentExists(id)).toBe(false);
  });
});
