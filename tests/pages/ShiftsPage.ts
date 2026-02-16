import { expect, Page, Locator } from "@playwright/test";

export class ShiftsPage {
  readonly page: Page;

  // Core elements
  readonly scheduler: Locator;
  readonly title: Locator;
  readonly todayBtn: Locator;
  readonly prevBtn: Locator;
  readonly nextBtn: Locator;
  readonly dateLabel: Locator;

  // Sidebar / navigation
  readonly drawer: Locator;
  readonly burgerBtn: Locator;
  readonly capacitiesHeader: Locator;
  readonly capacitiesGroupTitle: Locator;
  readonly shiftsNav: Locator;

  // Scheduler content
  readonly schedulerRows: Locator;
  readonly shiftEvent: Locator;

  constructor(page: Page) {
    this.page = page;

    // Scheduler + header
    this.scheduler = page.locator("#b-schedulerpro-1");
    this.title = page.locator("header .v-toolbar__title");
    this.todayBtn = page.getByRole("button", { name: /^Today$/i });
    this.prevBtn = page.locator("header .v-toolbar__extension button").nth(1);
    this.nextBtn = page.locator("header .v-toolbar__extension button").nth(2);
    this.dateLabel = page.locator(
      "header .v-toolbar__extension .title.pointer",
    );

    // Sidebar
    this.drawer = page.locator("nav.v-navigation-drawer");

    this.burgerBtn = page
      .locator('button:has(i.mdi-menu), button[aria-label="Navigation drawer"]')
      .first();

    // "Capacities" title div (has testid in your HTML)
    this.capacitiesGroupTitle = page.getByTestId(
      "NavItems.capacity-planning-group",
    );

    // Vuetify group header that actually controls aria-expanded
    this.capacitiesHeader = page.locator(
      '.v-list-group__header:has([data-testid="NavItems.capacity-planning-group"])',
    );

    // Shifts nav link
    this.shiftsNav = page.getByTestId("NavItems.shift");

    // Scheduler rows / events
    this.schedulerRows = page.locator("#b-schedulerpro-1 .b-grid-row");
    this.shiftEvent = page
      .locator("#b-schedulerpro-1 .b-sch-event-wrap")
      .first();
  }

  // Alias
  async goto() {
    await this.gotoDirect();
  }

  /** Most stable: direct SPA route inside baseURL scope */
  async gotoDirect(date = "2026-02-15") {
    await this.page.goto(`./#/organisation/shifts?date=${date}`, {
      waitUntil: "domcontentloaded",
    });

    await this.failFastIfBlocked();
    await this.assertLoaded();
  }

  /** UI path: open menu > Capacities > Shifts */
  async gotoViaMenu() {
    // open any stable "app shell" route under BASE_URL
    await this.page.goto("./#/", { waitUntil: "domcontentloaded" });

    await this.failFastIfBlocked();
    await this.page.waitForLoadState("networkidle");

    // open + expand so the Shifts item exists in DOM
    await this.ensureShiftsNavVisible();

    // click Shifts from the menu (real navigation)
    await this.shiftsNav.click();

    await this.failFastIfBlocked();
    await this.assertLoaded();
  }

  /** Core readiness checks */
  async assertLoaded() {
    await expect(this.scheduler).toBeVisible({ timeout: 60_000 });
    await expect(this.title).toContainText(/Shifts/i, { timeout: 60_000 });
    await expect(this.dateLabel).toBeVisible({ timeout: 60_000 });

    const label = (await this.dateLabel.textContent())?.trim() ?? "";
    expect(label.length).toBeGreaterThan(0);
  }

  /** Fail fast for routing/session issues */
  async failFastIfBlocked() {
    const forbiddenH1 = this.page.locator("h1", { hasText: "Forbidden" });
    const notFound404 = this.page.locator("text=/404\\s*\\|\\s*NOT FOUND/i");

    await expect(forbiddenH1).toHaveCount(0, { timeout: 10_000 });
    await expect(notFound404).toHaveCount(0, { timeout: 10_000 });
  }

  /** Ensure sidebar exists, is open, and Capacities is expanded so Shifts exists in DOM */
  async ensureShiftsNavVisible() {
    const leftDrawer = this.page
      .locator("nav.v-navigation-drawer:not(.v-navigation-drawer--right)")
      .first();

    const capacitiesHeader = this.page.locator(
      '.v-list-group__header:has([data-testid="NavItems.capacity-planning-group"])',
    );

    // 1) Wait for drawer to exist
    await expect(leftDrawer).toHaveCount(1, { timeout: 60_000 });

    // 2) If drawer is not open, click burger
    // Vuetify marks open with class v-navigation-drawer--open
    const isOpen = await leftDrawer
      .evaluate((el) => el.classList.contains("v-navigation-drawer--open"))
      .catch(() => false);

    if (!isOpen && (await this.burgerBtn.isVisible().catch(() => false))) {
      await this.burgerBtn.click().catch(() => {});
    }

    // 3) If it's a "mouseover" mini drawer, hover it to expand
    await leftDrawer.hover().catch(() => {});

    // 4) Now wait for capacities to actually become visible
    await expect(capacitiesHeader).toBeVisible({ timeout: 60_000 });

    // 5) Expand capacities if collapsed
    const expanded = await capacitiesHeader.getAttribute("aria-expanded");
    if (expanded === "false") {
      await capacitiesHeader.click();
    }

    // 6) Now shifts should be visible
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
