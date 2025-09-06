import { test, expect } from '@playwright/test';

test.describe('Measure upload and voice coach', () => {
  test('upload flow shows analyze and readouts, voice coach toggles', async ({ page }) => {
    await page.goto('/measure');

    // Switch to upload mode
    await page.getByRole('tab', { name: 'Upload' }).click();
    await expect(page.getByText('Upload an image to begin measurement')).toBeVisible();

    // File input is present
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    // Voice coach section visible
    await expect(page.getByText('Voice Coach')).toBeVisible();
    await expect(page.getByText('Enable voice')).toBeVisible();

    // Toggle enable voice
    const enableVoiceSwitch = page.getByText('Enable voice').locator('..').locator('input[type="checkbox"]');
    await enableVoiceSwitch.check();

    // Load a preset
    await page.getByText('Load preset').click();
    await page.getByRole('option', { name: 'Concise (inches)' }).click();

    // Readouts should be present in right pane
    await expect(page.getByText('Readouts')).toBeVisible();
    await expect(page.getByText('Length:')).toBeVisible();
  });
});

