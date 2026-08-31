import { test, expect } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

test.describe('language switching', () => {
  let deviceId: string

  test.beforeEach(async ({ page }, testInfo) => {
    deviceId = deviceIdFor(testInfo.title)
    await withDeviceId(page, deviceId)
  })

  test.afterEach(async () => {
    await cleanupDevice(deviceId)
  })

  test('defaults to Swahili and switches to English', async ({ page }) => {
    await page.goto('/miamala')

    await expect(page.getByText('Salio la sasa')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Miamala' })).toBeVisible()

    // The button's accessible name is the (language-dependent) aria-label,
    // not its visible "SW"/"EN" text — filter by text content instead.
    await page.getByRole('button').filter({ hasText: 'SW' }).click()

    await expect(page.getByText('Current balance')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Transactions' })).toBeVisible()
  })

  test('persists the chosen language across a reload', async ({ page }) => {
    await page.goto('/miamala')
    await page.getByRole('button').filter({ hasText: 'SW' }).click()
    await expect(page.getByText('Current balance')).toBeVisible()

    await page.reload()

    await expect(page.getByText('Current balance')).toBeVisible()
    await expect(page.getByRole('button').filter({ hasText: 'EN' })).toBeVisible()
  })
})
