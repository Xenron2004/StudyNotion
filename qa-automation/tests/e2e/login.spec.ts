import { expect, test } from "../../fixtures/test-fixtures";

test.beforeEach(async ({ page, loginPage }) => {
  await page.route("**/course/showAllCategories", (route) =>
    route.fulfill({
      json: { success: true, data: [] },
    }),
  );

  await loginPage.goto();
});

test("login page loads with labeled email and password fields", async ({
  loginPage,
}) => {
  await expect(loginPage.heading).toBeVisible();
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.signInButton).toBeVisible();
});

test("empty required fields prevent a login request", async ({
  page,
  loginPage,
}) => {
  let loginRequestCount = 0;
  await page.route("**/auth/login", async (route) => {
    loginRequestCount += 1;
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Please Fill up All the Required Fields",
      }),
    });
  });

  await loginPage.submit();

  await expect(loginPage.invalidInputs).toHaveCount(2);
  expect(loginRequestCount).toBe(0);
  await expect(page).toHaveURL(/\/login$/);
});

test("incorrect credentials show an error without authenticating", async ({
  page,
  loginPage,
}) => {
  await page.route("**/auth/login", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Password is incorrect",
      }),
    }),
  );

  await loginPage.fillEmail("invalid@example.test");
  await loginPage.fillPassword("not-a-real-password");
  await loginPage.submit();

  await expect(loginPage.loginFailedMessage).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("token")))
    .toBeNull();
});

test("password visibility toggle reveals and masks the password", async ({
  loginPage,
}) => {
  await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
  await loginPage.togglePasswordVisibility();
  await expect(loginPage.passwordInput).toHaveAttribute("type", "text");
  await loginPage.togglePasswordVisibility();
  await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
});
