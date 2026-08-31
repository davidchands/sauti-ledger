import { ApiError } from './apiClient'

/**
 * ApiError means the server was reached and rejected the request (bad
 * data, not found, etc) — retrying won't help. Anything else thrown by
 * fetch (offline, DNS, connection refused) is a network failure, and per
 * AGENTS.md § 9 we must never discard a transaction because of one.
 */
export function isNetworkError(error: unknown): boolean {
  return !(error instanceof ApiError)
}
