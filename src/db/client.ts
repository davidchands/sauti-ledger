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

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString })

export const db = drizzle(pool, { schema })
