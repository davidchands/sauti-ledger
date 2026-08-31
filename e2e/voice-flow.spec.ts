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
 * There's no separate "review the recording" step anymore — release
 * chains straight into transcribe -> extract -> the transaction
 * confirmation screen, which is the only human-in-the-loop moment
 * (DESIGN.md's Confirmation Philosophy is about the transaction, not the
 * raw audio).
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

  test('hold the mic, release, and confirm saves the transaction', async ({ page }) => {
    const micButton = page.getByRole('button', { name: 'Speak' })
    const box = await micButton.boundingBox()
    if (!box) throw new Error('mic button not found')

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()

    await expect(page.getByText('Listening…')).toBeVisible()
    // Above MIN_DURATION_MS (400ms) so the release isn't discarded as an
    // accidental tap.
    await page.waitForTimeout(600)

    await page.mouse.up()

    // Confirmation preview built from the mocked /api/extract response —
    // shown automatically, no intermediate "use this recording" step.
    await expect(page.getByText('+ TSh 20,000')).toBeVisible()
    await expect(page.getByText('Mchele')).toBeVisible()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Saved')).toBeVisible()
    await expect(page.getByText('+ TSh 20,000')).toBeVisible()
    await expect(page.getByText('Sales · Mchele')).toBeVisible()
  })

  test('a recording with two transactions steps through both before saving', async ({
    page,
  }) => {
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
    await expect(page.getByText('Listening…')).toBeVisible()
    await page.waitForTimeout(600)
    await page.mouse.up()

    // First transaction shown with a "1/2" progress indicator.
    await expect(page.getByText('1/2')).toBeVisible()
    await expect(page.getByText('+ TSh 20,000')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('Saved')).toBeVisible()

    // Auto-advances to the second transaction instead of closing.
    await expect(page.getByText('2/2')).toBeVisible()
    await expect(page.getByText('− TSh 5,000')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('Saved')).toBeVisible()

    // Both saved and visible in the list once the queue is done.
    await expect(page.getByText('Sales · Mchele')).toBeVisible()
    await expect(page.getByText('Operations · Mafuta')).toBeVisible()
  })

  test('holding Space then pressing Escape cancels without saving', async ({ page }) => {
    // The desktop hotkey (hold Space, scoped to the focused tab — a
    // website can't register a system-wide hotkey the way a native app
    // like Wispr Flow can). Escape while held is the safety valve a
    // touch hold-and-release doesn't have.
    await page.keyboard.down('Space')

    await expect(page.getByText('Listening…')).toBeVisible()

    await page.keyboard.press('Escape')
    await page.keyboard.up('Space')

    await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible()
    await expect(page.getByText('No transactions yet.')).toBeVisible()
  })
})
