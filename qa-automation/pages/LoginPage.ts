import type { Locator, Page, Response } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly invalidInputs: Locator;
  readonly passwordVisibilityToggle: Locator;
  readonly loginFailedMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Welcome Back" });
    this.emailInput = page.getByLabel(/Email Address/);
    this.passwordInput = page.getByLabel(/^Password/);
    this.signInButton = page.getByRole("button", { name: "Sign In" });
    this.invalidInputs = page.locator("form input:invalid");
    this.passwordVisibilityToggle = page
      .locator("label")
      .filter({ has: this.passwordInput })
      .locator("span");
    this.loginFailedMessage = page.getByText("Login Failed");
  }

  goto(): Promise<Response | null> {
    return this.page.goto("/login");
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.signInButton.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordVisibilityToggle.click();
  }
}
