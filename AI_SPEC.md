# Sauti Ledger AI Specification

This file defines how Sauti Ledger is supposed to understand humans: what a correct interpretation of a merchant's speech looks like. It is both a spec and a growing evaluation dataset.

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

This file is the source of truth for what Gemini's output should be for a given transcript. Every prompt or model change should be evaluated against the examples below before shipping, see [Section 5](#5-evaluation-workflow).

## 2. Supported Languages

* Swahili
* English
* Mixed Swahili/English (code-switching)

Tanzanian merchants routinely mix languages and use shorthand. The AI must handle all of the forms below without asking the user to rephrase, except when the amount or transaction type is genuinely ambiguous (see [Section 4](#4-ambiguity-and-clarification)).

## 3. Output Schema

Gemini must return structured data matching the application's Zod schema, an array of transactions, even for the common single-transaction case:

```json
{
  "transactions": [
    {
      "type": "INCOME" | "EXPENSE",
      "amount": number,
      "category": "Sales" | "Inventory" | "Rent" | "Operational" | "Other",
      "description": string,
      "quantity": number | null,
      "unit": string | null
    }
  ]
}
```

Amounts are always a plain integer. Never floating point.

quantity/unit are only set when the speaker explicitly states a count of physical units, "magunia matano ya mchele" (5 sacks of rice), "chupa kumi" (10 bottles). A plain amount like "mchele elfu ishirini" (rice for 20,000) has no quantity, both stay null rather than inventing a count from the price. A currency word attached to the amount ("20 pounds", "50 dollars") is never a quantity/unit either — it names money, not a count of physical items.

### 3a. Amounts are currency-agnostic

The app's currency (TZS/KES/UGX/USD/EUR/GBP) is a display-only label the user picks separately (README § multi-currency) — it never reaches the extraction pipeline and never changes how an amount is read. Gemini extracts the plain number regardless of which currency word the speaker uses, including non-Tanzanian ones:

```text
"I sold rice for 100 dollars"
→ INCOME, 100, Sales, "Rice"

"I sold rice for 20 pounds"
→ INCOME, 20, Sales, "Rice" (quantity/unit stay null — "pounds" here is money, not weight)

"Bought fuel for 50 dollars"
→ EXPENSE, 50, Operational, "Fuel"
```

A missing or unfamiliar currency word must never cause the amount to be treated as ambiguous — only a genuinely unstated or unclear number does that (Section 4).

### 3b. Multiple transactions in one recording

A merchant sometimes reports more than one transaction in a single recording, e.g. "Niliuza mchele elfu ishirini kisha nikanunua mafuta elfu tano" (sold rice for 20,000, then bought fuel for 5,000). The model returns one array item per distinct event it can identify.

- Only split when the transcript clearly describes separate events, never split a single amount or a single event into more than one item, and never merge two distinct events into one.
- Each item is evaluated for ambiguity independently (Section 4): one clear item and one ambiguous item in the same recording is normal; the clear one still gets saved, only the ambiguous one is dropped.
- The confirmation UI steps through each returned transaction one at a time, never batch-saving silently.

Example:

```text
"I sold rice for 20k and paid rent 300 thousand"
→ [{INCOME, 20000, Sales, "Rice"}, {EXPENSE, 300000, Rent, "Rent"}]
```

## 4. Ambiguity and Clarification

Never invent missing financial information. If the amount or transaction type is ambiguous, the system must ask for clarification instead of guessing.

Example, ambiguous amount:

```text
"Nimepata mia."
```

`mia` alone is ambiguous (100? 100,000? "mia moja" vs "mia mbili"?). Correct behavior: ask "Ulimaanisha TSh 100?" rather than inventing a number.

Example, ambiguous type:

```text
"Elfu ishirini."
```

No verb indicates income or expense. Correct behavior: ask whether this was money received or spent.

## 5. Evaluation Workflow

`npm run eval:ai` runs every example below against the live extraction pipeline ([eval/dataset.ts](eval/dataset.ts), [eval/run.ts](eval/run.ts)) and reports pass/fail per case. It requires the API server running (`npm run dev:api`) and a working `DATABASE_URL`/`GEMINI_API_KEY`.

When the extraction prompt or model changes:

1. Run `npm run eval:ai`.
2. Compare actual output to expected output, the script does this automatically and exits non-zero on any failure.
3. Only deploy if accuracy improves or stays flat, never regress silently.

Last full run (gemini-3.6-flash): 32/32 passed.

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
→ ambiguous type, clarify (income or expense?)

"milioni mbili"
→ ambiguous type, clarify (income or expense?)

"elfu tano"
→ ambiguous type, clarify (income or expense?)
```

### Phrasing variation (should normalize to the same result)

```text
"Leo mauzo yalikuwa 80,000."
"Leo nimeingiza 80k."
"Nilipata 80,000 kwa mauzo."

→ all three: INCOME, 80000, Sales
```

### Income vs. expense, close verb pairs

The distinction most likely to trip up a weaker model isn't "sold" vs
"bought", it's paying someone vs. being paid, receiving vs. giving,
where Swahili active/passive voice differs by a syllable.

```text
"Nimetumia elfu kumi kwa usafiri"
→ EXPENSE, 10000, Operational, "Usafiri"

"Nimepokea elfu thelathini kutoka kwa mteja"
→ INCOME, 30000, Sales, "Mteja"

"Nimemlipa mfanyakazi elfu ishirini"
→ EXPENSE, 20000, Operational, "Mfanyakazi"

"Nililipwa elfu hamsini kwa kazi niliyofanya"
→ INCOME, 50000, Sales, "Kazi"

"I got paid twenty thousand"
→ INCOME, 20000

"I gave the supplier fifteen thousand"
→ EXPENSE, 15000, Inventory, "Supplier"
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

* **Sales**: merchant sold goods or services, received money from a customer.
* **Inventory**: merchant bought stock/goods to resell.
* **Rent**: pango, kodi ya duka/nyumba.
* **Operational**: fuel, transport, utilities, labor/fundi, day-to-day running costs.
* **Other**: anything that doesn't clearly fit the above; never force a bad fit.

## 9. Non-Negotiable Rules

* Gemini never writes directly to the database. The server validates the structured output against the Zod schema first.
* Every AI-generated transaction must pass Zod validation before it's ever saved.
* Saving no longer waits on a tap-to-confirm (DESIGN.md § 15, a deliberate product decision once real usage showed the pipeline is accurate enough). What's still non-negotiable: a genuinely ambiguous amount or type is never invented, it's surfaced to the user instead — and every save still shows the user what was recorded (a toast with Undo), never truly silent.
