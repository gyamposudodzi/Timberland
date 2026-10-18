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

async function fillAddress(page: Page, data: Record<string, string>) {
  // Keys match the input ids (contactName, phone, line1, city, region, postalCode, country).
  for (const [id, value] of Object.entries(data)) {
    await page.locator(`#${id}`).fill(value);
  }
}

/** Click a server-action submit and wait for a success signal (retry once for a pre-hydration no-op). */
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

const BASE = {
  contactName: "E2e Addr",
  phone: "+1 555 0777",
  line1: "77 Test St",
  city: "Springfield",
  region: "IL",
  postalCode: "62704",
  country: "US",
};

/** Open the "New address" form, retrying in case the first click beats hydration. */
async function openNewForm(page: Page) {
  const addBtn = page.getByRole("button", { name: /add address/i });
  await addBtn.click();
  try {
    await expect(page.getByRole("heading", { name: /new address/i })).toBeVisible({ timeout: 3000 });
  } catch {
    await addBtn.click();
    await expect(page.getByRole("heading", { name: /new address/i })).toBeVisible();
  }
}

test.describe("address book CRUD", () => {
  test("creates, edits, and deletes a saved address", async ({ page }) => {
    await login(page);
    await page.goto("/account/addresses");
    await expect(page.getByRole("heading", { name: /saved addresses/i })).toBeVisible();

    // CREATE.
    await openNewForm(page);
    await fillAddress(page, BASE);
    await submitUntil(page, /add address/i, /E2e Addr/i, () => fillAddress(page, BASE));

    const card = page.getByTestId("address-card").filter({ hasText: "E2e Addr" });
    await expect(card).toBeVisible();

    // EDIT — change the city and save.
    await card.getByRole("button", { name: /edit/i }).click();
    await expect(page.getByRole("heading", { name: /edit address/i })).toBeVisible();
    await page.getByLabel(/city/i).fill("Shelbyville");
    await submitUntil(page, /save changes/i, /shelbyville/i, () =>
      page.getByLabel(/city/i).fill("Shelbyville"),
    );

    const edited = page.getByTestId("address-card").filter({ hasText: "Shelbyville" });
    await expect(edited).toBeVisible();

    // DELETE — the card disappears after refresh.
    await edited.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByTestId("address-card").filter({ hasText: "E2e Addr" })).toHaveCount(0);
  });

  test("rejects an invalid address with field errors", async ({ page }) => {
    await login(page);
    await page.goto("/account/addresses");

    await openNewForm(page);
    // All required fields filled, but the phone fails the schema → server-side
    // field errors + the generic alert. (Empty required inputs would be blocked
    // by native browser validation before the action runs.)
    await fillAddress(page, {
      contactName: "Only Name",
      phone: "bad-phone",
      line1: "1 Road",
      city: "Town",
      postalCode: "12345",
      country: "US",
    });
    await page.getByRole("button", { name: /add address/i }).click();
    await expect(page.getByText(/please fix the highlighted fields/i)).toBeVisible();
    await expect(page.getByText(/enter a valid phone number/i)).toBeVisible();
  });
});
