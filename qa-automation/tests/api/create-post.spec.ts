import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

test("POST /posts returns the submitted post with a simulated ID", async ({
  apiRequest,
}) => {
  const newPost = {
    title: "Playwright API Testing",
    body: "Learning API automation with TypeScript",
    userId: 1,
  };
  const response = await apiRequest.post("/posts", { data: newPost });

  expect(response.status()).toBe(201);
  expect(response.ok()).toBe(true);

  const createdPost = (await response.json()) as Post;
  expect(createdPost.title).toBe(newPost.title);
  expect(createdPost.body).toBe(newPost.body);
  expect(createdPost.userId).toBe(newPost.userId);
  expect(createdPost.id).toEqual(expect.any(Number));
});
