import { expect, test } from "../../fixtures/test-fixtures";

test("skip annotation marks an intentionally unavailable example", async () => {
  test.skip(true, "Demonstrates test.skip() without relying on an external system.");
});

test("fixme annotation marks a known issue for later repair", async () => {
  test.fixme(true, "Demonstrates test.fixme() for a known issue.");
});

test("fail annotation documents an intentionally failing expectation", async () => {
  test.fail(true, "Demonstrates expected failure reporting with test.fail().");
  expect("actual").toBe("expected");
});
