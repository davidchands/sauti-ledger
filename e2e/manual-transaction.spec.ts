import { test, expect } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

test.describe('manual transaction', () => {
  let deviceId: string

  test.beforeEach(async ({ page }, testInfo) => {
    deviceId = deviceIdFor(testInfo.title)
    await withDeviceId(page, deviceId, { language: 'en' })
    await page.goto('/miamala')
    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })

  test.afterEach(async () => {
    await cleanupDevice(deviceId)
  })

  test('creating a transaction updates the list and balance', async ({ page }) => {
    await page.getByRole('button', { name: 'Add manually' }).click()

    await page.getByRole('spinbutton').fill('25000')
    await page.getByRole('textbox').fill('Mchele')
    await page.getByRole('button', { name: 'Save' }).click()

    // getByText does substring matching, and "+ TSh 25,000" (the row)
    // contains "TSh 25,000" (the balance) — exact:true avoids ambiguity.
    await expect(page.getByText('TSh 25,000', { exact: true })).toBeVisible()
    await expect(page.getByText('+ TSh 25,000')).toBeVisible()
    await expect(page.getByText('Sales · Mchele')).toBeVisible()
  })

  test('editing a transaction updates the balance', async ({ page }) => {
    await page.getByRole('button', { name: 'Add manually' }).click()
    await page.getByRole('spinbutton').fill('10000')
    await page.getByRole('textbox').fill('Test item')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('+ TSh 10,000')).toBeVisible()

    await page.getByText('Sales · Test item').click()
    await page.getByRole('spinbutton').fill('40000')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('TSh 40,000', { exact: true })).toBeVisible()
  })

  test('deleting a transaction removes it and resets the balance', async ({ page }) => {
    await page.getByRole('button', { name: 'Add manually' }).click()
    await page.getByRole('spinbutton').fill('15000')
    await page.getByRole('textbox').fill('Removable entry')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('+ TSh 15,000')).toBeVisible()

    await page.getByText('Sales · Removable entry').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()

    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })
})
