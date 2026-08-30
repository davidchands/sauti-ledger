# SautiLedger AI Specification

This file defines how SautiLedger is supposed to understand humans. [DESIGN.md](DESIGN.md) defines how the product looks; [AGENTS.md](AGENTS.md) defines how Claude should code. This file defines what a correct interpretation of a merchant's speech looks like — it is both a spec and a growing evaluation dataset.

## 1. Purpose

Every voice transaction goes through:

```text
Audio
 ↓
Groq Whisper (transcription)
 ↓
Transcript
 ↓
Gemini (extraction)
 ↓
Structured JSON
 ↓
Zod validation
 ↓
Transaction preview (user confirms)
```

This file is the source of truth for what Gemini's output should be for a given transcript. Every prompt or model change should be evaluated against the examples below before shipping — see [Section 5](#5-evaluation-workflow).

## 2. Supported Languages

* Swahili
* English
* Mixed Swahili/English (code-switching)

Tanzanian merchants routinely mix languages and use shorthand. The AI must handle all of the forms below without asking the user to rephrase, except when the amount or transaction type is genuinely ambiguous (see [Section 4](#4-ambiguity-and-clarification)).

## 3. Output Schema

Gemini must return structured data matching the application's Zod schema:

```json
{
  "type": "INCOME" | "EXPENSE",
  "amount": number,
  "category": "Sales" | "Inventory" | "Rent" | "Operational" | "Other",
  "description": string
}
```

Amounts are always integer Tanzanian shillings. Never floating point.

## 4. Ambiguity and Clarification

Never invent missing financial information. If the amount or transaction type is ambiguous, the system must ask for clarification instead of guessing.

Example — ambiguous amount:

```text
"Nimepata mia."
```

`mia` alone is ambiguous (100? 100,000? "mia moja" vs "mia mbili"?). Correct behavior: ask "Ulimaanisha TSh 100?" rather than inventing a number.

Example — ambiguous type:

```text
"Elfu ishirini."
```

No verb indicates income or expense. Correct behavior: ask whether this was money received or spent.

## 5. Evaluation Workflow

`npm run eval:ai` runs every example below against the live extraction pipeline ([eval/dataset.ts](eval/dataset.ts), [eval/run.ts](eval/run.ts)) and reports pass/fail per case. It requires the API server running (`npm run dev:api`) and a working `DATABASE_URL`/`GEMINI_API_KEY`.

When the extraction prompt or model changes:

1. Run `npm run eval:ai`.
2. Compare actual output to expected output — the script does this automatically and exits non-zero on any failure.
3. Only deploy if accuracy improves or stays flat — never regress silently.

Last full run (Phase 9, gemini-3.6-flash): 23/23 passed.

As real (anonymized, consented) merchant utterances are collected, add them to both this file and `eval/dataset.ts` with their expected output. The goal is 1,000+ real Tanzanian utterances over time.

## 6. Examples

### Swahili

```text
"Leo nimeuza mchele elfu ishirini"
→ INCOME, 20000, Sales, "Mchele"

"Nimenunua stock ya laki mbili"
→ EXPENSE, 200000, Inventory, "Stock"

"Nimelipa pango laki tatu"
→ EXPENSE, 300000, Rent, "Pango"

"Mteja amenipa elfu hamsini"
→ INCOME, 50000, Sales, "Mauzo"

"Nimempa fundi elfu thelathini"
→ EXPENSE, 30000, Operational, "Fundi"

"Mafuta ya gari elfu kumi na tano"
→ EXPENSE, 15000, Operational, "Mafuta"

"Nimeuza bidhaa elfu tano."
→ INCOME, 5000, Sales, "Bidhaa"
```

### English

```text
"I paid rent 300 thousand"
→ EXPENSE, 300000, Rent, "Rent"

"I sold rice for twenty thousand"
→ INCOME, 20000, Sales, "Rice"

"I spent fifty thousand on stock"
→ EXPENSE, 50000, Inventory, "Stock"

"Received eighty thousand from a customer"
→ INCOME, 80000, Sales, "Customer payment"
```

### Mixed Swahili/English (code-switching)

```text
"Leo nimeuza twenty five thousand"
→ INCOME, 25000, Sales, "Mauzo"

"Leo nimeuza stock twenty thousand"
→ INCOME, 20000, Sales, "Stock"

"Leo nimeuza goods za 50k"
→ INCOME, 50000, Sales, "Goods"
```

### Tanzanian shorthand

```text
"nimepata 20k"
→ INCOME, 20000, Sales, "Mauzo"

"nimelipa 5k"
→ EXPENSE, 5000, Other, "Malipo"

"laki moja"
→ ambiguous type — clarify (income or expense?)

"milioni mbili"
→ ambiguous type — clarify (income or expense?)

"elfu tano"
→ ambiguous type — clarify (income or expense?)
```

### Phrasing variation (should normalize to the same result)

```text
"Leo mauzo yalikuwa 80,000."
"Leo nimeingiza 80k."
"Nilipata 80,000 kwa mauzo."

→ all three: INCOME, 80000, Sales
```

## 7. Amount Normalization Reference

| Spoken form | Value |
|---|---|
| elfu moja | 1,000 |
| elfu kumi | 10,000 |
| elfu ishirini | 20,000 |
| laki moja | 100,000 |
| laki mbili | 200,000 |
| milioni moja | 1,000,000 |
| 20k / 20K | 20,000 |
| 50k | 50,000 |

## 8. Category Heuristics

* **Sales** — merchant sold goods or services, received money from a customer.
* **Inventory** — merchant bought stock/goods to resell.
* **Rent** — pango, kodi ya duka/nyumba.
* **Operational** — fuel, transport, utilities, labor/fundi, day-to-day running costs.
* **Other** — anything that doesn't clearly fit the above; never force a bad fit.

## 9. Non-Negotiable Rules

* Gemini never writes directly to the database. The server validates the structured output against the Zod schema first.
* Every AI-generated transaction must pass validation before it reaches the transaction preview.
* Never trust raw Gemini output as final — always show it to the user for confirmation (see [DESIGN.md § Confirmation Philosophy](DESIGN.md#15-confirmation-philosophy)).
