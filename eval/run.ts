import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { evalDataset } from './dataset'
import type { ExtractedTransaction } from '../src/types/extraction'
import { getDb } from '../src/db/client'
import { users } from '../src/db/schema'

const API_URL = process.env.EVAL_API_URL ?? 'http://localhost:8787'
const DEVICE_ID = `eval-${crypto.randomUUID()}`

interface Result {
  transcript: string
  pass: boolean
  reason?: string
  actual?: ExtractedTransaction
}

// Every dataset case here describes a single transaction (multi-transaction
// extraction — AI_SPEC.md § 3a — isn't covered by this per-case dataset
// shape), so a case fails outright if Gemini splits or merges unexpectedly.
async function extract(transcript: string): Promise<ExtractedTransaction> {
  const response = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Device-Id': DEVICE_ID },
    body: JSON.stringify({ transcript }),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  }
  const { transactions } = (await response.json()) as { transactions: ExtractedTransaction[] }
  if (transactions.length !== 1) {
    throw new Error(`expected 1 transaction, got ${transactions.length}`)
  }
  return transactions[0]
}

async function main() {
  const results: Result[] = []

  for (const testCase of evalDataset) {
    try {
      const actual = await extract(testCase.transcript)
      const { expected } = testCase

      const typeMatches = actual.type === expected.type
      const amountMatches = actual.amount === expected.amount
      const categoryMatches =
        expected.category === undefined || actual.category === expected.category

      const pass = typeMatches && amountMatches && categoryMatches
      results.push({
        transcript: testCase.transcript,
        pass,
        actual,
        reason: pass
          ? undefined
          : [
              !typeMatches && `type: expected ${expected.type}, got ${actual.type}`,
              !amountMatches && `amount: expected ${expected.amount}, got ${actual.amount}`,
              !categoryMatches && `category: expected ${expected.category}, got ${actual.category}`,
            ]
              .filter(Boolean)
              .join('; '),
      })
    } catch (error) {
      results.push({
        transcript: testCase.transcript,
        pass: false,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed

  for (const result of results) {
    const icon = result.pass ? '✓' : '✗'
    console.log(`${icon} "${result.transcript}"`)
    if (!result.pass) console.log(`   ${result.reason}`)
  }

  console.log(`\n${passed}/${results.length} passed${failed > 0 ? `, ${failed} failed` : ''}`)

  // The extract endpoint resolves DEVICE_ID to a users row even though it
  // never touches transactions — clean it up so eval runs don't leave cruft.
  await getDb().delete(users).where(eq(users.deviceId, DEVICE_ID))

  if (failed > 0) process.exitCode = 1

  // The open pg Pool would otherwise keep this script alive indefinitely.
  process.exit(process.exitCode ?? 0)
}

main()
