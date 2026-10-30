import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

function isPost(value: unknown): value is Post {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const post = value as Record<string, unknown>;
  return (
    typeof post.id === "number" &&
    typeof post.userId === "number" &&
    typeof post.title === "string" &&
    typeof post.body === "string"
  );
}

function isPostArray(value: unknown): value is Post[] {
  return Array.isArray(value) && value.every(isPost);
}

test("runtime validation confirms a GET response has the Post shape", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts/1");
  expect(response.status()).toBe(200);

  const body: unknown = await response.json();
  expect(isPost(body)).toBe(true);

  if (isPost(body)) {
    expect(body.id).toBe(1);
    expect(body.title.length).toBeGreaterThan(0);
  }
});

test("runtime validation confirms the posts response is an array of Posts", async ({
  apiRequest,
}) => {
  const response = await apiRequest.get("/posts");
  expect(response.status()).toBe(200);

  const body: unknown = await response.json();
  expect(isPostArray(body)).toBe(true);
  if (isPostArray(body)) {
    expect(body.length).toBeGreaterThan(0);
  }
});

test("runtime validation rejects missing and incorrectly typed properties", async () => {
  const missingBody = {
    id: 1,
    userId: 1,
    title: "A post",
  };
  const incorrectIdType = {
    id: "1",
    userId: 1,
    title: "A post",
    body: "Post text",
  };

  expect(isPost(missingBody)).toBe(false);
  expect(isPost(incorrectIdType)).toBe(false);
  expect(isPostArray([missingBody])).toBe(false);
});
