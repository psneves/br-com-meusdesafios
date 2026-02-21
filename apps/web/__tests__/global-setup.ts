import { test as setup, expect } from "@playwright/test";

const TEST_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  displayName: "E2E Test User",
  email: "e2e@test.meusdesafios.com",
  avatarUrl: null,
};

setup("authenticate", async ({ page }) => {
  const testLoginKey = process.env.TEST_LOGIN_KEY;
  if (!testLoginKey) {
    throw new Error("TEST_LOGIN_KEY is not configured for e2e setup");
  }

  // Hit the test-login endpoint to create a session
  const response = await page.request.post("/api/auth/test-login", {
    data: {
      ...TEST_USER,
      key: testLoginKey,
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.addInitScript(() => {
    window.localStorage.setItem("meusdesafios-onboarding-done", "1");
  });

  // Navigate to a protected page to verify the session cookie is set
  await page.goto("/today");
  await page.waitForURL(/\/today/);

  // Save the authenticated state
  await page.context().storageState({ path: "__tests__/.auth/user.json" });
});
