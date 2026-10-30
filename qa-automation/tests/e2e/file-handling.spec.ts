import { readFile } from "node:fs/promises";
import { expect, test } from "../../fixtures/test-fixtures";

test("setInputFiles uploads an in-memory test file to a controlled page", async ({
  page,
}) => {
  await page.setContent(`
    <label for="upload">Choose a file</label>
    <input id="upload" type="file" />
    <output id="selected"></output>
    <script>
      document.querySelector("#upload").addEventListener("change", (event) => {
        const file = event.target.files[0];
        document.querySelector("#selected").textContent = file.name + ":" + file.size;
      });
    </script>
  `);

  await page.getByLabel("Choose a file").setInputFiles({
    name: "playwright-sample.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("safe in-memory test content"),
  });

  await expect(page.locator("#selected")).toHaveText(
    "playwright-sample.txt:27",
  );
});

test("file chooser event can set an in-memory test file", async ({ page }) => {
  await page.setContent(`
    <button id="choose">Choose through file chooser</button>
    <input id="upload" type="file" hidden />
    <output id="selected"></output>
    <script>
      document.querySelector("#choose").addEventListener("click", () => {
        document.querySelector("#upload").click();
      });
      document.querySelector("#upload").addEventListener("change", (event) => {
        document.querySelector("#selected").textContent = event.target.files[0].name;
      });
    </script>
  `);

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Choose through file chooser" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "chooser-sample.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("chooser content"),
  });

  await expect(page.locator("#selected")).toHaveText("chooser-sample.txt");
});

test("download event validates a controlled file name and contents", async ({
  page,
}) => {
  const downloadContents = "download content from a mocked route";
  await page.route("https://automation.test/download.txt", (route) =>
    route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/plain",
        "content-disposition": 'attachment; filename="practice-download.txt"',
      },
      body: downloadContents,
    }),
  );
  await page.setContent(`
    <a href="https://automation.test/download.txt" download>Download file</a>
  `);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download file" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("practice-download.txt");
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  expect(await readFile(downloadPath!, "utf8")).toBe(downloadContents);
});
