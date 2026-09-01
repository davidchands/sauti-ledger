# SautiLedger Design System

This file defines how Sauti Ledger looks and feels. It is the visual and product-experience language, not the technical implementation. For how the AI is supposed to understand human speech see [AI_SPEC.md](AI_SPEC.md).

## 1. Product Identity

SautiLedger is a voice-first financial companion for Tanzanian microbusinesses.

The interface should feel:

* Calm
* Extremely simple
* Premium
* Trustworthy
* Fast
* Human
* Local

It should NOT look like:

* Traditional accounting software
* A generic SaaS dashboard
* A banking application
* A complicated POS system

It is NOT traditional accounting software.

It should feel closer to:

* speaking to a trusted assistant
* sending a voice note
* checking your wallet balance
* quickly understanding how your business is doing

than to:

* QuickBooks
* Excel
* enterprise accounting software
* a corporate banking dashboard

### Core product promise

"Ongea tu. SautiLedger itaelewa."

The primary interaction is:

Speak → Understand → Confirm → Done

The user should never feel like they are "doing bookkeeping." They should feel like they are simply telling SautiLedger what happened.

## 2. Design Personality

SautiLedger should feel:

* Minimal
* Calm
* Trustworthy
* Human
* Fast
* Premium
* Local
* Friendly
* Quietly intelligent
* Extremely easy to understand

Avoid:

* Corporate
* Overly colorful
* Dashboard-heavy
* Technical
* Financial jargon
* Excessive cards
* Excessive gradients
* Excessive shadows
* Decorative animations
* Dense tables
* Tiny controls
* "AI startup" visual clichés

The interface should communicate confidence through simplicity.

## 3. Primary Design Principle

One screen. One obvious action.

When the merchant opens SautiLedger, they should immediately understand:

1. How much money they currently have.
2. What happened recently.
3. How to record something.

The microphone is the primary action. The user should not have to search for it.

## 4. Visual Inspiration

The product may take inspiration from premium minimalist mobile products such as Mon AI.

However: DO NOT copy another application's branding, exact layouts, logos, illustrations, colors, typography, or proprietary visual assets.

Borrow principles, not identity.

Desired characteristics:

* generous whitespace
* strong hierarchy
* large financial numbers
* restrained color
* subtle motion
* soft surfaces
* simple navigation
* one dominant action
* short labels
* excellent spacing

## 5. Language

SautiLedger is bilingual.

Supported UI languages:

* Kiswahili
* English

Default: Kiswahili.

The user can switch languages at any time.

Every user-facing string must exist in both languages.

The interface language and voice input language are independent — a user can read the UI in English while speaking Swahili, or the reverse.

The user may speak:

* Swahili
* English
* Swahili/English mixed speech

The system must understand all three. See [AI_SPEC.md](AI_SPEC.md) for concrete examples.

## 6. Mobile First

SautiLedger is primarily a mobile application.

Design for 360px–430px mobile screens first.

Design for:

1. Android phones
2. iPhones
3. Small/medium screens
4. Slow networks
5. Touch interaction

Desktop is secondary. The default application shell should behave like a native mobile application.

Recommended content width: `max-width: 430px`

Primary actions must be reachable with one hand. Touch targets should generally be at least 44px. Avoid dense tables and traditional accounting layouts.

The UI may expand on larger screens, but the primary experience should remain visually similar to a premium mobile app. Never design desktop first and simply shrink it.

## 7. Application Structure

Primary navigation:

* Miamala
* Ripoti

The microphone should be the dominant action between them.

Conceptually:

```text
┌───────────────────────────┐
│                           │
│       SAUTILEDGER         │
│                           │
│      TSh 284,500          │
│      Salio la sasa       │
│                           │
│  ───────────────────────  │
│                           │
│       Leo                 │
│                           │
│  + TSh 25,000             │
│  Mauzo                    │
│                           │
│  - TSh 10,000             │
│  Mafuta                   │
│                           │
│                           │
│          ● 🎙             │
│                           │
├───────────────────────────┤
│ Miamala        Ripoti      │
└───────────────────────────┘
```

The exact implementation can differ. The hierarchy cannot.

## 8. Color System

Color should be restrained. Use mostly neutral surfaces and typography.

### Semantic colors

**Income:** Green — used for positive cash movement. Never use green simply as decoration.

**Expense:** Red — used for negative cash movement.

**Warning:** Amber — used for meaningful warnings only.

**Neutral:** Primary background, secondary surface, borders, muted text.

Do not create a rainbow interface. Do not use gradients unless there is a compelling functional reason. Do not use color as the only indication of transaction type.

Always combine color with:

* sign
* label
* icon where appropriate

Example: `+ TSh 25,000 · Mauzo` not merely a green number.

## 9. Typography

Typography must prioritize readability. Use a modern, highly legible sans-serif.

Recommended hierarchy:

* **Primary balance** — very large. Example: `TSh 284,500`
* **Section heading** — medium/semibold. Example: `Leo`
* **Transaction amount** — medium/semibold. Example: `+ TSh 25,000`
* **Supporting information** — small/regular. Example: `Mauzo · Mchele`

Avoid excessive font weights. Avoid uppercase text except where it genuinely improves hierarchy. Use tabular numerals for financial values.

## 10. Spacing

Use a consistent spacing system. Prefer: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px.

Most screens should breathe. Do not fill every available pixel. Whitespace is part of the product.

## 11. Border Radius

Use soft but controlled rounding.

* Small controls: 10–12px
* Cards: 16–20px
* Large surfaces: 20–24px
* Floating microphone: circular

Do not make every element excessively pill-shaped. Pills should be reserved for status, small tags, compact filters.

## 12. Shadows

Use shadows sparingly. Prefer subtle ambient shadows, crisp borders, layered but very soft elevation.

Avoid: huge shadows, floating-card overload, neon glows, excessive glassmorphism.

The interface should feel grounded.

## 13. The Microphone — Primary Action

The microphone is the primary interaction in SautiLedger. It should be visually dominant.

The user should immediately understand: "Tap the microphone and tell SautiLedger what happened."

Do not bury voice functionality inside menus. It must always be one tap away from the home screen.

It must be: large, obvious, easy to hit, reachable with one thumb, visually centered, accessible, responsive.

Mobile interactive targets must be at least approximately 44px. The actual microphone control should be substantially larger than that.

The microphone should communicate its state clearly.

* **Idle** — 🎙 Ongea
* **Recording** — ● Ninasikiliza…
* **Processing** — 〰 Naelewa…
* **Success** — ✓ Imehifadhiwa
* **Error** — ! Jaribu tena

Never rely on animation alone to communicate state.

## 14. Voice Interaction

Voice is the primary input method. The flow is always the same, and it is never skipped:

```text
Speak
↓
Understanding
↓
Transaction preview
↓
Confirm / Edit
↓
Saved
```

Example:

User: "Leo nimeuza mchele wa elfu ishirini na tano."

SautiLedger interprets:

```json
{
  "type": "INCOME",
  "amount": 25000,
  "category": "Sales",
  "description": "Mchele"
}
```

Then show a confirmation interface.

```text
Mauzo

+ TSh 25,000

Mchele

[ Sahihi ]
```

The user should be able to confirm with one tap. Never silently commit ambiguous financial information, and never save a transaction the user has not seen.

## 15. Confirmation Philosophy

Financial data requires trust. Don't do "Speak → Automatically save." Always show the transaction preview first.

The confirmation UI should be: fast, obvious, non-threatening, editable, reversible.

Avoid large forms. If the user needs to correct something, allow them to modify amount, type, category, description without restarting the entire process.

Two actions only: **Hariri** (edit) and **Sahihi** (confirm/save). Hariri opens inline editing on the same card — it never restarts the flow.

## 16. Transaction Cards

Transactions should be glanceable.

```text
+ TSh 25,000
Mauzo
Mchele
Leo, 10:32
```

```text
− TSh 15,000
Mafuta
Gari
Leo, 09:12
```

Avoid: transaction IDs, technical timestamps, database terminology, unnecessary metadata.

The merchant cares about: What happened? How much? When?

## 17. Home / Miamala Screen

The primary screen should prioritize:

1. Current balance
2. Recent transactions
3. Voice input

The current balance should be the strongest visual element.

```text
Salio la sasa

TSh 284,500
```

Supporting information may include `+12% wiki hii`. Only show secondary metrics when they provide real value.

## 18. Ripoti Screen

Ripoti should not become an accounting dashboard. It should answer simple questions:

* "Nina kiasi gani?" — Current balance.
* "Wiki hii nimeingiza kiasi gani?" — Income.
* "Nimetumia kiasi gani?" — Expenses.
* "Pesa yangu inaishia wapi?" — Largest expense category.

```text
Ripoti

Wiki hii

TSh 180,000
Mapato

TSh 72,000
Matumizi


Pesa inaishia wapi?

Mafuta
TSh 35,000

████████████
```

Avoid complex charts. Avoid pie charts unless they genuinely improve comprehension.

## 19. Empty States

Every empty state must teach the user what to do next.

Bad: `No transactions.`

Good:

```text
Bado hakuna miamala.

Bonyeza 🎙 na uniambie
kilichotokea leo.
```

The empty state should always contain a next action.

## 20. Loading States

Never show a blank screen. Voice processing should communicate: "Ninasikiliza…" then "Naelewa…" then "Nimepata hii:"

Use subtle transitions. Avoid excessive spinners.

## 21. Error States

Errors should explain: what happened, whether the user's data is safe, what to do next.

Bad: `Network Error`

Good:

```text
Haikuweza kutumwa.

Ujumbe wako umehifadhiwa.
Tutaendelea ukipata mtandao.
```

The interface should feel reassuring.

## 22. Offline Experience

Offline support is a core product requirement. The application shell must remain usable without internet.

Transactions that can be safely created locally should enter an offline queue.

Show a subtle status: `● Imehifadhiwa kwenye simu`

When synchronized: `✓ Imesawazishwa`

Do not overwhelm the user with technical networking terminology. Never expose IndexedDB, synchronization queues, service workers, or API errors to the merchant.

## 23. PWA

The application should be installable. Use: Web App Manifest, Service Worker, Offline caching, Safe-area support, App-like navigation, Appropriate theme color, Standalone display mode.

The experience after installation should feel like an application, not a website.

## 24. Landing Page & Desktop Layout

SautiLedger has a public marketing surface at `/` (separate from the app shell at `/miamala` and `/ripoti` — no bottom nav, no 430px cap). It exists to explain the product before someone opens it, not to duplicate the app.

Rules for the landing page:

* Real product screenshots only. Never a fabricated mockup — capture the actual running app.
* Real example phrases only, sourced from AI_SPEC.md's verified extraction examples. Never invent an example the pipeline hasn't actually produced.
* No fake social proof — no invented testimonials, user counts, or press logos. The product is early; the copy should be honest about that by simply not claiming otherwise.
* Same visual language as the app (palette, radius, spacing, restrained color), but marketing typography can be bolder than in-product UI — a big, confident headline is appropriate here in a way it wouldn't be on the Miamala screen.
* Bilingual like everything else — every string exists in Swahili and English.

Desktop is not just "mobile centered in a wide viewport." At `lg+`, the app shell (`/miamala`, `/ripoti`) switches from bottom tabs to a persistent sidebar and widens its content column — DESIGN.md § 6 already asks for this ("the UI may expand on larger screens"); the sidebar is that expansion, not a departure into a generic dashboard. The landing page itself is full-width responsive from the start, since a marketing page is read on any device, not primarily a phone.

## 25. Motion

Motion is functional. Use it to communicate: recording, processing, success, navigation, state changes.

Avoid motion for decoration. Preferred animation properties: opacity, transform. Respect `prefers-reduced-motion`. Do not animate layout properties unnecessarily. Do not use `transition: all;`.

## 26. Accessibility

SautiLedger must remain usable with: keyboard, screen readers, reduced motion, larger text, touch.

Every icon-only control must have an accessible label. Use semantic HTML before ARIA. Never communicate transaction type using color alone.

## 27. Copywriting

Both languages should read naturally, never machine-translated or literal. Every string ships in both languages, with no hard-coded text.

Kiswahili examples — prefer natural Tanzanian Swahili:

Prefer `Ongea` over `Anzisha uingizaji wa rekodi ya kifedha kwa kutumia sauti.`

Prefer `Salio la sasa` over `Current Account Balance` (literal translation).

Prefer `Mauzo` over `Revenue`.

English examples — keep it just as plain and human, not corporate:

Prefer `Balance` over `Current Account Balance`.

Prefer `Sales` over `Revenue`.

## 28. Currency

Currency: `TSh`

Examples: `TSh 25,000`, `TSh 1,250,000`

Do not use inconsistent decimal formatting. Tanzanian shilling values in the MVP should normally display as whole numbers.

## 29. Design Anti-Patterns

The AI coding agent must NOT generate:

* generic SaaS dashboards
* excessive cards
* excessive gradients
* glassmorphism everywhere
* giant hero sections
* unnecessary sidebars
* desktop-first navigation
* tiny microphone buttons
* dense tables
* unnecessary charts
* excessive badges
* excessive icons
* decorative illustrations
* fake AI sparkle icons everywhere
* excessive purple/blue "AI" aesthetics
* meaningless statistics
* complicated onboarding

If a component does not improve the user's ability to record or understand their money, question whether it belongs.

## 30. Core UX Test

Before shipping any screen, ask:

* Can a first-time user understand this screen in 2 seconds?
* Can they record a transaction in less than 10 seconds?
* Can they understand whether money came in or went out immediately?
* Can they recover from an error without losing data?
* Does the interface still make sense on a small Android phone?

If the answer is no, simplify.

## 31. Design North Star

SautiLedger should feel like: "I told it what happened, and it took care of the rest."

Not: "I opened my accounting application and entered a transaction."

That difference is the product.
