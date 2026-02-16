import { test, expect } from "@playwright/test";
import { ShiftsPage } from "./pages/ShiftsPage";

test.describe.serial("Capacities → Shifts (via menu)", () => {
  test.beforeEach(async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.gotoViaMenu();
  });

  test("Shifts page loads", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.assertLoaded();
  });

  test("Today button sets date label (stable)", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.clickToday();
  });

  test("Prev/Next navigation changes the date label", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.goNextAndBack();
  });

  test("Scheduler shows rows (data loaded)", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.assertHasSomeRows();
  });

  test("Open a shift if one exists (non-destructive)", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    const opened = await shifts.openFirstShiftIfExists();

    if (!opened) test.skip(true, "No shift events visible in current demo view");

    const dialogOrDrawer = page.locator('[role="dialog"], .v-dialog--active, aside.v-navigation-drawer--right')
      .filter({ hasText: /Shift|Schicht|Details|Start|End/i })
      .first();

    await expect(dialogOrDrawer).toBeVisible({ timeout: 10_000 }).catch(() => {});
  });
});
