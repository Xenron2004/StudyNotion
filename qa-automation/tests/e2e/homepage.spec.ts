import { expect, test } from "../../fixtures/test-fixtures";

test.beforeEach(async ({ page }) => {
  await page.route("**/course/showAllCategories", (route) =>
    route.fulfill({
      json: { success: true, data: [] },
    }),
  );
  await page.route("**/course/getReviews", (route) =>
    route.fulfill({
      json: { success: true, data: [] },
    }),
  );
});

test("homepage loads with its main navigation", async ({ page, homePage }) => {
  const response = await homePage.goto();

  expect(response).not.toBeNull();
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("StudyNotion");
  await expect(homePage.hero).toBeVisible();

  await expect(homePage.navigation).toBeVisible();
  await expect(homePage.homeLink).toBeVisible();
  await expect(homePage.catalogLabel).toBeVisible();
  await expect(homePage.aboutLink).toBeVisible();
  await expect(homePage.contactLink).toBeVisible();
});