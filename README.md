# Demo QA Tests – Playwright E2E

End-to-end automation tests for the **Capacities → Shifts** module using Playwright and Page Object Model (POM).



## 🚀 Tech Stack

- Playwright
- TypeScript
- Page Object Model (POM)
- HTML Reporting
- Auth session reuse (storageState)

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
npm install


⚙️ Environment Setup

Create a .env file in the project root:

BASE_URL=https://werkstattplanung.net/demo/api/kic/da
DA_USERNAME=Laconics-Admin
DA_PASSWORD=replace-with-real-password


▶️ Run Tests
npx playwright test --project=e2e --headed

Run a specific test file:
npx playwright test tests/shifts.spec.ts

📊 View HTML Report

npx playwright show-report
