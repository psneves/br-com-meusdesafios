import { defineConfig, devices } from "@playwright/test";

const TEST_LOGIN_KEY = process.env.TEST_LOGIN_KEY ?? "playwright-local-test-key";
process.env.TEST_LOGIN_KEY = TEST_LOGIN_KEY;

export default defineConfig({
  testDir: "./__tests__",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./__tests__/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
