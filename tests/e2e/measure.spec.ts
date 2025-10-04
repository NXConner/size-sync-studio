import { test, expect } from '@playwright/test';

// Basic smoke test for Measure page UI elements
// Requires the dev server running locally at PLAYWRIGHT_BASE_URL (default http://localhost:8080)

test.describe('Measure smoke', () => {
  test('loads and toggles modes, basic controls present', async ({ page }) => {
    await page.goto('/measure');

    // Ensure we're on the Measure page by checking a unique section
    await expect(page.getByText('Readouts')).toBeVisible();

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

    // Scroll to reveal lower sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Voice Coach controls visible (scope within the card to avoid onboarding text)
    const voiceCoachCard = page.locator('div:has(h3:has-text("Voice Coach"))').last()
    await expect(voiceCoachCard).toBeVisible()
    await expect(voiceCoachCard.getByText('Enable voice', { exact: true })).toBeVisible()

    // Overlay tools present
    await expect(page.getByText('Overlay Tools')).toBeVisible();

    // HUD visible
    await expect(page.locator('div').filter({ hasText: 'Status:' }).first()).toBeVisible();
  });

  test('Premium toggles render and persist', async ({ page }) => {
    await page.goto('/measure');
    await expect(page.getByText('Readouts')).toBeVisible();

    // Look for Experimental & Premium card title
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const premiumCard = page.locator('div:has-text("Experimental & Premium")').last()
    await expect(premiumCard).toBeVisible()

    // Toggle worker-only and watchdog switches
    const switches = premiumCard.locator('[role="switch"]')
    const count = await switches.count()
    // We expect at least 2 switches in this card (seg + worker + watchdog)
    expect(count).toBeGreaterThanOrEqual(3)

    // Toggle first 2 switches to change preferences
    await switches.nth(1).click()
    await switches.nth(2).click()

    // Validate persistence
    const prefs = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('measure.prefs') || '{}') } catch { return null }
    })
    expect(prefs).toBeTruthy()
    expect(typeof prefs.workerAutoDetect).toBe('boolean')
    expect(typeof prefs.watchdogEnabled).toBe('boolean')
  });
});