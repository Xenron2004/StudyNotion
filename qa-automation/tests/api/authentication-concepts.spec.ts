import { expect, test } from "../../fixtures/test-fixtures";
import { API_BASE_URL } from "../../utils/api-client";

test("a controlled route receives the constructed synthetic Bearer header", async ({
  page,
}) => {
  const syntheticToken = "synthetic-token-for-header-demonstration";
  let receivedAuthorization: string | undefined;

  await page.route("**/__playwright-auth-probe", async (route) => {
    receivedAuthorization = route.request().headers()["authorization"];
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ received: true }),
    });
  });

  await page.goto(`${API_BASE_URL}/posts/1`);
  const probeResult = await page.evaluate(async (token) => {
    const response = await fetch("/__playwright-auth-probe", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }, syntheticToken);

  expect(probeResult).toEqual({ received: true });
  expect(receivedAuthorization).toBe(`Bearer ${syntheticToken}`);
});
