import { test, expect } from '@playwright/test'

test.describe('Settings exports and notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080')
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/.*\/settings/)
  })

  test('Data tab: Export JSON/CSV/PDF trigger downloads', async ({ page }) => {
    await page.getByRole('tab', { name: 'Data' }).click()

    const jsonDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: /Export JSON/ }).click()
    const jsonFile = await jsonDownload
    expect(await jsonFile.suggestedFilename()).toMatch(/health_data_.*\.json$/)

    const csvDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: /Export CSV/ }).click()
    const csvFile = await csvDownload
    expect(await csvFile.suggestedFilename()).toMatch(/measurements_.*\.csv$/)

    const pdfDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: /Export PDF/ }).click()
    const pdfFile = await pdfDownload
    expect(await pdfFile.suggestedFilename()).toMatch(/health_report_.*\.pdf$/)
  })

  test('Notifications tab: toggle reminders and apply schedule', async ({ page }) => {
    await page.getByRole('tab', { name: 'Notifications' }).click()
    const remindersToggle = page.getByRole('switch', { name: 'Reminders' })
    await remindersToggle.click()
    // set time if input is present
    const timeInput = page.locator('input#reminder-time')
    if (await timeInput.count()) {
      await timeInput.fill('09:00')
    }
    const applyBtn = page.getByRole('button', { name: /Apply Schedule/ })
    if (await applyBtn.count()) {
      await applyBtn.click()
      await expect(page.getByText(/Daily notifications are active|Reminders scheduled/i)).toBeVisible({ timeout: 3000 })
    }
  })
})

