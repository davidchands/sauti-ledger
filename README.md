# Sauti Ledger

**Ongea tu. Sauti Ledger itaelewa.** Just speak. Sauti Ledger will understand.

A voice-first bookkeeping app for Tanzanian small-business owners. Instead of typing numbers into a form, you hold the microphone and say what happened, in Swahili, English, or a natural mix of both, and Sauti Ledger turns it into a recorded transaction:

> 🎙️ "Leo nimeuza mchele elfu ishirini"
> → **Mauzo · + TSh 20,000 · Mchele**

No accounting knowledge required, no data entry. Works offline, syncs when you're back online, and installs on a phone's home screen like a real app.

## How it works

```
Your voice
  ↓
Groq (Whisper): transcribes the recording
  ↓
Gemini: reads the transcript and extracts type, amount, category, description
  ↓
Saved to your ledger instantly, balance updates right away (undo if it got it wrong)
```

If the AI can't tell whether an amount was income or an expense, or can't make out the number at all, it asks instead of guessing. See [AI_SPEC.md](AI_SPEC.md) for the full behavior spec and the evaluation dataset that keeps it honest.

## System architecture

![Sauti Ledger system architecture, hand-sketched: a phone running the React PWA, offline caching via Dexie and a service worker, a Vercel serverless API in the middle handling transcription (Groq Whisper) and extraction (Gemini), auto-saving to Neon Postgres via Drizzle](docs/architecture-sketch.png)

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Express (Node.js) |
| Database | PostgreSQL (Neon), Drizzle ORM |
| Offline storage | Dexie (IndexedDB) |
| Voice → text | Groq (Whisper Large v3) |
| Text → transaction | Google Gemini |
| PWA | vite-plugin-pwa (installable, offline-capable) |
| Motion | Motion (landing page) |
| Testing | Vitest (unit), Playwright (end-to-end), a custom AI eval harness |

## Getting started

### 1. Prerequisites

- Node.js 22+
- A [Neon](https://neon.tech) Postgres database (or any Postgres connection string)
- A [Groq](https://console.groq.com) API key (free tier is generous, see below)
- A [Google AI Studio](https://aistudio.google.com) Gemini API key

### 2. Install

```bash
git clone https://github.com/davidchands/sauti-ledger.git
cd sauti-ledger
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your own values:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Set up the database

```bash
npm run db:generate   # generate migrations from the schema (only needed after schema changes)
npm run db:migrate     # apply migrations to your database
```

### 5. Run it

```bash
npm run dev
```

This starts both the frontend (`http://localhost:5173`) and the API (`http://localhost:8787`) together. Open the URL, hold the microphone, and speak.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start frontend + API together for local development |
| `npm run build` | Type-check and build the production frontend |
| `npm run typecheck` | Type-check the whole project without emitting output |
| `npm run lint` | Lint the codebase |
| `npm run format` | Format the codebase with Prettier |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run eval:ai` | Run every case in the AI evaluation dataset against the live extraction pipeline |
| `npm run db:studio` | Open Drizzle Studio to browse the database |

## Project structure

```
src/                  React app (pages, components, hooks, i18n)
server/               Express API (routes, resolveUser, Groq/Gemini clients)
api/                  Vercel serverless entry point (bundles server/ for deployment)
eval/                 AI accuracy evaluation dataset + runner
e2e/                  Playwright end-to-end tests
design/               Source design assets (icons, etc.)
AI_SPEC.md            How the voice pipeline is supposed to understand speech
```

## Deployment

The app deploys to [Vercel](https://vercel.com) as a single project: the frontend is a static build, and the Express API runs as one serverless function. One subtlety worth knowing before you touch `server/`, `src/db/`, or `src/types/`: the deployed API function is a committed, pre-bundled file (`api/index.js`), not something Vercel builds fresh from source on every deploy. After changes to any of those directories, run `npm run build:api` and commit the result.

You'll need the same three environment variables (`DATABASE_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`) set in the Vercel project's settings.

## Is Groq free?

Yes, for this app's scale. The free tier gives you 2,000 transcription requests and 8 hours of audio per day with no credit card. Voice recordings here are a few seconds each, so that's easily thousands of transactions a day before you'd need to pay anything.

## Learn more

- [AI_SPEC.md](AI_SPEC.md): the voice/AI pipeline spec and evaluation dataset
