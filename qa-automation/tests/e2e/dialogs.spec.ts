import { expect, test } from "../../fixtures/test-fixtures";

test("accept alerts, accept and dismiss confirms, and handle prompts", async ({
  page,
}) => {
  await page.setContent("<h1>Dialog practice</h1>");

  const alertPromise = page.waitForEvent("dialog");
  const alertEvaluation = page.evaluate(() => alert("Alert message"));
  const alertDialog = await alertPromise;
  expect(alertDialog.type()).toBe("alert");
  expect(alertDialog.message()).toBe("Alert message");
  await alertDialog.accept();
  await alertEvaluation;

  const acceptedConfirmPromise = page.waitForEvent("dialog");
  const acceptedConfirmEvaluation = page.evaluate(() =>
    window.confirm("Accept confirmation?"),
  );
  const acceptedConfirm = await acceptedConfirmPromise;
  expect(acceptedConfirm.type()).toBe("confirm");
  await acceptedConfirm.accept();
  expect(await acceptedConfirmEvaluation).toBe(true);

  const dismissedConfirmPromise = page.waitForEvent("dialog");
  const dismissedConfirmEvaluation = page.evaluate(() =>
    window.confirm("Dismiss confirmation?"),
  );
  const dismissedConfirm = await dismissedConfirmPromise;
  expect(dismissedConfirm.type()).toBe("confirm");
  await dismissedConfirm.dismiss();
  expect(await dismissedConfirmEvaluation).toBe(false);

  const acceptedPromptPromise = page.waitForEvent("dialog");
  const acceptedPromptEvaluation = page.evaluate(() =>
    window.prompt("Enter a value"),
  );
  const acceptedPrompt = await acceptedPromptPromise;
  expect(acceptedPrompt.type()).toBe("prompt");
  await acceptedPrompt.accept("sample value");
  expect(await acceptedPromptEvaluation).toBe("sample value");

  const dismissedPromptPromise = page.waitForEvent("dialog");
  const dismissedPromptEvaluation = page.evaluate(() =>
    window.prompt("Dismiss this prompt"),
  );
  const dismissedPrompt = await dismissedPromptPromise;
  expect(dismissedPrompt.type()).toBe("prompt");
  await dismissedPrompt.dismiss();
  expect(await dismissedPromptEvaluation).toBeNull();
});
