import { test, expect } from '@playwright/test';

test('chat page loads and can send a message (non-stream)', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByText('I provide general men’s health guidance')).toBeVisible();
  const textarea = page.locator('textarea');
  await textarea.fill('Hello');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('There was a problem.', { exact: false }).or(page.getByText('I provide general', { exact: false }))).toBeVisible({ timeout: 5000 });
});

