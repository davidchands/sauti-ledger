import { app } from '../server/app'

/**
 * Vercel Node.js serverless function entry point. Vercel invokes the
 * default export as a plain (req, res) request handler per invocation —
 * an Express app instance satisfies that signature directly, so this is
 * the same app server/index.ts runs locally, just without `.listen()`.
 * vercel.json rewrites every /api/* request here.
 *
 * This must be a static import, not `await import(...)` — Vercel's
 * build-time file tracer follows static imports to decide which files
 * ship with the function bundle, and a dynamic import here left
 * server/app.ts (and everything it imports) out of the deployed
 * function entirely ("Cannot find module '/var/task/server/app'").
 * Per-request diagnosability instead comes from src/db/client.ts
 * failing lazily on first use (see that file) rather than at import
 * time, so a missing env var doesn't crash module evaluation for every
 * route — including ones that never touch the database.
 */
export default app
