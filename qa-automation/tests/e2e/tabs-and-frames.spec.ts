import { expect, test } from "../../fixtures/test-fixtures";

test("context page event captures and validates a new tab", async ({
  context,
  page,
}) => {
  await context.route("https://automation.test/new-tab", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>New tab</title><h1>Opened in a new tab</h1>",
    }),
  );
  await page.setContent(`
    <button onclick="window.open('https://automation.test/new-tab', '_blank')">
      Open new tab
    </button>
  `);

  const newPagePromise = context.waitForEvent("page");
  await page.getByRole("button", { name: "Open new tab" }).click();
  const newPage = await newPagePromise;

  await expect(newPage).toHaveTitle("New tab");
  await expect(
    newPage.getByRole("heading", { name: "Opened in a new tab" }),
  ).toBeVisible();
  await newPage.close();
});

test("page popup event captures and validates a popup window", async ({
  context,
  page,
}) => {
  await context.route("https://automation.test/popup", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>Popup window</title><p>Popup content</p>",
    }),
  );
  await page.setContent(`
    <button onclick="window.open('https://automation.test/popup', 'study-popup')">
      Open popup
    </button>
  `);

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Open popup" }).click();
  const popup = await popupPromise;

  await expect(popup).toHaveTitle("Popup window");
  await expect(popup.getByText("Popup content")).toBeVisible();
  await popup.close();
});

test("frameLocator interacts with and asserts iframe content", async ({
  page,
}) => {
  await page.setContent(`
    <iframe
      title="Practice frame"
      srcdoc="<label for='message'>Message</label><input id='message' /><button>Submit frame form</button><p id='result'>Waiting</p>"
    ></iframe>
  `);

  const frame = page.frameLocator('iframe[title="Practice frame"]');
  await frame.getByLabel("Message").fill("hello from the parent test");
  await frame.getByRole("button", { name: "Submit frame form" }).click();
  await frame.locator("#result").evaluate((element) => {
    element.textContent = "submitted";
  });

  await expect(frame.locator("#result")).toHaveText("submitted");
});
