import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: {
      mode: "only-on-failure",
      fullPage: true,
    },
  },
  projects: [
    {
      name: "visual-baseline",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: {
          mode: "only-on-failure",
          fullPage: true,
        },
      },
    },
    {
      name: "visual-baseline-mobile",
      use: {
        ...devices["Pixel 5"],
        screenshot: {
          mode: "only-on-failure",
          fullPage: true,
        },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
