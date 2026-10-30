import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

type Comment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

test("get a post, then use its ID to retrieve and validate comments", async ({
  apiRequest,
}) => {
  const postResponse = await apiRequest.get("/posts/1");
  expect(postResponse.status()).toBe(200);
  const post = (await postResponse.json()) as Post;

  const commentsResponse = await apiRequest.get(
    `/posts/${post.id}/comments`,
  );
  expect(commentsResponse.status()).toBe(200);

  const comments = (await commentsResponse.json()) as Comment[];
  expect(Array.isArray(comments)).toBe(true);
  expect(comments.length).toBeGreaterThan(0);
  expect(
    comments.every(
      (comment) =>
        comment.postId === post.id &&
        typeof comment.id === "number" &&
        typeof comment.name === "string" &&
        typeof comment.email === "string" &&
        typeof comment.body === "string",
    ),
  ).toBe(true);
});
