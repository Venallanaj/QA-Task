import { expect, Page } from '@playwright/test';

export async function openShifts(page: Page) {
  // Always start inside the correct app scope
  await page.goto('index.html#/', { waitUntil: 'domcontentloaded' });

  // Open Capacities group
  await page.getByTestId('NavItems.capacity-planning-group').click();

  // Click Shifts
  await page.getByTestId('NavItems.shift').click();

  // Verify we are in the correct URL scope (prevents future 403)
  await expect(page).toHaveURL(/\/demo\/api\/kic\/da\/#\/organisation\/shifts/);

  // Verify scheduler exists
  await expect(page.locator('#b-schedulerpro-1')).toBeVisible({ timeout: 60_000 });
}
