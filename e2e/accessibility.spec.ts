import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PUBLIC_BASE_URL = 'http://127.0.0.1:5173';
const ADMIN_BASE_URL = 'http://127.0.0.1:5174';

async function expectNoAccessibilityViolations(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test('public pages have no automated WCAG A/AA violations', async ({ page }) => {
  for (const pathname of ['/', '/contacts', '/privacy']) {
    await expectNoAccessibilityViolations(page, `${PUBLIC_BASE_URL}${pathname}`);
  }
});

test('admin login has no automated WCAG A/AA violations', async ({ page }) => {
  await expectNoAccessibilityViolations(page, `${ADMIN_BASE_URL}/login`);
});
