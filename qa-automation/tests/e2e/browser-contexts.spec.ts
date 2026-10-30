import { expect, test } from "../../fixtures/test-fixtures";

test("browser contexts keep cookies and localStorage isolated", async ({
  browser,
}) => {
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();

  try {
    await firstContext.route("https://context.test/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<h1>Isolated context</h1>",
      }),
    );
    await secondContext.route("https://context.test/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<h1>Isolated context</h1>",
      }),
    );
    await firstContext.addCookies([
      {
        name: "session-marker",
        value: "context-one",
        url: "https://context.test",
      },
    ]);
    await firstContext.addInitScript(() => {
      localStorage.setItem("context-marker", "context-one");
    });
    await secondContext.addInitScript(() => {
      localStorage.setItem("context-marker", "context-two");
    });

    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();
    await Promise.all([
      firstPage.goto("https://context.test/"),
      secondPage.goto("https://context.test/"),
    ]);

    await expect(
      firstPage.getByRole("heading", { name: "Isolated context" }),
    ).toBeVisible();
    await expect(
      secondPage.getByRole("heading", { name: "Isolated context" }),
    ).toBeVisible();
    expect(await firstPage.evaluate(() => localStorage.getItem("context-marker"))).toBe(
      "context-one",
    );
    expect(await secondPage.evaluate(() => localStorage.getItem("context-marker"))).toBe(
      "context-two",
    );
    expect(await firstContext.cookies("https://context.test")).toEqual([
      expect.objectContaining({
        name: "session-marker",
        value: "context-one",
      }),
    ]);
    expect(await secondContext.cookies("https://context.test")).toEqual([]);
  } finally {
    await firstContext.close();
    await secondContext.close();
  }
});
