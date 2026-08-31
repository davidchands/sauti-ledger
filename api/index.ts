import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Express } from 'express'

/**
 * Vercel Node.js serverless function entry point. vercel.json rewrites
 * every /api/* request here.
 *
 * The app import is deliberately dynamic and wrapped in try/catch rather
 * than a static top-level `import { app } from '../server/app'`. A
 * static import that throws during module evaluation (e.g.
 * src/db/client.ts's synchronous `if (!DATABASE_URL) throw`) takes the
 * whole function down before this handler body ever runs, and Vercel
 * only reports it to the client as an opaque "FUNCTION_INVOCATION_FAILED"
 * with no detail — which is indistinguishable from a real crash. This
 * turns that into a JSON error naming what actually failed (a missing
 * env var, a bad connection string) so a misconfigured deployment is
 * diagnosable from the response itself, not just Vercel's function logs.
 */
let appPromise: Promise<Express> | null = null

function loadApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = import('../server/app').then((m) => m.app)
  }
  return appPromise
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await loadApp()
    app(req, res)
  } catch (error) {
    appPromise = null // let the next request retry instead of caching a permanent failure
    console.error('Serverless function failed to initialize', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'Server failed to start',
        detail: error instanceof Error ? error.message : String(error),
      }),
    )
  }
}
