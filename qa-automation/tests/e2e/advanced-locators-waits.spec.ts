import { expect, test } from "../../fixtures/test-fixtures";

test("advanced locators target labeled, filtered, and duplicate elements", async ({
  page,
}) => {
  await page.setContent(`
    <main>
      <h1>Locator practice</h1>
      <label for="email">Email address</label>
      <input id="email" placeholder="Enter email" />
      <p>Welcome to the locator practice page</p>
      <ul>
        <li><article><h2>Alpha course</h2><button>Open</button></article></li>
        <li><article><h2>Beta course</h2><button>Open</button></article></li>
      </ul>
      <button>Save</button>
      <button>Save</button>
    </main>
  `);

  await expect(page.getByRole("heading", { name: "Locator practice" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByPlaceholder("Enter email")).toBeVisible();
  await expect(page.getByText("Welcome to the locator practice page")).toBeVisible();

  const betaCard = page
    .getByRole("listitem")
    .filter({ hasText: "Beta course" })
    .filter({
      has: page.getByRole("heading", { name: "Beta course" }),
    });
  await expect(betaCard.getByRole("button", { name: "Open" })).toBeVisible();

  const saveButtons = page.getByRole("button", { name: "Save", exact: true });
  await expect(saveButtons).toHaveCount(2);
  await expect(saveButtons.first()).toBeVisible();
  await expect(saveButtons.nth(0)).toBeVisible();
  await expect(saveButtons.last()).toBeVisible();
});

test("Playwright waits for elements, URL changes, responses, and state", async ({
  page,
}) => {
  await page.route("https://automation.test/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/next") {
      await route.fulfill({ contentType: "text/html", body: "<h1>Next page</h1>" });
      return;
    }

    await route.fulfill({
      contentType: "text/html",
      body: `
        <button id="show">Show status</button>
        <button id="navigate">Navigate</button>
        <button id="update">Update state</button>
        <div id="status"></div>
        <div id="async-state">waiting</div>
        <script>
          document.querySelector("#show").addEventListener("click", async () => {
            const response = await fetch("/api/status");
            document.querySelector("#status").textContent = await response.text();
          });
          document.querySelector("#navigate").addEventListener("click", () => {
            window.location.href = "/next";
          });
          document.querySelector("#update").addEventListener("click", () => {
            Promise.resolve().then(() => {
              document.querySelector("#async-state").textContent = "ready";
            });
          });
        </script>
      `,
    });
  });
  await page.route("https://automation.test/api/status", (route) =>
    route.fulfill({ status: 200, body: "online" }),
  );
  await page.goto("https://automation.test/start");

  await page.getByRole("button", { name: "Show status" }).click();
  await page.waitForSelector("#status:text('online')");
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === "https://automation.test/api/status" &&
      response.status() === 200,
  );
  await page.getByRole("button", { name: "Show status" }).click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);

  const nextURL = page.waitForURL("**/next");
  await page.getByRole("button", { name: "Navigate" }).click();
  await nextURL;
  await expect(page.getByRole("heading", { name: "Next page" })).toBeVisible();

  await page.goto("https://automation.test/start");
  await page.getByRole("button", { name: "Update state" }).click();
  await expect
    .poll(() => page.locator("#async-state").textContent())
    .toBe("ready");
});
