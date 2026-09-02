import { test, expect } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

/**
 * Stands in for the roadmap's "logout -> cannot access private transactions"
 * test. There's no login/logout in this MVP (AGENTS.md § 3a) — identity is
 * per-device instead. The equivalent access-control guarantee is that one
 * device can never see another device's transactions, which is what this
 * verifies end-to-end through the real UI and API, not just the CRUD layer
 * (already covered at the query level by src/db/queries/transactions.test.ts).
 */
test.describe('device isolation', () => {
  let deviceA: string
  let deviceB: string

  test.beforeEach(({}, testInfo) => {
    deviceA = deviceIdFor(`${testInfo.title}-a`)
    deviceB = deviceIdFor(`${testInfo.title}-b`)
  })

  test.afterEach(async () => {
    await cleanupDevice(deviceA)
    await cleanupDevice(deviceB)
  })

  test('a second device never sees the first device\'s transactions', async ({ browser }) => {
    const contextA = await browser.newContext()
    const pageA = await contextA.newPage()
    await withDeviceId(pageA, deviceA, { language: 'en' })
    await pageA.route('**/api/extract', async (route) => {
      await route.fulfill({
        json: {
          transactions: [
            {
              type: 'INCOME',
              amount: 50000,
              category: 'Sales',
              description: 'Device A sale',
              confidence: 0.95,
              needsClarification: false,
            },
          ],
        },
      })
    })
    await pageA.goto('/miamala')

    await pageA.getByRole('button', { name: 'Or type instead' }).click()
    await pageA.getByPlaceholder('Type what happened…').fill('Nimeuza device A sale kwa 50000')
    await pageA.getByRole('button', { name: 'Send' }).click()
    await expect(pageA.getByRole('dialog', { name: 'Confirm transaction' })).toBeVisible()
    await pageA.getByRole('button', { name: 'Confirm' }).click()
    await expect(pageA.getByText('+ TSh 50,000')).toBeVisible()
    await contextA.close()

    const contextB = await browser.newContext()
    const pageB = await contextB.newPage()
    await withDeviceId(pageB, deviceB, { language: 'en' })
    await pageB.goto('/miamala')

    await expect(pageB.getByText('No transactions yet.')).toBeVisible()
    await expect(pageB.getByText('Device A sale')).not.toBeVisible()
    await expect(pageB.getByText('TSh 0', { exact: true })).toBeVisible()
    await contextB.close()
  })
})
