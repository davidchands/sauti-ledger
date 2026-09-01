import { test, expect, type Page } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

/**
 * Creating a transaction is chat-style manual entry now (types a
 * message, the same extraction pipeline voice uses turns it into a
 * transaction) rather than filling in a form. /api/extract is mocked
 * here — this is a UI-flow regression test, not a re-verification of
 * extraction accuracy (that's eval/run.ts's job).
 */
async function mockExtract(
  page: Page,
  transaction: {
    type: 'INCOME' | 'EXPENSE'
    amount: number
    category: string
    description: string
  },
) {
  await page.route('**/api/extract', async (route) => {
    await route.fulfill({
      json: { transactions: [{ ...transaction, confidence: 0.95, needsClarification: false }] },
    })
  })
}

async function createViaChat(page: Page, message: string) {
  await page.getByPlaceholder('Type what happened…').fill(message)
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByRole('dialog', { name: 'Confirm transaction' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('Saved')).toBeVisible()
}

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
    await mockExtract(page, {
      type: 'INCOME',
      amount: 25000,
      category: 'Sales',
      description: 'Mchele',
    })

    await createViaChat(page, 'Nimeuza mchele kwa 25000')

    // getByText does substring matching, and "+ TSh 25,000" (the row)
    // contains "TSh 25,000" (the balance) — exact:true avoids ambiguity.
    await expect(page.getByText('TSh 25,000', { exact: true })).toBeVisible()
    await expect(page.getByText('+ TSh 25,000')).toBeVisible()
    await expect(page.getByText('Sales · Mchele')).toBeVisible()
  })

  test('editing a transaction updates the balance', async ({ page }) => {
    await mockExtract(page, {
      type: 'INCOME',
      amount: 10000,
      category: 'Sales',
      description: 'Test item',
    })
    await createViaChat(page, 'Nimeuza test item kwa 10000')
    await expect(page.getByText('+ TSh 10,000')).toBeVisible()

    await page.getByText('Sales · Test item').click()
    await page.getByRole('spinbutton').fill('40000')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('TSh 40,000', { exact: true })).toBeVisible()
  })

  test('deleting a transaction removes it and resets the balance', async ({ page }) => {
    await mockExtract(page, {
      type: 'INCOME',
      amount: 15000,
      category: 'Sales',
      description: 'Removable entry',
    })
    await createViaChat(page, 'Nimeuza removable entry kwa 15000')
    await expect(page.getByText('+ TSh 15,000')).toBeVisible()

    await page.getByText('Sales · Removable entry').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()

    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })
})
