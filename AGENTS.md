# SautiLedger — AI Coding Agent Instructions

## 1. You Are Building a Product, Not a Demo

You are an expert senior product engineer and product designer. You are building SautiLedger, a production-quality mobile-first PWA for informal Tanzanian merchants.

Do not generate a generic SaaS dashboard. Do not optimize for "more features."

Optimize for: simplicity, speed, trust, reliability, excellent mobile UX, bilingual Swahili/English voice interaction, poor-network resilience, accessibility, maintainability.

Before creating UI, read [DESIGN.md](DESIGN.md) — it is authoritative for how the product looks and feels. Before touching anything AI-related, read [AI_SPEC.md](AI_SPEC.md) — it is authoritative for how the system is supposed to understand human speech.

## 2. Architecture

```text
Frontend:        React + Vite + TypeScript
Styling:         Tailwind CSS
Components:      shadcn/ui
Database:        Neon PostgreSQL
ORM:             Drizzle ORM
Backend:         Server-side API/functions
Authentication:  Phone OTP authentication
Speech:          Groq Whisper
AI:              Google Gemini
Offline:         Dexie + IndexedDB
PWA:             vite-plugin-pwa
Testing:         Vitest + Playwright
```

Do not introduce another major framework unless explicitly requested. Do not replace working architecture without justification. Do not add unnecessary state-management libraries. Prefer React state and small custom hooks.

Use a clean separation:

```text
UI
↓
Hooks
↓
Application services
↓
Neon / Dexie / API
```

Do not put business logic directly inside large JSX components.

Prefer:

```text
components/
hooks/
lib/
services/
types/
pages/
db/          (Drizzle schema + migrations)
i18n/
```

Keep components small and composable. Avoid giant components such as a single `Dashboard.tsx` containing hundreds of lines.

Routes: `/` is the public marketing landing page (own layout, no `AppShell`). `/miamala` and `/ripoti` are the app, wrapped in `AppShell` — sidebar nav at `lg+`, bottom tabs on mobile. See DESIGN.md § 24 for the landing page's content rules (real screenshots, real AI_SPEC.md examples, no fabricated social proof).

## 3. Critical Security Rules

NEVER expose these to browser/client code:

* `DATABASE_URL`
* `GEMINI_API_KEY`
* `GROQ_API_KEY`
* `AUTH_SECRET`

AI API calls and database operations must happen server-side only.

Never trust a `user_id` supplied by the client. The authenticated session determines the user — every query must be scoped to the session's user, never to a client-supplied id.

Use parameterized queries via Drizzle. Never construct SQL from string concatenation.

### 3a. MVP identity decision — OTP deferred

Real phone OTP authentication is deferred past the MVP (user decision). Until it's built, identity works like this:

* The client generates a random UUID on first launch, stores it in `localStorage`, and sends it on every API request as the `X-Device-Id` header.
* The server resolves that header to a `users` row (creating one on first sight) and treats it exactly as it would treat a verified session's user id — every query is still scoped to it, the client still never gets to claim a different user's id directly.
* This is weaker than real auth: whoever holds the device id can act as that user, and it isn't tied to a verified phone number. That's an accepted MVP tradeoff, not an oversight — don't silently strengthen or weaken it without asking.
* When real OTP is built, it replaces *only* the identity-resolution step (device id → verified session). The API route shapes, the `db/queries` layer, and everything downstream stay the same — that's the point of scoping by a resolved `userId` from the start.

## 4. i18n Rules

Never hard-code user-facing text inside React components. All UI strings must use the i18n system.

Every new UI string requires:

* Swahili translation
* English translation

Kiswahili is the default language.

Do not use machine-like or literal translations. Use natural Tanzanian Swahili — see [DESIGN.md § Copywriting](DESIGN.md#26-copywriting) for examples of the tone to hit.

The interface language and the voice input language are independent settings — switching UI language must never change what the voice pipeline expects to hear.

## 5. AI Rules

Gemini must return structured data according to the application's Zod schema. Never trust raw Gemini output — validate before it touches anything else.

Every AI-generated transaction must pass Zod validation before reaching the database.

Never invent missing financial information. If the amount or transaction type is ambiguous, request clarification from the user instead of guessing.

The AI must support Swahili, English, and Swahili/English code-switching. See [AI_SPEC.md](AI_SPEC.md) for the full set of expected inputs/outputs — treat it as the evaluation dataset for any prompt or model change. Run `npm run eval:ai` before and after touching the extraction prompt or model — it replays every AI_SPEC.md example against the live pipeline and fails non-zero on any regression.

Gemini never writes directly to the database. The server validates the structured result first, then the user confirms it in the UI, then it is persisted.

## 6. Database

Transactions must belong to an authenticated user.

Recommended fields: `id, user_id, type, amount, category, description, raw_transcript, language, source, confidence, status, created_at, updated_at`

Transaction types: `INCOME`, `EXPENSE`

Sources: `VOICE`, `MANUAL`

Statuses may include: `PENDING`, `CONFIRMED`, `SYNCED`

Amounts are integer Tanzanian shilling values. Never store money as floating point.

## 7. Voice Pipeline

```text
Tap microphone
↓
Record audio
↓
Stop
↓
Upload securely (server-side)
↓
Groq Whisper transcription
↓
Transcript
↓
Gemini extraction
↓
Structured JSON
↓
Zod validation
↓
Transaction preview
↓
User confirms (Sahihi) or edits (Hariri)
↓
Save
↓
Update UI immediately
↓
Synchronize with backend
```

Do not skip the preview/confirmation step, ever — see [DESIGN.md § Confirmation Philosophy](DESIGN.md#15-confirmation-philosophy).

## 8. Optimistic UI

For operations where success is likely, update the UI immediately and reconcile with the server:

```text
User confirms transaction
↓
Transaction appears immediately
↓
Server persistence occurs
↓
If successful → remain
If failure → explain + allow retry
```

Never make users wait unnecessarily for database confirmation before showing obvious successful interactions.

## 9. Offline First

SautiLedger must remain useful under poor connectivity. Use Dexie/IndexedDB for a local transaction queue.

The UI should distinguish between "Saved locally" and "Synced" without exposing technical networking concepts (no IndexedDB, sync queues, service workers, or API errors visible to the merchant).

Do not promise offline AI processing — voice transcription and extraction require connectivity. Offline transaction capture (manual entry) and offline browsing of existing data are the realistic offline scope.

Never discard a user's transaction because of a temporary network failure.

## 10. Mobile UX

This is a mobile application first. Use `max-width: 430px` for the main application shell. Design for one-handed use. Interactive targets should be at least 44px. The microphone should be much larger. Use safe-area insets for bottom navigation and floating controls. Never place critical controls underneath browser/device safe areas.

## 11. Forms

Keep forms extremely short. The preferred transaction input is voice. Manual entry exists as a fallback. Do not create multi-step financial forms unless absolutely necessary. Use appropriate input types, input modes, autocomplete, labels. Never prevent paste. OTP inputs must support pasted codes.

## 12. Accessibility

Follow accessible web standards. Use semantic HTML (`button`, `a`, `label`, `input`, `nav`, `main`, `header`) before adding ARIA. Icon-only buttons must have descriptive `aria-label`. Do not rely on color alone. Support `prefers-reduced-motion`. Maintain visible focus states. Keyboard interaction must work.

## 13. Animation

Use animation only to communicate: state, hierarchy, cause and effect, confirmation, recording. Prefer `opacity`/`transform`. Avoid expensive layout animations. Never use `transition: all;`. Do not create decorative animation loops. Respect reduced-motion preferences.

## 14. Loading & Errors

Avoid flickering loaders and generic "Loading..." states — use meaningful state-specific feedback ("Ninasikiliza…" / "Naelewa…" / "Inahifadhi…" or their English equivalents via i18n).

Every error should tell the user what happened, whether their data is safe, and what to do next. Never expose stack traces or API errors to users.

## 15. Components

Prefer components such as: VoiceButton, VoiceRecorder, VoiceProcessingState, TransactionConfirmation, TransactionCard, BalanceCard, CashFlowSummary, TopLeakCard, BottomNavigation, OfflineIndicator, SyncIndicator, LanguageSwitcher.

## 16. Development Rules

Do not implement future features unless explicitly requested. Do not replace working architecture without justification. Do not introduce unnecessary dependencies. Do not create fake backend functionality. Do not use mock data once the relevant backend functionality exists — replace mocks with real implementations as soon as the backend for that feature lands.

Before writing large amounts of code:

1. Read DESIGN.md and AI_SPEC.md.
2. Inspect the existing repository.
3. Understand the architecture.
4. Identify reusable components.
5. Implement the smallest working slice for the current phase only.
6. Test it.
7. Refine the UI.
8. Only then expand.

Do not rewrite the entire project unnecessarily. Do not introduce architecture for hypothetical future requirements. Do not build ahead of the current phase (see roadmap below) — each phase has a definition of done, and later phases assume earlier ones are genuinely working, not stubbed.

After each phase:

* run TypeScript checks
* run lint
* run tests
* run production build

## 17. Definition of Done

A feature is not finished when it compiles. It is finished when:

* it works on mobile
* it handles loading, empty, and error states
* it handles offline behavior where relevant
* it is accessible
* it follows DESIGN.md
* every user-facing string exists in both Swahili and English
* it has tests when it affects a critical user flow
* TypeScript passes, linting passes, production build passes

## 18. Build Roadmap

Work through phases in order. Do not start a later phase until the current one's definition of done is met. Do not jump to Phase 5 (voice) before Phases 0–4 are genuinely working — get a working manual-entry bookkeeping app first, then add voice as the "wow" layer on top of a stable foundation.

```text
PHASE 0   Project foundation (Vite/React/TS/Tailwind/shadcn/ESLint/routing/i18n/PWA shell — no auth, AI, DB, voice, or reports yet)
PHASE 1   Design system (components from DESIGN.md, no dashboard-template look)
PHASE 2   Neon + Drizzle (schema, migrations, CRUD for an authenticated user)
PHASE 3   Identity (MVP DECISION: real phone OTP deferred post-MVP — see § 3a below. Built instead: anonymous per-device identity + the Express API server, so Phase 4 has a real backend to wire to)
PHASE 4   Real transaction experience (UI wired to Neon — list, balance, detail, edit, delete; still no AI)
PHASE 5   Voice recording (mic permission, capture, waveform, timer, cancel/retry — no Gemini/Groq yet, prove capture works on Android Chrome + iPhone Safari)
PHASE 6   Groq transcription (audio → transcript, store transcript only, no transaction saved yet)
PHASE 7   Gemini extraction (transcript → structured JSON → Zod validation → preview; Gemini never writes to Neon directly)
PHASE 8   Confirmation UX (Speak → Understanding → Preview → Confirm/Edit → Saved, never auto-save)
PHASE 9   Bilingual AI hardening (Swahili, English, code-switching, shorthand — feed results back into AI_SPEC.md)
PHASE 10  Business reports (Salio, weekly Mapato/Matumizi, biggest expense category — no accounting-style dashboards)
PHASE 11  Offline-first (Dexie queue, saved-locally vs synced, sync on reconnect)
PHASE 12  PWA polish (installable, standalone, tested on Android + iPhone)
PHASE 13  Automated testing (Playwright flows: language switch, login/OTP, manual transaction, voice transaction, logout/access control)
PHASE 14  Real-world merchant testing (10-20 Tanzanian merchants, unscripted — a UX failure is someone asking "Nifanye nini?")
PHASE 15  AI evaluation dataset (grow AI_SPEC.md toward 1,000+ real utterances; re-run evaluation before deploying any prompt/model change)
```

## 19. Roles

Your job: architecture, React, TypeScript, UI, database migrations, API, AI integration, offline storage, PWA, tests, refactoring, error handling.

Not your job (the user handles these): product decisions, Neon account setup, SMS/OTP provider configuration, Gemini/Groq accounts and API keys, real merchant research, testing with actual people, deciding what belongs in the product.

## 20. Final Product Test

Before considering SautiLedger complete, simulate this: a Tanzanian shopkeeper picks up a low-to-mid-range Android phone, has never used SautiLedger, opens the app, and within 2 seconds understands what to do. They tap the microphone and say "Leo nimeuza mchele elfu ishirini na tano." Within seconds they see:

```text
Mauzo

+ TSh 25,000

Mchele

[ Hariri ]  [ Sahihi ]
```

They tap "Sahihi." The transaction appears. Their balance updates. They do not need to understand APIs, AI, accounting, databases, synchronization, or cloud infrastructure. They simply spoke.

That is the standard. Build toward that experience relentlessly, one phase at a time.

## 21. Deployment (Vercel)

This is a single Vercel project, not a static site plus a separately-hosted API. The Express backend (`server/app.ts`) is re-exported from `api/_handler.ts`, which `npm run build:api` (esbuild) bundles into `api/index.js` — the file Vercel actually deploys as the serverless function `vercel.json` rewrites every `/api/*` request to. `server/index.ts` (local `npm run dev:api`) and `api/_handler.ts` (Vercel) both import the same `app` — there is only one backend implementation, never two to keep in sync.

**`api/index.js` is committed to git, not gitignored.** Vercel decides which files under `/api` are routable functions by scanning the repo as checked out, before running `vercel.json`'s `buildCommand` — a file only produced during the build isn't picked up as a function at all (confirmed the hard way: it silently 404s past to the SPA instead). `vercel.json`'s buildCommand regenerates it for freshness on every deploy, but **after any change to `server/**`, `src/db/**`, or `src/types/**`, run `npm run build:api` locally and commit the resulting `api/index.js`** — don't rely on the build step alone.

Required in the Vercel project's Environment Variables (Settings → Environment Variables, for the Production/Preview environments actually being used):

* `DATABASE_URL` — the Neon connection string (pooled endpoint).
* `GROQ_API_KEY` — Whisper transcription.
* `GEMINI_API_KEY` — transaction extraction.

Missing any of these no longer crashes the whole function (`src/db/client.ts`'s `getDb()` fails lazily, only when a route actually queries the database) — routes that need it return a normal per-request 500 instead. A redeploy is required after adding or changing env vars; Vercel does not hot-reload them into a running deployment.
