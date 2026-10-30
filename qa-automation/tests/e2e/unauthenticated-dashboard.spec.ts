import { expect, test } from "../../fixtures/test-fixtures";

test.beforeEach(async ({ page }) => {
  await page.route("**/course/showAllCategories", (route) =>
    route.fulfill({
      json: { success: true, data: [] },
    }),
  );
});

test("unauthenticated visitors are redirected from the dashboard to login", async ({
  page,
  loginPage,
}) => {
  await page.goto("/dashboard/my-profile");

  await expect(page).toHaveURL(/\/login$/);
  await expect(loginPage.heading).toBeVisible();
});
