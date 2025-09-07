import { test, expect } from '@playwright/test'

test.describe('Measure Experimental ML segmentation toggle', () => {
  test('toggles and persists in localStorage', async ({ page }) => {
    await page.goto('http://localhost:8080/measure')
    await expect(page.getByText('Readouts')).toBeVisible()

    // Scroll to bottom to reveal settings cards
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Find the Experimental card and its switch
    const experimentalCard = page.locator('div:has-text("Experimental")').last()
    await expect(experimentalCard).toBeVisible()

    const expSwitch = experimentalCard.locator('[role="switch"]').first()
    // Toggle on
    const before = await expSwitch.getAttribute('aria-checked')
    await expSwitch.click()
    // When toggled, aria-checked should flip to true
    await expect(expSwitch).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true')

    // Verify persistence in localStorage
    const prefs = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('measure.prefs')
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })
    expect(prefs).toBeTruthy()
    expect(typeof prefs.useMlSegmentation).toBe('boolean')

    // Reload and ensure the switch reflects stored value
    await page.reload()
    await expect(page.getByText('Readouts')).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const experimentalCard2 = page.locator('div:has-text("Experimental")').last()
    const expSwitch2 = experimentalCard2.locator('[role="switch"]').first()
    await expect(expSwitch2).toHaveAttribute('aria-checked', String(prefs.useMlSegmentation))
  })
})

