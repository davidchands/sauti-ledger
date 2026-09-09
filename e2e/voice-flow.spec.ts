import { test, expect } from '@playwright/test'
import { deviceIdFor, withDeviceId, cleanupDevice } from './helpers'

/**
 * Runs only under the "Voice (Chromium, fake mic)" project (see
 * playwright.config.ts) — Chromium's --use-fake-device-for-media-stream
 * gives MediaRecorder a real synthetic signal to capture, so this
 * exercises the actual permission/record/release mechanics of the
 * press-and-hold flow, not a stub. Groq and Gemini are mocked: this is a
 * UI-flow regression test, not a re-verification of transcription/
 * extraction accuracy (that's eval/run.ts's job — see AI_SPEC.md § 5).
 *
 * Release chains straight into transcribe -> extract -> saved, no
 * confirm-before-save step (DESIGN.md § 15, a deliberate product
 * decision) — the toast with Undo is the safety net instead.
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
          transactions: [
            {
              type: 'INCOME',
              amount: 20000,
              category: 'Sales',
              description: 'Mchele',
              confidence: 0.95,
              needsClarification: false,
            },
          ],
        },
      })
    })

    await page.goto('/miamala')
  })

  test.afterEach(async () => {
    await cleanupDevice(deviceId)
  })

  test('hold the mic and release saves the transaction automatically', async ({ page }) => {
    const micButton = page.getByRole('button', { name: 'Speak' })
    const box = await micButton.boundingBox()
    if (!box) throw new Error('mic button not found')

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()

    // Shown in both the live-caption bubble's badge and the label under
    // the button at once — either match confirms recording started.
    await expect(page.getByText('Listening…').first()).toBeVisible()
    // Above MIN_DURATION_MS (400ms) so the release isn't discarded as an
    // accidental tap.
    await page.waitForTimeout(600)

    await page.mouse.up()

    // Saved immediately, no confirm tap — a toast with Undo is the receipt.
    await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()

    // Shown in both the toast and the day's list at once — either match confirms the save.
    await expect(page.getByText('+ TSh 20,000').first()).toBeVisible()
    await expect(page.getByText('Sales · Mchele').first()).toBeVisible()
  })

  test('a recording with two transactions saves both automatically', async ({ page }) => {
    // Overrides the beforeEach mock — Playwright tries the most recently
    // registered matching route first.
    await page.route('**/api/extract', async (route) => {
      await route.fulfill({
        json: {
          transactions: [
            {
              type: 'INCOME',
              amount: 20000,
              category: 'Sales',
              description: 'Mchele',
              confidence: 0.95,
              needsClarification: false,
            },
            {
              type: 'EXPENSE',
              amount: 5000,
              category: 'Operational',
              description: 'Mafuta',
              confidence: 0.95,
              needsClarification: false,
            },
          ],
        },
      })
    })

    const micButton = page.getByRole('button', { name: 'Speak' })
    const box = await micButton.boundingBox()
    if (!box) throw new Error('mic button not found')

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await expect(page.getByText('Listening…').first()).toBeVisible()
    await page.waitForTimeout(600)
    await page.mouse.up()

    // Both saved without any tap.
    await expect(page.getByText('Sales · Mchele').first()).toBeVisible()
    await expect(page.getByText('Operations · Mafuta').first()).toBeVisible()
    await expect(page.getByText('TSh 15,000', { exact: true }).first()).toBeVisible()
  })

  test('holding Space then pressing Escape cancels without saving', async ({ page }) => {
    // The desktop hotkey (hold Space, scoped to the focused tab — a
    // website can't register a system-wide hotkey the way a native app
    // like Wispr Flow can). Escape while held is the safety valve a
    // touch hold-and-release doesn't have.
    // Routes are code-split (App.tsx) — wait for the lazy-loaded page
    // (and its Space-key listener) to actually mount before pressing keys.
    await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible()

    await page.keyboard.down('Space')

    await expect(page.getByText('Listening…').first()).toBeVisible()

    await page.keyboard.press('Escape')
    await page.keyboard.up('Space')

    await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible()
    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })
})
