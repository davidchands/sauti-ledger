import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

/**
 * Server-only. Never import this file from UI code — DATABASE_URL must
 * never reach the browser bundle (AGENTS.md § 3).
 */
if (typeof window !== 'undefined') {
  throw new Error('src/db/client.ts must never be imported in browser code')
}

type Db = ReturnType<typeof drizzle<typeof schema>>

let db: Db | null = null

/**
 * Lazy on purpose: throwing here happens on first actual query, not at
 * module-evaluation time. On Vercel, every route is imported eagerly by
 * server/app.ts (Express registers all of them up front), so a
 * top-level throw for a missing DATABASE_URL used to crash the entire
 * serverless function — including routes that never touch the database,
 * like /api/health — with no detail reaching the client. Each caller
 * already awaits this inside a try/catch (see resolveUser.ts and the
 * route handlers), so a missing/bad connection string now surfaces as a
 * normal per-request 500 with a real message instead.
 */
export function getDb(): Db {
  if (db) return db

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new Pool({ connectionString })
  db = drizzle(pool, { schema })
  return db
}
