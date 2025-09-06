import { test, expect } from '@playwright/test';

// Basic smoke test for Measure page UI elements
// Requires the dev server running locally at PLAYWRIGHT_BASE_URL (default http://localhost:8080)

test.describe('Measure smoke', () => {
  test('loads and toggles modes, basic controls present', async ({ page }) => {
    await page.goto('/measure');

    // Title or navbar present
    await expect(page.getByText('Measure')).toBeVisible();

    // Tabs: Live / Upload
    const liveTab = page.getByRole('tab', { name: 'Live' });
    const uploadTab = page.getByRole('tab', { name: 'Upload' });
    await expect(liveTab).toBeVisible();
    await expect(uploadTab).toBeVisible();

    // Switch to upload and back to live
    await uploadTab.click();
    await expect(page.getByText('Upload an image to begin measurement')).toBeVisible();
    await liveTab.click();

    // Readouts card content
    await expect(page.getByText('Length:')).toBeVisible();
    await expect(page.getByRole('button', { name: /Capture/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy values/i })).toBeVisible();

    // Voice Coach controls visible
    await expect(page.getByText('Voice Coach')).toBeVisible();
    await expect(page.getByText('Enable voice')).toBeVisible();

    // Overlay tools present
    await expect(page.getByText('Overlay Tools')).toBeVisible();

    // HUD visible
    await expect(page.locator('div').filter({ hasText: 'Status:' }).first()).toBeVisible();
  });
});