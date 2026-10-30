import type { Locator, Page, Response } from "@playwright/test";

export class StudentDashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly studentName: Locator;
  readonly enrolledCoursesLink: Locator;
  readonly logoutButton: Locator;
  readonly logoutConfirmationButton: Locator;
  readonly profileMenuButton: Locator;
  readonly profileMenuDashboardLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "My Profile" });
    this.studentName = page.getByText("Mock Student", { exact: true });
    this.enrolledCoursesLink = page.getByRole("link", {
      name: "Enrolled Courses",
    });
    this.logoutButton = page.getByRole("button", { name: "Logout" }).first();
    this.logoutConfirmationButton = page
      .getByRole("button", { name: "Logout" })
      .last();
    this.profileMenuButton = page
      .locator("button")
      .filter({ has: page.getByRole("img", { name: "profile-Mock" }) });
    this.profileMenuDashboardLink = page.getByRole("link", {
      name: "Dashboard",
    });
  }

  goto(): Promise<Response | null> {
    return this.page.goto("/dashboard/my-profile");
  }

  async requestLogout(): Promise<void> {
    await this.logoutButton.click();
  }

  async confirmLogout(): Promise<void> {
    await this.logoutConfirmationButton.click();
  }

  async openDashboardFromProfileMenu(): Promise<void> {
    await this.profileMenuButton.click();
    await this.profileMenuDashboardLink.click();
  }
}
