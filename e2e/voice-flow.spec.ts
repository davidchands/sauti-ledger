import { test, expect } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

/**
 * Runs only under the "Voice (Chromium, fake mic)" project (see
 * playwright.config.ts) — Chromium's --use-fake-device-for-media-stream
 * gives MediaRecorder a real synthetic signal to capture, so this
 * exercises the actual permission/record/stop/review mechanics from
 * Phase 5, not a stub. Groq and Gemini are mocked: this is a UI-flow
 * regression test, not a re-verification of transcription/extraction
 * accuracy (that's eval/run.ts's job — see AI_SPEC.md § 5).
 */
test.describe('voice transaction', () => {
  let deviceId: string

  test.beforeEach(async ({ page }, testInfo) => {
    deviceId = deviceIdFor(testInfo.title)
    await withDeviceId(page, deviceId, { language: 'en' })

    await page.route('**/api/transcribe', async (route) => {
      await route.fulfill({
        json: { transcript: 'Leo nimeuza mchele elfu ishirini', language: 'Swahili' },
      })
    })
    await page.route('**/api/extract', async (route) => {
      await route.fulfill({
        json: {
          type: 'INCOME',
          amount: 20000,
          category: 'Sales',
          description: 'Mchele',
          confidence: 0.95,
          needsClarification: false,
        },
      })
    })

    await page.goto('/miamala')
  })

  test.afterEach(async () => {
    await cleanupDevice(deviceId)
  })

  test('record -> stop -> use -> confirm saves the transaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Speak' }).click()

    await expect(page.getByText('Listening…')).toBeVisible()
    await page.getByRole('button', { name: 'Stop' }).click()

    await expect(page.getByRole('button', { name: 'Use this' })).toBeVisible()
    await page.getByRole('button', { name: 'Use this' }).click()

    // Confirmation preview built from the mocked /api/extract response.
    await expect(page.getByText('+ TSh 20,000')).toBeVisible()
    await expect(page.getByText('Mchele')).toBeVisible()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Saved')).toBeVisible()
    await expect(page.getByText('+ TSh 20,000')).toBeVisible()
    await expect(page.getByText('Sales · Mchele')).toBeVisible()
  })

  test('cancel during recording discards without saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Speak' }).click()
    await expect(page.getByText('Listening…')).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })
})
