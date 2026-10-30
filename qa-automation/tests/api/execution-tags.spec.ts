import { expect, test } from "../../fixtures/test-fixtures";

test("JSONPlaceholder post can be read @api", async ({ apiRequest }) => {
  const response = await apiRequest.get("/posts/1");

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
});
