import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

test("PUT /posts/1 returns the complete updated post", async ({
  apiRequest,
}) => {
  const updatedPost: Post = {
    id: 1,
    title: "Updated post title",
    body: "Updated post body",
    userId: 1,
  };
  const response = await apiRequest.put("/posts/1", { data: updatedPost });

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject(updatedPost);
});

test("PATCH /posts/1 changes the title and retains omitted properties", async ({
  apiRequest,
}) => {
  const originalResponse = await apiRequest.get("/posts/1");
  expect(originalResponse.status()).toBe(200);
  const originalPost = (await originalResponse.json()) as Post;

  const updatedTitle = "Patched post title";
  const response = await apiRequest.patch("/posts/1", {
    data: { title: updatedTitle },
  });

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({
    id: originalPost.id,
    userId: originalPost.userId,
    title: updatedTitle,
    body: originalPost.body,
  });
});
