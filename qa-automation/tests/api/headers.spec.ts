import { expect, test } from "../../fixtures/test-fixtures";

test("send request headers and validate response headers", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts/1", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Playwright-Client": "study-notion-qa",
    },
  });

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);

  const responseHeaders = response.headers();
  expect(responseHeaders["content-type"]).toContain("application/json");
  expect(responseHeaders["x-content-type-options"]).toBe("nosniff");
});
