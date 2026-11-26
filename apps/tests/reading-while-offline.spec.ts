import { expect } from "@playwright/test";

import { test } from "./fixtures";
import { GenericThingPage } from "./page-objects/GenericThingPage";

test("can access cached resources while offline", async ({
  page,
  context,
  browserName,
  includesServiceWorker,
  navigationBar,
}) => {
  test.skip(
    browserName === "webkit",
    "Does not work with the webkit version provided by Playwright. Manually confirmed it works in a webkit browser.",
  );
  test.skip(
    !includesServiceWorker,
    "Requires the built app bundle, which includes the service worker.",
  );
  await test.step("given the user has enabled offline cache", async () => {
    await page.addInitScript(() => {
      const settings = JSON.parse(localStorage.getItem("settings") ?? "{}");
      localStorage.setItem("settings", JSON.stringify({ ...settings, offlineCache: true }));
    });
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    // The first load registers the worker. The reload lets it cache the app
    // assets and serve the later offline navigation.
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  });

  const somethingPage =
    await test.step("and the they have visited a resource", async () => {
      await navigationBar.fillAndSubmit(
        "http://localhost:4000/alice/public/generic/resource#it",
      );

      const genericPage = new GenericThingPage(page, "Something");
      await expect(genericPage.heading()).toHaveText("Something");
      return genericPage;
    });

  await test.step("and the user has returned to the home page", async () => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Search or enter URI" })).toBeVisible();
  });

  await test.step("when the user goes offline", async () => {
    await context.setOffline(true);
  });

  await test.step("and visits the previously loaded resource", async () => {
    await navigationBar.fillAndSubmit(
      "http://localhost:4000/alice/public/generic/resource#it",
    );
  });

  await test.step("then the cached content is still accessible", async () => {
    await expect(somethingPage.heading()).toHaveText("Something");

    await expect(somethingPage.overview()).toHaveText(/A very generic item/);
    await expect(somethingPage.overview()).toHaveText(/Thing/);

    await expect(somethingPage.picture()).toHaveAttribute("src", /blob:/);
  });

  await test.step("cleanup: restore online mode", async () => {
    await context.setOffline(false);
  });
});
