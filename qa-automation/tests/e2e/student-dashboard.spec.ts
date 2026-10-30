import { expect, test } from "../../fixtures/test-fixtures";

test.beforeEach(async ({ page, studentDashboardPage }) => {
  await page.route("**/course/showAllCategories", (route) =>
    route.fulfill({
      json: { success: true, data: [] },
    }),
  );

  await studentDashboardPage.goto();
});

test("mock-authenticated student can access the student dashboard", async ({
  page,
  studentDashboardPage,
}) => {
  await expect(studentDashboardPage.heading).toBeVisible();
  await expect(studentDashboardPage.studentName).toBeVisible();
  await expect(studentDashboardPage.enrolledCoursesLink).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/my-profile$/);
});

test("mocked authentication state persists across page navigation", async ({
  homePage,
  studentDashboardPage,
}) => {
  await expect(studentDashboardPage.heading).toBeVisible();

  await homePage.homeLink.click();
  await expect(homePage.hero).toBeVisible();

  await studentDashboardPage.openDashboardFromProfileMenu();

  await expect(studentDashboardPage.heading).toBeVisible();
  await expect(studentDashboardPage.studentName).toBeVisible();
});

test("logout clears mocked client state and protects the dashboard again", async ({
  page,
  studentDashboardPage,
  loginPage,
}) => {
  await expect(studentDashboardPage.heading).toBeVisible();

  await studentDashboardPage.requestLogout();
  await expect(page.getByText("Are You Sure ?")).toBeVisible();
  await studentDashboardPage.confirmLogout();

  await expect(page).toHaveURL(/\/login$/);
  await expect(loginPage.heading).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        token: localStorage.getItem("token"),
        user: localStorage.getItem("user"),
      })),
    )
    .toEqual({ token: null, user: null });

  await studentDashboardPage.goto();
  await expect(page).toHaveURL(/\/login$/);
  await expect(loginPage.heading).toBeVisible();
});
