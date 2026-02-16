import { test, expect } from "@playwright/test";
import { ShiftsPage } from "./pages/ShiftsPage";



test.describe("Capacities > Shifts (core)", () => {
  test.beforeEach(async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.gotoDirect();     // ✅ direct route
    await shifts.assertLoaded();   // ✅ common readiness checks
  });

  test("Shifts page loads and scheduler grid is visible", async ({ page }) => {
    const shifts = new ShiftsPage(page);

    await expect(shifts.scheduler).toBeVisible();
    await expect(shifts.title).toContainText(/Shifts/i);
  });

  test("Today button sets date label (stable)", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.clickToday(); // ✅ moved logic into POM
  });

  test("Prev/Next navigation changes the date label", async ({ page }) => {
    const shifts = new ShiftsPage(page);
    await shifts.goNextAndBack(); // ✅ moved logic into POM
  });

// test("Sidebar navigation item exists for Shifts", async ({ page }) => {
//   const shifts = new ShiftsPage(page);

//   await shifts.ensureShiftsNavVisible();
//   await expect(shifts.shiftsNav).toHaveAttribute("href", /#\/organisation\/shifts/);
// });
// test.describe("Sidebar", () => {
//   test("navigation item exists for Shifts", async ({ page }) => {
//     const shifts = new ShiftsPage(page);
//     await shifts.gotoViaMenu();
//     await expect(shifts.shiftsNav).toHaveAttribute("href", /#\/organisation\/shifts/);
//   });
// });


  test("Scheduler shows at least one staff row (data loaded)", async ({ page }) => {
    const shifts = new ShiftsPage(page);

    // ✅ keep staff header check (good assertion)
    const staffHeader = page.locator(
      "#b-schedulerpro-1 .b-grid-header-text-content",
      { hasText: "Staffs" }
    );
    await expect(staffHeader).toBeVisible();

    // ✅ moved row-count assertion into POM
    await shifts.assertHasSomeRows();
  });
});
