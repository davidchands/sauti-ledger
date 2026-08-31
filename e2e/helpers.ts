import 'dotenv/config'
import { eq } from 'drizzle-orm'
import type { Page } from '@playwright/test'
import { getDb } from '../src/db/client'
import { users } from '../src/db/schema'

export function deviceIdFor(testName: string): string {
  const slug = testName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `e2e-${slug}-${crypto.randomUUID()}`
}

/**
 * Pins the app's identity before any page script runs, so tests are
 * deterministic. Language is left untouched by default — the app's real
 * default is Swahili (AGENTS.md § 4) with no stored preference at all, and
 * language-switch.spec.ts relies on that genuine default. Tests that
 * aren't about language pass `{ language: 'en' }` explicitly for
 * readability.
 */
export async function withDeviceId(
  page: Page,
  deviceId: string,
  options?: { language?: 'sw' | 'en' },
) {
  await page.addInitScript(
    ({ id, language }) => {
      window.localStorage.setItem('sautiledger.deviceId', id)
      if (language) window.localStorage.setItem('sautiledger.language', language)
    },
    { id: deviceId, language: options?.language },
  )
}

/** users.transactions cascade-deletes, so removing the user is enough. */
export async function cleanupDevice(deviceId: string) {
  await getDb().delete(users).where(eq(users.deviceId, deviceId))
}
