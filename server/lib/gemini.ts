import { geminiResponseSchema, type ExtractedTransaction } from '../../src/types/extraction'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent'

const SYSTEM_INSTRUCTION = `You extract financial transactions from a Tanzanian microbusiness owner's spoken transcript. The speech may be in Swahili, English, or a mix of both (code-switching) — you must handle all three.

A recording usually describes a single transaction, but sometimes a merchant reports several in one breath (e.g. "Niliuza mchele elfu ishirini kisha nikanunua mafuta elfu tano" — sold rice for 20,000, then bought fuel for 5,000). Always return a JSON array under "transactions": one item for the common single-transaction case, multiple items only when the transcript clearly describes separate, distinct events. Never split a single amount or a single event into more than one item, and never merge two distinct events into one.

Rules (apply to every item):
- amount is always an integer number of Tanzanian shillings. Common shorthand: "20k" or "elfu ishirini" = 20000. "laki moja" = 100000. "milioni mbili" = 2000000.
- type is INCOME if the speaker received/earned money (sold something, got paid), EXPENSE if they spent money (bought, paid for something).
- category is one of: Sales (sold goods/services), Inventory (bought stock to resell), Rent (pango/kodi), Operational (fuel, transport, utilities, labor), Other.
- description is a short 1-4 word summary of what the transaction was for, in the same language mix as the transcript.
- confidence is your own certainty (0 to 1) that you extracted this item correctly.
- If an item's amount is genuinely ambiguous or not stated (e.g. "nimepata mia" — mia alone is ambiguous), set its amount to null. Never invent a number you cannot infer.
- If an item's type (income vs expense) cannot be determined from the transcript, set its type to null. Never guess.
- Do not let a low-confidence guess mask itself as certain — reflect real uncertainty in the confidence score.

Examples:
"Leo nimeuza mchele elfu ishirini" -> {"transactions":[{"type":"INCOME","amount":20000,"category":"Sales","description":"Mchele","confidence":0.95}]}
"Nimenunua stock ya laki mbili" -> {"transactions":[{"type":"EXPENSE","amount":200000,"category":"Inventory","description":"Stock","confidence":0.95}]}
"I paid rent 300 thousand" -> {"transactions":[{"type":"EXPENSE","amount":300000,"category":"Rent","description":"Rent","confidence":0.95}]}
"Leo nimeuza twenty five thousand" -> {"transactions":[{"type":"INCOME","amount":25000,"category":"Sales","description":"Mauzo","confidence":0.9}]}
"Nimepata mia" -> {"transactions":[{"type":"INCOME","amount":null,"category":"Other","description":"Mia","confidence":0.3}]}
"Elfu ishirini" -> {"transactions":[{"type":null,"amount":20000,"category":"Other","description":"","confidence":0.3}]}
"Niliuza mchele elfu ishirini kisha nikanunua mafuta elfu tano" -> {"transactions":[{"type":"INCOME","amount":20000,"category":"Sales","description":"Mchele","confidence":0.95},{"type":"EXPENSE","amount":5000,"category":"Operational","description":"Mafuta","confidence":0.95}]}
"I sold rice for 20k and paid rent 300 thousand" -> {"transactions":[{"type":"INCOME","amount":20000,"category":"Sales","description":"Rice","confidence":0.95},{"type":"EXPENSE","amount":300000,"category":"Rent","description":"Rent","confidence":0.95}]}`

const TRANSACTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    type: { type: 'STRING', enum: ['INCOME', 'EXPENSE'], nullable: true },
    amount: { type: 'INTEGER', nullable: true },
    category: {
      type: 'STRING',
      enum: ['Sales', 'Inventory', 'Rent', 'Operational', 'Other'],
    },
    description: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
  },
  required: ['category', 'description', 'confidence'],
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    transactions: { type: 'ARRAY', items: TRANSACTION_SCHEMA },
  },
  required: ['transactions'],
}

/**
 * Server-only. GEMINI_API_KEY never reaches the client (AGENTS.md § 3).
 * Gemini's output is never trusted directly — it's Zod-validated here and
 * the caller (server route) is what decides whether to show a preview or
 * ask for clarification. Gemini never writes to Neon.
 */
export async function extractTransactions(transcript: string): Promise<ExtractedTransaction[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts: [{ text: `Transcript: "${transcript}"` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Gemini extraction failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini returned no content')
  }

  const raw: unknown = JSON.parse(text)
  const parsed = geminiResponseSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(`Gemini output failed validation: ${parsed.error.message}`)
  }

  return parsed.data.transactions.map((item) => ({
    ...item,
    needsClarification: item.type === null || item.amount === null,
  }))
}
