import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test } from "../../fixtures/test-fixtures";

test("fulfill, continue, inspect, and abort locally controlled requests", async ({
  page,
}) => {
  const server = createServer((request, response) => {
    if (request.url === "/continued") {
      response.writeHead(200, {
        "content-type": "application/json",
        "x-local-server": "continued",
      });
      response.end(JSON.stringify({ source: "local-server" }));
      return;
    }

    response.writeHead(200, { "content-type": "text/html" });
    response.end(`
      <button id="success">Successful mock</button>
      <button id="failure">Failed mock</button>
      <button id="continued">Continue to local server</button>
      <button id="abort">Abort request</button>
      <pre id="result"></pre>
      <script>
        for (const [button, endpoint] of [
          ["success", "/success"],
          ["failure", "/failure"],
          ["continued", "/continued"],
          ["abort", "/abort"],
        ]) {
          document.querySelector("#" + button).addEventListener("click", async () => {
            try {
              const response = await fetch(endpoint);
              document.querySelector("#result").textContent =
                response.status + " " + await response.text();
            } catch {
              document.querySelector("#result").textContent = "request aborted";
            }
          });
        }
      </script>
    `);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  const origin = `http://127.0.0.1:${address.port}`;

  try {
    await page.route(`${origin}/success`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ source: "mocked-success" }),
      }),
    );
    await page.route(`${origin}/failure`, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "controlled failure" }),
      }),
    );

    let continuedRequestHeader: string | undefined;
    await page.route(`${origin}/continued`, async (route) => {
      continuedRequestHeader =
        route.request().headers()["x-request-from-test"];
      await route.continue();
    });
    await page.route(`${origin}/abort`, (route) => route.abort());

    const inspectedResponses: Array<{ url: string; status: number }> = [];
    page.on("response", (response) => {
      inspectedResponses.push({
        url: response.url(),
        status: response.status(),
      });
    });

    await page.goto(origin);

    await page.getByRole("button", { name: "Successful mock" }).click();
    await expect(page.locator("#result")).toContainText("200");
    await expect(page.locator("#result")).toContainText("mocked-success");

    await page.getByRole("button", { name: "Failed mock" }).click();
    await expect(page.locator("#result")).toContainText("503");
    await expect(page.locator("#result")).toContainText("controlled failure");

    await page.setExtraHTTPHeaders({ "x-request-from-test": "continue-example" });
    await page.getByRole("button", { name: "Continue to local server" }).click();
    await expect(page.locator("#result")).toContainText("local-server");
    expect(continuedRequestHeader).toBe("continue-example");

    await page.getByRole("button", { name: "Abort request" }).click();
    await expect(page.locator("#result")).toHaveText("request aborted");

    expect(
      inspectedResponses.some(
        (response) =>
          response.url === `${origin}/continued` && response.status === 200,
      ),
    ).toBe(true);
    expect(
      inspectedResponses.some(
        (response) =>
          response.url === `${origin}/failure` && response.status === 503,
      ),
    ).toBe(true);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
