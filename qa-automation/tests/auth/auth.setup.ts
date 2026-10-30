import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test as setup } from "@playwright/test";

const authFile = path.resolve(
  __dirname,
  "../../playwright/.auth/mock-student.json",
);

const mockStudent = {
  firstName: "Mock",
  lastName: "Student",
  email: "mock-student@example.test",
  accountType: "Student",
  image: "",
  additionalDetails: {
    about: null,
    gender: null,
    dateOfBirth: null,
    contactNumber: null,
  },
};

setup("save synthetic student UI state", async ({ page }) => {
  await page.route("**/course/showAllCategories", (route) =>
    route.fulfill({
      json: { success: true, data: [] },
    }),
  );

  await page.addInitScript((user) => {
    window.localStorage.setItem(
      "token",
      JSON.stringify("mock-playwright-token-not-valid-for-api"),
    );
    window.localStorage.setItem("user", JSON.stringify(user));
  }, mockStudent);

  await page.goto("/dashboard/my-profile");
  await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();
  await expect(page.getByText("Mock Student", { exact: true })).toBeVisible();

  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
