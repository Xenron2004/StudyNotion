import { expect, test } from "../../fixtures/test-fixtures";
import { API_RESPONSE_TIME_LIMIT_MS } from "../../utils/api-client";
import type { Post } from "../../utils/api-client";

test("API response includes valid status, headers, JSON data, and timing", async ({
  apiRequest,
}) => {
  const startedAt = Date.now();
  const response = await apiRequest.get("/posts/1");
  const responseTimeMs = Date.now() - startedAt;

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);

  const headers = response.headers();
  expect(headers["content-type"]).toContain("application/json");
  expect(headers["x-content-type-options"]).toBe("nosniff");

  const post = (await response.json()) as Post;
  expect(post).toMatchObject({
    id: 1,
    userId: 1,
  });
  expect(typeof post.title).toBe("string");
  expect(typeof post.body).toBe("string");

  expect(responseTimeMs).toBeLessThan(API_RESPONSE_TIME_LIMIT_MS);
});
