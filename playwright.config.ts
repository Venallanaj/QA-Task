import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.BASE_URL,
    headless: false,

    // Debug goodies
    screenshot: "only-on-failure",
    trace: "on",
    video: "on-first-retry",
    viewport: { width: 1440, height: 900 },

    navigationTimeout: 60_000,
    actionTimeout: 20_000,

    launchOptions: {
      slowMo: 200, // slows down actions so you can see what happens
    },
  },

  projects: [
    { name: "setup", testMatch: /.*auth\.setup\.ts/ },
    {
      name: "e2e",
      dependencies: ["setup"],
      use: {
        baseURL: process.env.BASE_URL,
        storageState: "playwright/.auth/state.json",
      },
    },
  ],
  outputDir: "test-results",
  reporter: [["html", { open: "never" }]],
});
