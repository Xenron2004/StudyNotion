import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

test("GET /posts/1 returns a successful post response", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts/1");

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/json");

  const post = (await response.json()) as Post;
  expect(post.id).toBe(1);
  expect(post.userId).toBe(1);
  expect(post.title).not.toBe("");
  expect(post.body).not.toBe("");
});

test("GET /posts returns a non-empty list of posts", async ({ apiRequest }) => {
  const response = await apiRequest.get("/posts");

  expect(response.status()).toBe(200);
  const posts = (await response.json()) as Post[];

  expect(Array.isArray(posts)).toBe(true);
  expect(posts.length).toBeGreaterThan(0);
  expect(posts[0]).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      title: expect.any(String),
      body: expect.any(String),
    }),
  );
});

test("GET /posts/2 returns the requested post for user 1", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts/2");

  expect(response.status()).toBe(200);
  const post = (await response.json()) as Post;

  expect(post.id).toBe(2);
  expect(post.userId).toBe(1);
});

test("GET /posts/999999 returns JSONPlaceholder's observed not-found response", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts/999999");

  expect(response.status()).toBe(404);
  expect(response.ok()).toBe(false);
  expect(await response.json()).toEqual({});
});
