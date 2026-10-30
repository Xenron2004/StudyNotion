import { expect, test } from "../../fixtures/test-fixtures";
import type { Post } from "../../utils/api-client";

test("render a JSONPlaceholder post in a controlled browser page", async ({
  apiRequest,
  page,
}) => {
  const response = await apiRequest.get("/posts/1");

  expect(response.status()).toBe(200);
  const post = (await response.json()) as Post;

  await page.setContent(`
    <main>
      <h1>Post details</h1>
      <article>
        <h2 data-testid="post-title"></h2>
        <p data-testid="post-body"></p>
        <p data-testid="post-id"></p>
      </article>
    </main>
  `);
  await page.getByTestId("post-title").evaluate(
    (element, title) => (element.textContent = title),
    post.title,
  );
  await page.getByTestId("post-body").evaluate(
    (element, body) => (element.textContent = body),
    post.body,
  );
  await page.getByTestId("post-id").evaluate(
    (element, id) => (element.textContent = String(id)),
    post.id,
  );

  await expect(page.getByRole("heading", { name: "Post details" })).toBeVisible();
  await expect(page.getByTestId("post-title")).toHaveText(post.title);
  await expect(page.getByTestId("post-body")).toHaveText(post.body);
  await expect(page.getByTestId("post-id")).toHaveText(String(post.id));
});
