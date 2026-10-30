import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

test("filter posts by userId using query parameters", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts", {
    params: { userId: 1 },
  });

  expect(response.status()).toBe(200);
  const posts = (await response.json()) as Post[];

  expect(posts.length).toBeGreaterThan(0);
  expect(posts.every((post) => post.userId === 1)).toBe(true);
});
