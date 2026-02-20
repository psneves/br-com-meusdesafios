import { test as setup, expect } from "@playwright/test";

const TEST_USER = {
  id: "e2e-test-user-00000000-0000-0000-0000-000000000001",
  displayName: "E2E Test User",
  email: "e2e@test.meusdesafios.com",
  avatarUrl: null,
};

setup("authenticate", async ({ page }) => {
  // Hit the test-login endpoint to create a session
  const response = await page.request.post("/api/auth/test-login", {
    data: TEST_USER,
  });
  expect(response.ok()).toBeTruthy();

  // Navigate to a protected page to verify the session cookie is set
  await page.goto("/today");
  await page.waitForURL(/\/today/);

  // Save the authenticated state
  await page.context().storageState({ path: "__tests__/.auth/user.json" });
});
