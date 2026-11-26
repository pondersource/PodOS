import { expect } from "@playwright/test";

import { test } from "./fixtures";

test("show name as heading for a person", async ({ page, navigationBar }) => {
  // when opening PodOS Browser
  await page.goto("/");

  // and navigating to Alice's WebID
  await navigationBar.fillAndSubmit(
    "http://localhost:4000/alice/profile/card#me",
  );

  // then the heading shows Alice's name as heading
  const label = page.getByRole("heading", { name: "Alice", exact: true });
  await expect(label).toHaveText("Alice");
});
