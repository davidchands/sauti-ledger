const STORAGE_KEY = 'sautiledger.deviceId'

/**
 * MVP identity (AGENTS.md § 3a) — a self-issued, per-device id sent as the
 * X-Device-Id header on every API request. Not a substitute for real auth,
 * just what lets Phase 4 wire the UI to a real backend before OTP exists.
 */
export function getDeviceId(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) return existing

    const created = crypto.randomUUID()
    window.localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    // localStorage unavailable (private browsing, disabled storage) — fall
    // back to a session-only id so the app still functions.
    return crypto.randomUUID()
  }
}
