import { expect, test } from "../../fixtures/test-fixtures";

test.describe("independent parallel browser checks", () => {
  test.describe.configure({ mode: "parallel" });

  for (const pageLabel of ["parallel-alpha", "parallel-beta", "parallel-gamma"]) {
    test(`runs ${pageLabel} in its isolated test context @regression`, async ({
      page,
    }, testInfo) => {
      const localRecord = { label: pageLabel };
      console.log(
        `Parallel example: ${testInfo.title}; worker=${testInfo.workerIndex}; parallelIndex=${testInfo.parallelIndex}`,
      );

      await page.setContent(`<h1>${localRecord.label}</h1>`);
      await expect(
        page.getByRole("heading", { name: localRecord.label }),
      ).toBeVisible();
    });
  }
});

test.describe("controlled retry demonstration", () => {
  test.describe.configure({ retries: 1 });

  test("fails on its first controlled attempt, then passes on retry @smoke", async ({
    page,
  }, testInfo) => {
    console.log(
      `Controlled retry example: retry=${testInfo.retry}; worker=${testInfo.workerIndex}`,
    );

    await page.setContent("<h1>Retry practice</h1>");
    await expect(page.getByRole("heading", { name: "Retry practice" })).toBeVisible();

    expect(testInfo.retry).toBeGreaterThan(0);
  });
});
