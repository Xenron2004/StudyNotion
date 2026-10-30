import type { Locator, Page, Response } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly hero: Locator;
  readonly navigation: Locator;
  readonly homeLink: Locator;
  readonly catalogLabel: Locator;
  readonly aboutLink: Locator;
  readonly contactLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hero = page.getByText("Empower Your Future with Coding Skills");
    this.navigation = page.getByRole("navigation");
    this.homeLink = this.navigation.getByRole("link", { name: "Home" });
    this.catalogLabel = this.navigation.getByText("Catalog");
    this.aboutLink = this.navigation.getByRole("link", { name: "About Us" });
    this.contactLink = this.navigation.getByRole("link", {
      name: "Contact Us",
    });
  }

  goto(): Promise<Response | null> {
    return this.page.goto("/");
  }
}
