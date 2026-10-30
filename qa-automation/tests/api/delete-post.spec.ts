import { expect, test } from "../../fixtures/test-fixtures";

test("DELETE /posts/1 returns JSONPlaceholder's successful simulated deletion", async ({
  apiRequest,
}) => {
  const response = await apiRequest.delete("/posts/1");

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({});
});
