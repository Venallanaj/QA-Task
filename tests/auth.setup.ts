import { test, expect } from "@playwright/test";

test("authenticate", async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is missing");

  const usernameEnv = process.env.DA_USERNAME;
  const passwordEnv = process.env.DA_PASSWORD;

  if (!usernameEnv || !passwordEnv) {
    throw new Error("Missing DA_USERNAME or DA_PASSWORD in environment");
  }

  const normalizedBase = baseURL.endsWith("/") ? baseURL : baseURL + "/";
  const authUrl = new URL("auth.html#/", normalizedBase).toString();

  const resp = await page.goto(authUrl, { waitUntil: "domcontentloaded" });

  expect(resp?.status()).toBeLessThan(400);

  await expect(
    page.locator("text=/404\\s*\\|\\s*NOT FOUND/i")
  ).toHaveCount(0, { timeout: 10_000 });

  await expect(
    page.locator("h1", { hasText: "Forbidden" })
  ).toHaveCount(0, { timeout: 10_000 });

  const username = page.getByTestId("LoginView.username-text-field");
  const password = page.getByTestId("PasswordTextField.password-text-field");
  const loginBtn = page.getByTestId("LoginView.login-button");

  await expect(username).toBeVisible({ timeout: 60_000 });

  await username.fill(usernameEnv);
  await password.fill(passwordEnv);

  await Promise.all([
    page.waitForURL(/#\/views\/\d+/, { timeout: 60_000 }),
    loginBtn.click(),
  ]);

  await expect(
    page.getByTestId("NavItems.CurrentUser.Name")
  ).toContainText("Laconics-Admin", { timeout: 60_000 });

  await page.context().storageState({
    path: "playwright/.auth/state.json",
  });
});
