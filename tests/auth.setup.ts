import { test, expect } from "@playwright/test";

test("authenticate", async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is missing. Check BASE_URL in .env");

  // Always build under baseURL folder
  const normalizedBase = baseURL.endsWith("/") ? baseURL : baseURL + "/";
  const authUrl = new URL("auth.html#/", normalizedBase).toString();

  console.log("TEST baseURL =", baseURL);
  console.log("AUTH URL =", authUrl);

  const resp = await page.goto(authUrl, { waitUntil: "domcontentloaded" });

  // Server-level failure
  expect(resp?.status(), `Login page HTTP status was ${resp?.status()}`).toBeLessThan(400);

  // SPA-level failure (your real 404 screen)
  await expect(page.locator("text=/404\\s*\\|\\s*NOT FOUND/i")).toHaveCount(0, { timeout: 10_000 });
  await expect(page.locator("h1", { hasText: "Forbidden" })).toHaveCount(0, { timeout: 10_000 });

  // Wait for login form field
  const username = page.getByTestId("LoginView.username-text-field");
  await expect(username).toBeVisible({ timeout: 60_000 });

  await username.fill(process.env.DA_USERNAME ?? "");
  await page.getByTestId("PasswordTextField.password-text-field").fill(process.env.DA_PASSWORD ?? "");

  await Promise.all([
    page.waitForURL(/#\/.*/, { timeout: 60_000 }),
    page.getByTestId("LoginView.login-button").click(),
  ]);

  // Prove we are logged in
  await expect(page.getByTestId("NavItems.CurrentUser.Name")).toContainText(
    "Laconics-Admin",
    { timeout: 60_000 }
  );

  await page.context().storageState({ path: "playwright/.auth/state.json" });
});
