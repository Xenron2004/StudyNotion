import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const frontendURL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const backendURL = process.env.BACKEND_URL ?? "http://localhost:4000/api/v1";
const isCI = Boolean(process.env.CI);
const configuredWorkers = process.env.PLAYWRIGHT_WORKERS;
const workers = configuredWorkers
  ? Number(configuredWorkers)
  : isCI
    ? 2
    : undefined;
const mockStudentState = path.resolve(
  __dirname,
  "playwright/.auth/mock-student.json",
);

if (
  configuredWorkers &&
  (!Number.isInteger(workers) || workers === undefined || workers < 1)
) {
  throw new Error("PLAYWRIGHT_WORKERS must be a positive integer.");
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers,
  reporter: [["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: frontendURL,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: "**/auth.setup.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "api",
      testMatch: "**/api/**/*.spec.ts",
    },
    {
      name: "chromium",
      testMatch: "**/e2e/**/*.spec.ts",
      testIgnore: "**/student-dashboard.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium-authenticated",
      testMatch: "**/e2e/student-dashboard.spec.ts",
      dependencies: ["auth-setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: mockStudentState,
      },
    },
  ],
  metadata: {
    frontendURL,
    backendURL,
  },
});
