import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against a real, built server + seeded PostgreSQL database.
 * Locally: `npm run build && npm run start` (or let the webServer below start it).
 * CI applies migrations & seeds before running `playwright test`.
 */
const PORT = 3000;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
