import { expect, Page } from "@playwright/test";

export async function openShifts(page: Page) {
  await page.goto("index.html#/", { waitUntil: "domcontentloaded" });

  await page.getByTestId("NavItems.capacity-planning-group").click();

  await page.getByTestId("NavItems.shift").click();

  await expect(page).toHaveURL(/\/demo\/api\/kic\/da\/#\/organisation\/shifts/);

  await expect(page.locator("#b-schedulerpro-1")).toBeVisible({
    timeout: 60_000,
  });
}
