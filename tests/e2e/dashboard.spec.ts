import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "demo@timberland.example";
const DEMO_PASSWORD = "demo1234";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(DEMO_EMAIL);
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
  await page.getByRole("main").getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByRole("heading", { name: /your shipments/i })).toBeVisible();
}

test.describe("customer dashboard", () => {
  test("status chips filter the shipment list", async ({ page }) => {
    await login(page);

    // Click the "Delivered" KPI card (navigates to /account/shipments?status=DELIVERED).
    await page.getByRole("link", { name: /delivered/i }).first().click();
    await expect(page).toHaveURL(/\/account\/shipments\?status=DELIVERED/);

    // Table rows show only delivered shipments.
    const rows = page.locator("main table tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByText(/delivered/i)).toBeVisible();
  });

  test("search narrows the list to a matching tracking number", async ({ page }) => {
    await login(page);

    // Grab a known tracking number straight from the overview table.
    const code = (await page.locator("main table tbody tr").first().getByText(/^TB[0-9A-Z]{8,}$/).first().textContent())?.trim() ?? "";
    expect(code).toMatch(/^TB/);

    await page.goto("/account/shipments");
    await page.getByLabel(/search tracking number/i).fill(code);
    await page.getByRole("main").getByRole("button", { name: /^search$/i }).click();

    await expect(page).toHaveURL(new RegExp(`q=${code}`));
    await expect(page.locator("main table tbody tr")).toHaveCount(1);
    await expect(page.getByText(code).first()).toBeVisible();
  });
});
