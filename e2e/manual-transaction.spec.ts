import { test, expect, type Page } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

/**
 * Creating a transaction is chat-style entry: type a message, it saves
 * immediately (DESIGN.md § 15, no confirm-before-save step), through the
 * same extraction pipeline voice uses. /api/extract is mocked here —
 * this is a UI-flow regression test, not a re-verification of
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
  // Typing is a secondary entry method, tucked behind a toggle so it
  // doesn't compete with the mic (the primary action).
  await page.getByRole('button', { name: 'Or type instead' }).click()
  await page.getByPlaceholder('Type what happened…').fill(message)
  await page.getByRole('button', { name: 'Send' }).click()
  // Saves immediately, no confirm tap — the toast with Undo is the receipt.
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
}

/** The toast auto-dismisses (~5s) — wait it out so later locators aren't ambiguous between the toast and the list row underneath, which show the same text while both are present. */
async function waitForToastToClear(page: Page) {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeHidden({ timeout: 6000 })
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
    await waitForToastToClear(page)

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
    await waitForToastToClear(page)
    await expect(page.getByText('+ TSh 10,000')).toBeVisible()

    // Tap the row to open the frictionless detail view, tap the amount to
    // edit it in place — no form, no Save button.
    await page.getByText('Sales · Test item').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '+ TSh 10,000', exact: true }).click()
    await page.getByRole('spinbutton').fill('40000')
    await page.keyboard.press('Enter')

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
    await waitForToastToClear(page)
    await expect(page.getByText('+ TSh 15,000')).toBeVisible()

    await page.getByText('Sales · Removable entry').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()

    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })

  test('undoing a saved transaction removes it', async ({ page }) => {
    await mockExtract(page, {
      type: 'INCOME',
      amount: 30000,
      category: 'Sales',
      description: 'Reverse this',
    })
    await createViaChat(page, 'Nimeuza reverse this kwa 30000')
    // Still visible in both the toast and the list at this point — either match confirms the save.
    await expect(page.getByText('Sales · Reverse this').first()).toBeVisible()

    await page.getByRole('button', { name: 'Undo', exact: true }).click()

    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })
})
