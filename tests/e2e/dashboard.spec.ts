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

    // Click the "Delivered" filter (chip or summary card — both go to ?status=DELIVERED).
    await page.getByRole("link", { name: /delivered/i }).first().click();
    await expect(page).toHaveURL(/status=DELIVERED/);
    await expect(page.getByText(/filtered by delivered/i)).toBeVisible();

    // Exactly one list row remains, and it is a delivered shipment.
    const rows = page.locator("main ul li");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByText(/delivered/i)).toBeVisible();
  });

  test("search narrows the list to a matching tracking number", async ({ page }) => {
    await login(page);

    // Grab a known tracking number straight from the list.
    const code = (await page.locator("main ul li").first().getByText(/^TB[0-9A-Z]{8,}$/).first().textContent())?.trim() ?? "";
    expect(code).toMatch(/^TB/);

    await page.getByLabel(/search tracking number/i).fill(code);
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(new RegExp(`q=${code}`));
    await expect(page.locator("main ul li")).toHaveCount(1);
    await expect(page.getByText(code).first()).toBeVisible();
  });
});
