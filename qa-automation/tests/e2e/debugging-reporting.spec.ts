import { expect, test } from "../../fixtures/test-fixtures";

test.use({ video: "on" });

test("capture full-page and element screenshots with video recording", async ({
  page,
}, testInfo) => {
  await page.route("https://diagnostics.test/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `
          <title>Diagnostics practice</title>
          <main>
            <h1>Diagnostics practice</h1>
            <section aria-label="Screenshot target">
              <h2>Screenshot target</h2>
              <p>Controlled content for screenshot examples.</p>
            </section>
            <footer>End of page</footer>
          </main>
        `,
    }),
  );
  await page.goto("https://diagnostics.test/");

  await expect(
    page.getByRole("heading", { name: "Diagnostics practice" }),
  ).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("full-page.png"),
    fullPage: true,
  });
  await page.getByRole("region", { name: "Screenshot target" }).screenshot({
    path: testInfo.outputPath("element.png"),
  });

  const diagnostics = {
    title: await page.title(),
    url: page.url(),
    screenshotFiles: ["full-page.png", "element.png"],
  };
  console.log("Browser diagnostics:", diagnostics);
  await testInfo.attach("browser-diagnostics", {
    body: JSON.stringify(diagnostics, null, 2),
    contentType: "application/json",
  });
});

test("open Playwright Inspector at an explicit pause when opted in", async ({
  page,
}) => {
  test.skip(
    process.env.PWDEBUG !== "1",
    "Set PWDEBUG=1 and run this spec with --debug to pause in Inspector.",
  );

  await page.setContent("<h1>Inspector practice</h1>");
  await page.pause();
  await expect(
    page.getByRole("heading", { name: "Inspector practice" }),
  ).toBeVisible();
});

test("slow annotation provides extra timeout headroom", async ({ page }) => {
  test.slow();
  await page.setContent("<p>Slow-test annotation example</p>");
  await expect(page.getByText("Slow-test annotation example")).toBeVisible();
});
