import { expect, Page, Locator } from "@playwright/test";

export class ShiftsPage {
  readonly page: Page;

  readonly scheduler: Locator;
  readonly title: Locator;
  readonly todayBtn: Locator;
  readonly prevBtn: Locator;
  readonly nextBtn: Locator;
  readonly dateLabel: Locator;

  readonly drawer: Locator;
  readonly burgerBtn: Locator;
  readonly capacitiesHeader: Locator;
  readonly capacitiesGroupTitle: Locator;
  readonly shiftsNav: Locator;

  readonly schedulerRows: Locator;
  readonly shiftEvent: Locator;

  // Helper to get today's date in YYYY-MM-DD format for URL parameters
  private getTodayISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  constructor(page: Page) {
    this.page = page;

    this.scheduler = page.locator("#b-schedulerpro-1");
    this.title = page.locator("header .v-toolbar__title");
    this.todayBtn = page.getByRole("button", { name: /^Today$/i });
    this.prevBtn = page.locator("header .v-toolbar__extension button").nth(1);
    this.nextBtn = page.locator("header .v-toolbar__extension button").nth(2);
    this.dateLabel = page.locator(
      "header .v-toolbar__extension .title.pointer",
    );

    this.drawer = page.locator("nav.v-navigation-drawer");

    this.burgerBtn = page
      .locator('button:has(i.mdi-menu), button[aria-label="Navigation drawer"]')
      .first();

    this.capacitiesGroupTitle = page.getByTestId(
      "NavItems.capacity-planning-group",
    );

    this.capacitiesHeader = page.locator(
      '.v-list-group__header:has([data-testid="NavItems.capacity-planning-group"])',
    );

    this.shiftsNav = page.getByTestId("NavItems.shift");

    this.schedulerRows = page.locator("#b-schedulerpro-1 .b-grid-row");
    this.shiftEvent = page
      .locator("#b-schedulerpro-1 .b-sch-event-wrap")
      .first();
  }

  async goto() {
    await this.gotoDirect();
  }

  async gotoDirect(date?: string) {
    const targetDate = date ?? this.getTodayISO();

    await this.page.goto(`./#/organisation/shifts?date=${targetDate}`, {
      waitUntil: "domcontentloaded",
    });

    await this.failFastIfBlocked();
    await this.assertLoaded();
  }

  async gotoViaMenu() {
    await this.page.goto("./#/", { waitUntil: "domcontentloaded" });

    await this.failFastIfBlocked();
    await this.page.waitForLoadState("networkidle");

    await this.ensureShiftsNavVisible();
    await this.shiftsNav.click();

    await this.failFastIfBlocked();
    await this.assertLoaded();
  }

  async assertLoaded() {
    await expect(this.scheduler).toBeVisible({ timeout: 60_000 });
    await expect(this.title).toContainText(/Shifts/i, { timeout: 60_000 });
    await expect(this.dateLabel).toBeVisible({ timeout: 60_000 });

    const label = (await this.dateLabel.textContent())?.trim() ?? "";
    expect(label.length).toBeGreaterThan(0);
  }

  async failFastIfBlocked() {
    const forbidden = this.page.locator("h1", { hasText: "Forbidden" });
    const notFound = this.page.locator("text=/404\\s*\\|\\s*NOT FOUND/i");

    await expect(forbidden).toHaveCount(0, { timeout: 10_000 });
    await expect(notFound).toHaveCount(0, { timeout: 10_000 });
  }

  async ensureShiftsNavVisible() {
    const leftDrawer = this.page
      .locator("nav.v-navigation-drawer:not(.v-navigation-drawer--right)")
      .first();

    const capacitiesHeader = this.page.locator(
      '.v-list-group__header:has([data-testid="NavItems.capacity-planning-group"])',
    );

    await expect(leftDrawer).toHaveCount(1, { timeout: 60_000 });

    const isOpen = await leftDrawer
      .evaluate((el) => el.classList.contains("v-navigation-drawer--open"))
      .catch(() => false);

    if (!isOpen && (await this.burgerBtn.isVisible().catch(() => false))) {
      await this.burgerBtn.click().catch(() => {});
    }

    await leftDrawer.hover().catch(() => {});
    await expect(capacitiesHeader).toBeVisible({ timeout: 60_000 });

    const expanded = await capacitiesHeader.getAttribute("aria-expanded");
    if (expanded === "false") {
      await capacitiesHeader.click();
    }

    await expect(this.shiftsNav).toBeVisible({ timeout: 60_000 });
  }

  async clickToday() {
    await expect(this.todayBtn).toBeVisible({ timeout: 60_000 });
    await this.todayBtn.click();

    await expect(this.dateLabel).toBeVisible({ timeout: 60_000 });

    const text = (await this.dateLabel.textContent())?.trim() ?? "";
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toMatch(/forbidden/i);
    expect(text).not.toMatch(/not found/i);
  }

  async goNextAndBack() {
    const start = (await this.dateLabel.textContent())?.trim() ?? "";
    expect(start.length).toBeGreaterThan(0);

    await this.nextBtn.click();
    await expect(this.dateLabel).not.toHaveText(start, { timeout: 60_000 });

    const moved = (await this.dateLabel.textContent())?.trim() ?? "";
    expect(moved.length).toBeGreaterThan(0);

    await this.prevBtn.click();
    await expect(this.dateLabel).not.toHaveText(moved, { timeout: 60_000 });
  }

  async assertHasSomeRows() {
    const count = await this.schedulerRows.count();
    expect(count).toBeGreaterThan(0);
  }

  async openFirstShiftIfExists() {
    const count = await this.shiftEvent.count();
    if (count === 0) return false;

    await this.shiftEvent.click();
    return true;
  }
}
