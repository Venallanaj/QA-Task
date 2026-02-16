import { test, expect } from '@playwright/test';

test('Login (clean session)', async ({ page, context }) => {
  await context.clearCookies();

  await page.goto('https://werkstattplanung.net/demo/api/kic/da/auth.html#/', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });

  await page.locator('[data-testid="LoginView.username-text-field"]').fill(process.env.DA_USERNAME!);
  await page.locator('[data-testid="PasswordTextField.password-text-field"]').fill(process.env.DA_PASSWORD!);

  await Promise.all([
    page.waitForURL(/\/#\/views\/\d+/, { timeout: 120000 }),
    page.locator('[data-testid="LoginView.login-button"]').click(),
  ]);

  await expect(page).toHaveURL(/\/#\/views\/\d+/, { timeout: 120000 });
});
