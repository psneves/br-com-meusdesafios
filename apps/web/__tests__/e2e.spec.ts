import { test, expect, type Page } from "@playwright/test";

// ─── Mock Data ─────────────────────────────────────────────

const MOCK_TODAY = {
  success: true,
  data: {
    date: "quinta-feira, 19 de fevereiro",
    greeting: "Bom dia",
    totalPoints: 45,
    pointsWeek: 120,
    pointsMonth: 350,
    cards: [
      {
        userTrackableId: "ut-water",
        templateCode: "WATER",
        name: "Água",
        icon: "💧",
        category: "WATER",
        goal: { type: "target", target: 2500, unit: "ml" },
        progress: { value: 1500, unit: "ml", met: false, percentage: 60 },
        streak: { current: 3, best: 7 },
        pointsToday: 0,
        quickActions: [
          { id: "water-250", type: "add", label: "+250 ml", amount: 250, unit: "ml" },
          { id: "water-500", type: "add", label: "+500 ml", amount: 500, unit: "ml" },
        ],
      },
      {
        userTrackableId: "ut-diet",
        templateCode: "DIET_CONTROL",
        name: "Dieta",
        icon: "🍽️",
        category: "DIET_CONTROL",
        goal: { type: "target", target: 3, unit: "refeições" },
        progress: { value: 2, unit: "refeições", met: false, percentage: 67 },
        streak: { current: 1, best: 5 },
        pointsToday: 0,
        quickActions: [],
      },
      {
        userTrackableId: "ut-exercise",
        templateCode: "PHYSICAL_EXERCISE",
        name: "Exercício Físico",
        icon: "💪",
        category: "PHYSICAL_EXERCISE",
        goal: { type: "target", target: 60, unit: "min" },
        progress: { value: 0, unit: "min", met: false, percentage: 0 },
        streak: { current: 0, best: 3 },
        pointsToday: 0,
        quickActions: [],
      },
      {
        userTrackableId: "ut-sleep",
        templateCode: "SLEEP",
        name: "Sono",
        icon: "🌙",
        category: "SLEEP",
        goal: { type: "target", target: 420, unit: "min" },
        progress: { value: 420, unit: "min", met: true, percentage: 100 },
        streak: { current: 5, best: 10 },
        pointsToday: 15,
        quickActions: [
          { id: "sleep-7h", type: "add", label: "7:00", amount: 420, unit: "min" },
        ],
      },
    ],
  },
};

const MOCK_LOG_FEEDBACK = {
  success: true,
  data: {
    feedback: {
      goalMet: false,
      pointsEarned: 0,
      message: "Registro salvo",
    },
  },
};

const MOCK_EXPLORE = {
  success: true,
  data: {
    pendingRequests: [],
    suggestedUsers: [
      { id: "u1", displayName: "Ana Silva", handle: "anasilva", avatarUrl: null },
      { id: "u2", displayName: "Carlos Mendes", handle: "carlosm", avatarUrl: null },
    ],
  },
};

const MOCK_SEARCH_RESULTS = {
  success: true,
  data: {
    users: [
      { id: "u3", displayName: "Test Match", handle: "testmatch", avatarUrl: null },
    ],
  },
};

const MOCK_SEARCH_EMPTY = {
  success: true,
  data: { users: [] },
};

const MOCK_LEADERBOARD = {
  success: true,
  data: {
    overall: {
      scope: "following",
      rank: null,
      score: 120,
      cohortSize: 3,
      percentile: null,
      rankStatus: "insufficient_cohort",
    },
    challengeRanks: [
      { category: "WATER", name: "Água", rank: null, score: 40, cohortSize: 3, percentile: null },
      { category: "DIET_CONTROL", name: "Dieta", rank: null, score: 30, cohortSize: 3, percentile: null },
      { category: "PHYSICAL_EXERCISE", name: "Exercício", rank: null, score: 20, cohortSize: 3, percentile: null },
      { category: "SLEEP", name: "Sono", rank: null, score: 30, cohortSize: 3, percentile: null },
    ],
  },
};

const MOCK_SESSION = {
  success: true,
  data: { id: "test-user", displayName: "E2E Test User", avatarUrl: null },
};

// ─── Helpers ───────────────────────────────────────────────

/** Set up all API mocks for a page. Call before navigating. */
async function mockApis(page: Page) {
  await page.route("**/api/trackables/today*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TODAY) })
  );
  await page.route("**/api/trackables/log", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_LOG_FEEDBACK) })
  );
  await page.route("**/api/trackables/goal", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { ok: true } }) })
  );
  await page.route("**/api/social/explore", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_EXPLORE) })
  );
  await page.route("**/api/social/search*", (route) => {
    const url = new URL(route.request().url());
    const q = url.searchParams.get("q") ?? "";
    const body = q.includes("test") ? MOCK_SEARCH_RESULTS : MOCK_SEARCH_EMPTY;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.route("**/api/social/follow-request", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, data: { edgeId: "edge-1" } }) })
  );
  await page.route("**/api/leaderboards/rank*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_LEADERBOARD) })
  );
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_SESSION) })
  );
}

// ─── 1. Auth & Navigation ──────────────────────────────────

test("1 – unauthenticated user is redirected to /login", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/today");
  await expect(page).toHaveURL(/\/login/);
  await context.close();
});

test("2 – login page renders branding and Google button", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/login");
  await expect(page.getByText("Bem-vindo")).toBeVisible();
  await expect(page.getByText("Consistência vira resultado.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Continuar com Google/i })).toBeVisible();
  await context.close();
});

test("3 – bottom tab bar has 4 navigation tabs", async ({ page }) => {
  await page.goto("/today");
  const tabBar = page.getByRole("tablist", { name: "Navegação principal" });
  await expect(tabBar).toBeVisible();
  await expect(tabBar.getByRole("tab")).toHaveCount(4);

  // Verify all tab labels
  await expect(tabBar.getByRole("tab", { name: "Painel" })).toBeVisible();
  await expect(tabBar.getByRole("tab", { name: "Explorar" })).toBeVisible();
  await expect(tabBar.getByRole("tab", { name: "Posição" })).toBeVisible();
  await expect(tabBar.getByRole("tab", { name: "Ajustes" })).toBeVisible();
});

test("4 – clicking tab bar navigates between pages", async ({ page }) => {
  await page.goto("/today");
  await page.getByRole("tab", { name: "Explorar" }).click();
  await expect(page).toHaveURL(/\/explore/);
  await page.getByRole("tab", { name: "Posição" }).click();
  await expect(page).toHaveURL(/\/leaderboard/);
  await page.getByRole("tab", { name: "Ajustes" }).click();
  await expect(page).toHaveURL(/\/profile/);
  await page.getByRole("tab", { name: "Painel" }).click();
  await expect(page).toHaveURL(/\/today/);
});

// ─── 2. Today Page ─────────────────────────────────────────

test("5 – today page loads and shows 4 challenge cards", async ({ page }) => {
  await mockApis(page);
  await page.goto("/today");

  await expect(page.getByText("Água")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Dieta")).toBeVisible();
  await expect(page.getByText("Exercício Físico")).toBeVisible();
  await expect(page.getByText("Sono")).toBeVisible();

  // Verify each card has a register button
  await expect(page.getByRole("button", { name: "Registrar Água" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar Dieta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar Exercício Físico" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar Sono" })).toBeVisible();
});

test("6 – today page shows weekday greeting", async ({ page }) => {
  await mockApis(page);
  await page.goto("/today");

  // The page uses formatWeekday() which calls toLocaleDateString("pt-BR", { weekday: "long" })
  // and capitalizes the first letter. Match the same logic for consistency.
  const wd = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const todayWeekday = wd.charAt(0).toUpperCase() + wd.slice(1);
  await expect(page.getByText(todayWeekday)).toBeVisible({ timeout: 10000 });
});

test("7 – today page shows XP score", async ({ page }) => {
  await mockApis(page);
  await page.goto("/today");

  // Mock data has totalPoints=45, pointsWeek=120
  await expect(page.getByText(/45/).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/XP/).first()).toBeVisible();
});

test("8 – water register button opens modal and logs via API", async ({ page }) => {
  await mockApis(page);
  await page.goto("/today");
  await expect(page.getByText("Água")).toBeVisible({ timeout: 10000 });

  // Click the "+" register button for water (opens WaterLogger modal)
  await page.getByRole("button", { name: "Registrar Água" }).click();

  // Wait for modal to appear and select a quick amount
  await expect(page.getByText("Adicionar rápido")).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: "250ml" }).click();

  // Click the submit button inside the modal
  const requestPromise = page.waitForRequest((req) => req.url().includes("/api/trackables/log"));
  await page.getByRole("button", { name: /Registar 250 ml/i }).click();
  const request = await requestPromise;
  const body = request.postDataJSON();
  expect(body.userTrackableId).toBe("ut-water");
  expect(body.valueNum).toBe(250);
});

test("9 – clicking a challenge card opens its logger modal", async ({ page }) => {
  await mockApis(page);
  await page.goto("/today");
  await expect(page.getByText("Água")).toBeVisible({ timeout: 10000 });

  await page.getByRole("button", { name: "Registrar Água" }).click();

  // Verify WaterLogger modal content appears
  await expect(page.getByText("Adicionar rápido")).toBeVisible({ timeout: 3000 });
  await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
});

// ─── 3. Explore Page ───────────────────────────────────────

test("10 – explore page renders search input and sections", async ({ page }) => {
  await mockApis(page);
  await page.goto("/explore");

  await expect(page.getByPlaceholder("Buscar pessoas...")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Solicitações pendentes")).toBeVisible();
  await expect(page.getByText("Pessoas sugeridas")).toBeVisible();

  // Verify suggested users from mock data are rendered
  await expect(page.getByText("Ana Silva")).toBeVisible();
  await expect(page.getByText("Carlos Mendes")).toBeVisible();
});

test("11 – explore search calls API with debounce", async ({ page }) => {
  await mockApis(page);
  await page.goto("/explore");
  await expect(page.getByPlaceholder("Buscar pessoas...")).toBeVisible({ timeout: 10000 });

  const searchInput = page.getByPlaceholder("Buscar pessoas...");
  const requestPromise = page.waitForRequest((req) => req.url().includes("/api/social/search?q="));
  await searchInput.fill("test");
  const request = await requestPromise;
  expect(request.url()).toContain("q=test");
});

test("12 – explore search shows results header when typing", async ({ page }) => {
  await mockApis(page);
  await page.goto("/explore");
  await expect(page.getByText("Pessoas sugeridas")).toBeVisible({ timeout: 10000 });

  const searchInput = page.getByPlaceholder("Buscar pessoas...");
  await searchInput.fill("test");

  // Verify search results section appears with user info
  await expect(page.getByText("Resultados")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Test Match")).toBeVisible();
  await expect(page.getByText("@testmatch")).toBeVisible();
});

test("13 – clearing search returns to suggested view", async ({ page }) => {
  await mockApis(page);
  await page.goto("/explore");
  await expect(page.getByText("Pessoas sugeridas")).toBeVisible({ timeout: 10000 });

  const searchInput = page.getByPlaceholder("Buscar pessoas...");
  await searchInput.fill("test");
  await expect(page.getByText("Resultados")).toBeVisible({ timeout: 5000 });

  // Clear search and verify original sections return
  await searchInput.fill("");
  await expect(page.getByText("Solicitações pendentes")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Pessoas sugeridas")).toBeVisible();
  // Verify search results section is replaced by suggested users
  await expect(page.getByText("Ana Silva")).toBeVisible();
});

// ─── 4. Leaderboard Page ───────────────────────────────────

test("14 – leaderboard page renders title and controls", async ({ page }) => {
  await mockApis(page);
  await page.goto("/leaderboard");

  await expect(page.getByRole("heading", { name: "Sua Posição" })).toBeVisible({ timeout: 10000 });
  // Period toggles
  await expect(page.getByRole("button", { name: "Semana" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mês" })).toBeVisible();
  // Scope tabs
  await expect(page.getByRole("button", { name: "Seguindo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Seguidores" })).toBeVisible();
  // Per-challenge section with mock data categories
  await expect(page.getByText("Por desafio")).toBeVisible();
});

test("15 – leaderboard period toggle fetches new data", async ({ page }) => {
  await mockApis(page);
  await page.goto("/leaderboard");
  await expect(page.getByRole("heading", { name: "Sua Posição" })).toBeVisible({ timeout: 10000 });

  const requestPromise = page.waitForRequest((req) => req.url().includes("period=month"));
  await page.getByRole("button", { name: "Mês" }).click();
  const request = await requestPromise;
  expect(request.url()).toContain("period=month");
});

test("16 – leaderboard scope toggle fetches new data", async ({ page }) => {
  await mockApis(page);
  await page.goto("/leaderboard");
  await expect(page.getByRole("heading", { name: "Sua Posição" })).toBeVisible({ timeout: 10000 });

  const requestPromise = page.waitForRequest((req) => req.url().includes("scope=followers"));
  await page.getByRole("button", { name: "Seguidores" }).click();
  const request = await requestPromise;
  expect(request.url()).toContain("scope=followers");
});

test("17 – leaderboard shows privacy notice", async ({ page }) => {
  await mockApis(page);
  await page.goto("/leaderboard");

  await expect(
    page.getByText("Seu ranking é privado", { exact: false })
  ).toBeVisible({ timeout: 10000 });
  // Also verify the subtitle explains the ranking scope
  await expect(
    page.getByText("Ranking privado entre conexões", { exact: false })
  ).toBeVisible();
});

// ─── 5. Profile Page ───────────────────────────────────────

test("18 – profile page renders theme toggle and challenge settings", async ({ page }) => {
  await mockApis(page);
  await page.goto("/profile");

  // Appearance section with theme toggle
  await expect(page.getByText("Aparência")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /Claro/ })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("button", { name: /Escuro/ })).toBeVisible();

  // Challenge settings section with all 4 categories
  await expect(page.getByText("Personalizar Desafios")).toBeVisible();
  await expect(page.getByText("Água")).toBeVisible();
  await expect(page.getByText("Dieta")).toBeVisible();
  await expect(page.getByText("Exercício")).toBeVisible();
  await expect(page.getByText("Sono")).toBeVisible();

  // Account section
  await expect(page.getByText("Conta")).toBeVisible();
});

test("19 – profile goal adjustment calls PUT /api/trackables/goal", async ({ page }) => {
  await mockApis(page);
  await page.goto("/profile");
  await expect(page.getByText("Personalizar Desafios")).toBeVisible({ timeout: 10000 });

  // Wait for challenge settings to hydrate from API (shows target values like "ml", "min")
  const section = page.locator("section", { hasText: "Personalizar Desafios" });
  await expect(section.getByText("ml")).toBeVisible({ timeout: 5000 });

  const requestPromise = page.waitForRequest(
    (req) => req.url().includes("/api/trackables/goal") && req.method() === "PUT"
  );

  // Each row has minus(svg) + plus(svg). Toggle switches have no svg children.
  // Row 0 (Água): minus=0, plus=1. Row 1 (Dieta): minus=2, plus=3. etc.
  const buttons = section.locator("button:has(svg)");
  await buttons.nth(1).click(); // Water's plus button

  const request = await requestPromise;
  const body = request.postDataJSON();
  expect(body.category).toBe("WATER");
  expect(body.target).toBeGreaterThan(0);
});

test("20 – profile logout button exists", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByText("Conta")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
