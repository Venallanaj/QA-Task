import { test, expect } from "@playwright/test";
import { ShiftsPage } from "./pages/ShiftsPage";

test.describe("Capacities > Shifts (core)", () => {
  test.beforeEach(async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.goto(); // uses today by default
  });

  test("Shifts page loads and scheduler grid is visible", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await expect(shifts.scheduler).toBeVisible();
    await expect(shifts.title).toContainText(/Shifts/i);
  });

  test("Today button sets date label (stable)", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.clickToday();
  });

  test("Prev/Next navigation changes the date label", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.goNextAndBack();
  });

  test("Scheduler shows at least one staff row (data loaded)", async ({ page }) => {
    const shifts = new ShiftsPage(page);

    await expect(
      page.locator("#b-schedulerpro-1 .b-grid-header-text-content", { hasText: "Staffs" })
    ).toBeVisible();

    await shifts.assertHasSomeRows();
  });
});
