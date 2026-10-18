import { test, expect } from "@playwright/test";
import { findDeliveredShipment, closePrisma } from "./helpers";

test.afterAll(async () => {
  await closePrisma();
});

test.describe("guest tracking", () => {
  test("shows public status + timeline for a valid code and masks PII", async ({ page }) => {
    const seed = await findDeliveredShipment();

    await page.goto(`/track/${seed.trackingNumber}`);
    await expect(page).toHaveURL(new RegExp(`/track/${seed.trackingNumber}$`));

    // Public info is shown.
    await expect(page.getByText(/delivered/i).first()).toBeVisible();
    if (seed.recipientCity) {
      await expect(page.getByText(new RegExp(seed.recipientCity, "i")).first()).toBeVisible();
    }

    // Private info must NOT leak to guests.
    const body = page.locator("body");
    await expect(body).not.toContainText(seed.recipientStreet);
    if (seed.recipientPhone) await expect(body).not.toContainText(seed.recipientPhone);
    await expect(body).not.toContainText(seed.recipientName);
  });

  test("looked-up unknown code shows a friendly not-found state", async ({ page }) => {
    await page.goto("/track/TB000000000");
    await expect(page.getByText(/not found|couldn.?t find|no shipment|double.?check/i).first()).toBeVisible();
  });

  test("home tracking bar navigates to a tracked shipment", async ({ page }) => {
    const seed = await findDeliveredShipment();
    await page.goto("/");
    const input = page.getByLabel("Tracking number").first();
    await input.fill(seed.trackingNumber);
    await page.getByRole("button", { name: /^track$/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`/track/${seed.trackingNumber}$`));
  });
});
