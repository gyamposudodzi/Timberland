import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@timberland.example";
const DEMO_PASSWORD = "demo1234";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(DEMO_EMAIL);
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
  await page.getByRole("main").getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByRole("heading", { name: /your shipments/i })).toBeVisible();
}

test.describe("registered customer shipment flow", () => {
  test("creates a shipment, sees it in the dashboard, and guest-tracking shows only public data", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/account/new-shipment");
    await expect(page.getByRole("heading", { name: /new shipment/i })).toBeVisible();

    // Recipient (sender is pre-filled from a saved address).
    await page.locator("#recipient-contactName").fill("Newton Test");
    await page.locator("#recipient-phone").fill("+1 555 0999");
    await page.locator("#recipient-line1").fill("9 E2e Road");
    await page.locator("#recipient-city").fill("Bend");
    await page.locator("#recipient-postalCode").fill("22301");

    // Parcel contents (weight/pieces default to 1).
    await page.locator("#p-0-desc").fill("E2e test package");

    await page.getByRole("button", { name: /create shipment/i }).click();

    // Redirected to the new shipment's detail page.
    await expect(page).toHaveURL(/\/account\/shipments\/.+/);
    const tracking = page.locator("main").getByText(/^TB[0-9A-Z]{8,}$/).first();
    await expect(tracking).toBeVisible();
    const code = (await tracking.textContent())?.trim() ?? "";
    expect(code).toMatch(/^TB/);

    // It now appears on the dashboard.
    await page.goto("/account");
    await expect(page.getByText(code).first()).toBeVisible();

    // Guest tracking shows the code but masks the recipient's private address.
    await page.goto(`/track/${code}`);
    const body = page.locator("body");
    await expect(body).toContainText(code);
    await expect(body).not.toContainText("9 E2e Road");
    await expect(body).not.toContainText("+1 555 0999");
    await expect(body).not.toContainText("Newton Test");
  });

  test("copies a saved address into the recipient fields via the picker", async ({ page }) => {
    await login(page);
    await page.goto("/account/new-shipment");

    const select = page.locator("#recipient-saved");
    await expect(select).toBeVisible();

    // Option 0 is the placeholder; pick the first real saved address.
    const value = await page.locator("#recipient-saved option").nth(1).getAttribute("value");
    expect(value).toBeTruthy();
    await select.selectOption(value!);

    // The controlled recipient fields are populated from the saved address.
    await expect(page.locator("#recipient-city")).not.toHaveValue("");
    await expect(page.locator("#recipient-contactName")).not.toHaveValue("");
    await expect(page.locator("#recipient-postalCode")).not.toHaveValue("");
  });
});
