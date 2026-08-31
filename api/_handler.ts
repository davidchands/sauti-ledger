import { app } from '../server/app'

/**
 * Vercel Node.js serverless function source. Not deployed directly —
 * `npm run build:api` (esbuild) bundles this and its entire first-party
 * import graph (server/app.ts, src/db/*, src/types/*, ...) into
 * api/index.js, which IS committed to git (not gitignored) and is what
 * Vercel actually deploys.
 *
 * Two separate things had to be true for this to work, both learned the
 * hard way against a live deployment:
 *
 * 1. Bundling, not per-file compilation. This project's package.json
 *    has "type": "module", so Node resolves relative imports as strict
 *    ESM at runtime and requires an explicit file extension
 *    (`./app.js`, not `./app`). TypeScript source throughout this repo
 *    is written extension-less (the Vite/bundler convention used
 *    everywhere else in the project), and Vercel's per-file TS-to-JS
 *    builder doesn't rewrite import specifiers to add one — every
 *    relative import failed at runtime with "Cannot find module
 *    '/var/task/server/app'", even with a plain static import.
 *    Bundling into one file removes cross-file relative-import
 *    resolution from the equation entirely; --packages=external keeps
 *    npm package imports (express, pg, drizzle-orm, ...) as real
 *    imports Node resolves normally, so only first-party code gets
 *    inlined.
 *
 * 2. The bundled output must be committed, not generated only by
 *    vercel.json's buildCommand. Vercel decides which files under
 *    /api are routable functions by scanning the repo as checked out,
 *    before running any build step — a file only created during the
 *    build isn't picked up as a function. api/index.js is regenerated
 *    by the build for freshness, but it has to already exist in git
 *    for Vercel to know /api routes anywhere at all. Run
 *    `npm run build:api` and commit the result after any change to
 *    server/**, src/db/**, or src/types/** that ships to production.
 */
export default app
