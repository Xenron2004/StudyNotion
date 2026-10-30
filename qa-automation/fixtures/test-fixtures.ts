import { expect, test as base } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { StudentDashboardPage } from "../pages/StudentDashboardPage";
import { API_BASE_URL } from "../utils/api-client";

type TestFixtures = {
  apiRequest: APIRequestContext;
  homePage: HomePage;
  loginPage: LoginPage;
  studentDashboardPage: StudentDashboardPage;
};

export const test = base.extend<TestFixtures>({
  apiRequest: async ({ playwright }, use) => {
    const apiRequest = await playwright.request.newContext({
      baseURL: API_BASE_URL,
    });

    try {
      await use(apiRequest);
    } finally {
      await apiRequest.dispose();
    }
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  studentDashboardPage: async ({ page }, use) => {
    await use(new StudentDashboardPage(page));
  },
});

export { expect };
