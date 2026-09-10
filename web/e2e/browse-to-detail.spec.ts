import { test, expect } from "@playwright/test";

test("browse listings and open a detail page", async ({ page }) => {
  await page.goto("/listings");

  await expect(page.getByRole("heading", { name: "Used cars" })).toBeVisible();

  // Wait for the grid to actually have cards before clicking one.
  const firstCard = page.locator('a[href^="/listings/"]').first();
  await expect(firstCard).toBeVisible();

  const href = await firstCard.getAttribute("href");
  await firstCard.click();

  await expect(page).toHaveURL(new RegExp(href!.replace(/\//g, "\\/")));

  // Detail page should show a price (formatted like "£12,345") and specs.
  await expect(page.getByText(/^£[\d,]+$/)).toBeVisible();
  await expect(page.getByText("Mileage")).toBeVisible();
});

test("filtering narrows the results", async ({ page }) => {
  await page.goto("/listings");

  await page.getByPlaceholder("e.g. Ford").fill("Ford");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/make=Ford/);

  const cards = page.locator('a[href^="/listings/"]');
  await expect(cards.first()).toBeVisible();

  // Every visible card should mention Ford.
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    await expect(cards.nth(i)).toContainText("Ford");
  }
});
