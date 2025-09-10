import { test, expect } from '@playwright/test'

test.describe('Analytics and Settings flows', () => {
  test('Analytics renders charts and anomalies list', async ({ page }) => {
    await page.goto('http://localhost:8080')
    await page.getByRole('link', { name: 'Analytics' }).click()
    await expect(page).toHaveURL(/.*\/analytics/)
    await expect(page.getByText('Length Trend')).toBeVisible()
    await expect(page.getByText('Girth Trend')).toBeVisible()
    await expect(page.getByText('Recommendations')).toBeVisible()
  })

  test('Settings export buttons visible and data tab works', async ({ page }) => {
    await page.goto('http://localhost:8080')
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/.*\/settings/)
    await page.getByRole('tab', { name: 'Data' }).click()
    await expect(page.getByRole('button', { name: /Export JSON/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Export CSV/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Export PDF/ })).toBeVisible()
  })
})

