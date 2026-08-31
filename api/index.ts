import { app } from '../server/app'

/**
 * Vercel Node.js serverless function entry point. Vercel invokes the
 * default export as a plain (req, res) request handler per invocation —
 * an Express app instance satisfies that signature directly, so this is
 * the same app server/index.ts runs locally, just without `.listen()`.
 * vercel.json rewrites every /api/* request here.
 */
export default app
