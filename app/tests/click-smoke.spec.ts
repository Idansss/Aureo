import { test, expect } from "@playwright/test";

test.describe("CTA smoke test", () => {
  test("home hero apply button opens apply flow", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Apply with Aureo profile" }).click();
    await expect(page).toHaveURL(/\/jobs/);
    await expect(page.getByText("Find Your Next Role")).toBeVisible();
  });

  test("pricing page primary CTAs navigate", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("stories card opens detail view", async ({ page }) => {
    await page.goto("/stories");
    const storyLink = page.locator("a:has(article)").first();
    const destination = await storyLink.getAttribute("href");
    await storyLink.click();
    if (destination) await expect(page).toHaveURL(destination);
  });
});
