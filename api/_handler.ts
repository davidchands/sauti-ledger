import { app } from '../server/app'

/**
 * Vercel Node.js serverless function source. Not deployed directly —
 * `npm run build:api` (esbuild) bundles this and its entire first-party
 * import graph (server/app.ts, src/db/*, src/types/*, ...) into a
 * single self-contained api/index.js before deploy.
 *
 * Why bundle instead of letting Vercel compile this file per-file: this
 * project's package.json has "type": "module", so Node resolves
 * relative imports as strict ESM at runtime and requires an explicit
 * file extension (`./app.js`, not `./app`). TypeScript source
 * throughout this repo is written extension-less (the Vite/bundler
 * convention used everywhere else in the project), and Vercel's
 * per-file TS-to-JS builder doesn't rewrite import specifiers to add
 * one — every relative import failed at runtime with "Cannot find
 * module '/var/task/server/app'" as a result, even with a plain static
 * import. Bundling into one file removes cross-file relative-import
 * resolution from the equation entirely; only npm package imports
 * (express, pg, drizzle-orm, ...) remain, which Node resolves normally
 * since esbuild leaves them as real `require`/`import` calls against
 * node_modules rather than inlining them.
 */
export default app
