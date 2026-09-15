var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/app.ts
import "dotenv/config";
import express from "express";

// src/db/client.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  currencyEnum: () => currencyEnum,
  languageEnum: () => languageEnum,
  profiles: () => profiles,
  profilesRelations: () => profilesRelations,
  transactionCategoryEnum: () => transactionCategoryEnum,
  transactionSourceEnum: () => transactionSourceEnum,
  transactionStatusEnum: () => transactionStatusEnum,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  uuid,
  real,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
var transactionTypeEnum = pgEnum("transaction_type", ["INCOME", "EXPENSE"]);
var transactionCategoryEnum = pgEnum("transaction_category", [
  "Sales",
  "Inventory",
  "Rent",
  "Operational",
  "Other"
]);
var transactionSourceEnum = pgEnum("transaction_source", ["VOICE", "MANUAL"]);
var transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "CONFIRMED",
  "SYNCED"
]);
var currencyEnum = pgEnum("currency", ["TZS", "USD", "EUR"]);
var languageEnum = pgEnum("language", ["sw", "en"]);
var users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Nullable until Phase 3's real OTP auth lands (AGENTS.md § 3a) — MVP
  // identity is device-based instead.
  phoneNumber: text("phone_number"),
  deviceId: text("device_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex("users_phone_number_idx").on(table.phoneNumber),
  uniqueIndex("users_device_id_idx").on(table.deviceId)
]);
var profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name"),
  preferredLanguage: languageEnum("preferred_language").notNull().default("sw"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [uniqueIndex("profiles_user_id_idx").on(table.userId)]);
var transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  // A plain integer — never floating point. Denominated in `currency`,
  // never assumed to be shillings (AI_SPEC.md § 3a).
  amount: integer("amount").notNull(),
  // The currency `amount` was recorded in, set once at creation from the
  // app's currency setting at that moment — never edited afterward.
  currency: currencyEnum("currency").notNull().default("TZS"),
  // Exchange-rate snapshot frozen at creation time (server/lib/
  // exchangeRates.ts) so a transaction's converted value never drifts
  // as today's rates change — see README § multi-currency. Defaults
  // exist only to backfill rows from before this column existed.
  rateUsdToTzs: real("rate_usd_to_tzs").notNull().default(2500),
  rateEurToTzs: real("rate_eur_to_tzs").notNull().default(2700),
  category: transactionCategoryEnum("category").notNull(),
  description: text("description").notNull().default(""),
  // How many units were involved, when the speaker actually said a count
  // ("magunia matano" / "5 bags") — null when no quantity was mentioned,
  // never guessed (AI_SPEC.md).
  quantity: integer("quantity"),
  unit: text("unit"),
  rawTranscript: text("raw_transcript"),
  language: languageEnum("language"),
  source: transactionSourceEnum("source").notNull(),
  confidence: real("confidence"),
  status: transactionStatusEnum("status").notNull().default("CONFIRMED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  transactions: many(transactions)
}));
var profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] })
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] })
}));

// src/db/client.ts
if (typeof window !== "undefined") {
  throw new Error("src/db/client.ts must never be imported in browser code");
}
var db = null;
function getDb() {
  if (db) return db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString });
  db = drizzle(pool, { schema: schema_exports });
  return db;
}

// src/db/queries/users.ts
async function getOrCreateUserByDeviceId(deviceId) {
  const [user] = await getDb().insert(users).values({ deviceId }).onConflictDoUpdate({ target: users.deviceId, set: { deviceId } }).returning();
  return user;
}

// server/resolveUser.ts
async function resolveUser(req, res, next) {
  const deviceId = req.header("X-Device-Id");
  if (!deviceId) {
    res.status(401).json({ error: "Missing X-Device-Id header" });
    return;
  }
  try {
    const user = await getOrCreateUserByDeviceId(deviceId);
    req.userId = user.id;
    next();
  } catch (error) {
    console.error("Failed to resolve user from device id", error);
    res.status(500).json({ error: "Could not resolve user" });
  }
}

// server/routes/transactions.ts
import { Router } from "express";
import { z } from "zod";

// src/db/queries/transactions.ts
import { and, desc, eq } from "drizzle-orm";
async function createTransaction(input) {
  const [created] = await getDb().insert(transactions).values(input).returning();
  return created;
}
async function listTransactions(userId) {
  return getDb().query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: desc(transactions.createdAt)
  });
}
async function getTransaction(userId, id) {
  return getDb().query.transactions.findFirst({
    where: and(eq(transactions.id, id), eq(transactions.userId, userId))
  });
}
async function updateTransaction(userId, id, input) {
  const [updated] = await getDb().update(transactions).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).returning();
  return updated;
}
async function deleteTransaction(userId, id) {
  const [deleted] = await getDb().delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).returning();
  return deleted;
}

// server/lib/exchangeRates.ts
var RATE_URL = "https://open.er-api.com/v6/latest/USD";
var FETCH_TIMEOUT_MS = 3e3;
var FALLBACK_RATES = { rateUsdToTzs: 2500, rateEurToTzs: 2700 };
async function fetchExchangeRates() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(RATE_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return FALLBACK_RATES;
    const data = await response.json();
    const usdToTzs = data.rates?.TZS;
    const usdToEur = data.rates?.EUR;
    if (!usdToTzs || !usdToEur) return FALLBACK_RATES;
    return { rateUsdToTzs: usdToTzs, rateEurToTzs: usdToTzs / usdToEur };
  } catch {
    return FALLBACK_RATES;
  }
}

// server/routes/transactions.ts
var transactionsRouter = Router();
var categoryEnum = z.enum(["Sales", "Inventory", "Rent", "Operational", "Other"]);
var typeEnum = z.enum(["INCOME", "EXPENSE"]);
var currencyEnum2 = z.enum(["TZS", "USD", "EUR"]);
var createSchema = z.object({
  type: typeEnum,
  amount: z.number().int().positive(),
  // Whatever the app's currency setting was at the moment of recording
  // (client-sent, not detected from speech — AI_SPEC.md § 3a). The
  // server fetches a live rate snapshot for it below and freezes that
  // onto the transaction forever.
  currency: currencyEnum2,
  category: categoryEnum,
  description: z.string().max(280).optional(),
  quantity: z.number().int().positive().nullable().optional(),
  unit: z.string().max(40).nullable().optional(),
  // Voice-sourced transactions carry provenance (AI_SPEC.md); manual
  // entries omit these and default to MANUAL.
  source: z.enum(["MANUAL", "VOICE"]).optional(),
  rawTranscript: z.string().max(2e3).optional(),
  language: z.enum(["sw", "en"]).optional(),
  confidence: z.number().min(0).max(1).optional()
});
var updateSchema = z.object({
  type: typeEnum.optional(),
  amount: z.number().int().positive().optional(),
  category: categoryEnum.optional(),
  description: z.string().max(280).optional(),
  quantity: z.number().int().positive().nullable().optional(),
  unit: z.string().max(40).nullable().optional()
});
transactionsRouter.get("/", async (req, res) => {
  const { userId } = req;
  const transactions2 = await listTransactions(userId);
  res.json(transactions2);
});
transactionsRouter.post("/", async (req, res) => {
  const { userId } = req;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const rates = await fetchExchangeRates();
  const created = await createTransaction({
    userId,
    ...parsed.data,
    ...rates,
    source: parsed.data.source ?? "MANUAL"
  });
  res.status(201).json(created);
});
transactionsRouter.get("/:id", async (req, res) => {
  const { userId } = req;
  const transaction = await getTransaction(userId, req.params.id);
  if (!transaction) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(transaction);
});
transactionsRouter.patch("/:id", async (req, res) => {
  const { userId } = req;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const updated = await updateTransaction(userId, req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});
transactionsRouter.delete("/:id", async (req, res) => {
  const { userId } = req;
  const deleted = await deleteTransaction(userId, req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).end();
});

// server/routes/transcribe.ts
import { Router as Router2 } from "express";

// server/lib/groq.ts
var GROQ_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
var MODEL = "whisper-large-v3";
async function transcribeAudio(audio, mimeType) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  const extension = mimeType.includes("webm") ? "webm" : mimeType.includes("mp4") ? "mp4" : mimeType.includes("mpeg") ? "mp3" : "webm";
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([Uint8Array.from(audio)], { type: mimeType }),
    `recording.${extension}`
  );
  formData.append("model", MODEL);
  formData.append("response_format", "verbose_json");
  const response = await fetch(GROQ_TRANSCRIPTION_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Groq transcription failed (${response.status}): ${body}`);
  }
  const data = await response.json();
  return {
    transcript: (data.text ?? "").trim(),
    language: data.language ?? null
  };
}

// server/routes/transcribe.ts
var transcribeRouter = Router2();
var MAX_AUDIO_BYTES = 15 * 1024 * 1024;
transcribeRouter.post("/", async (req, res) => {
  const contentType = req.header("Content-Type");
  if (!contentType?.startsWith("audio/")) {
    res.status(400).json({ error: "Expected an audio/* Content-Type" });
    return;
  }
  const chunks = [];
  let totalBytes = 0;
  let tooLarge = false;
  req.on("data", (chunk) => {
    totalBytes += chunk.length;
    if (totalBytes > MAX_AUDIO_BYTES) {
      tooLarge = true;
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", async () => {
    if (tooLarge) {
      res.status(413).json({ error: "Audio too large" });
      return;
    }
    if (chunks.length === 0) {
      res.status(400).json({ error: "No audio received" });
      return;
    }
    try {
      const audio = Buffer.concat(chunks);
      const result = await transcribeAudio(audio, contentType);
      res.json(result);
    } catch (error) {
      console.error("Transcription failed", error);
      res.status(502).json({ error: "Transcription failed" });
    }
  });
  req.on("error", (error) => {
    console.error("Audio upload stream error", error);
    if (!res.headersSent) {
      res.status(400).json({ error: "Upload failed" });
    }
  });
});

// server/routes/extract.ts
import { Router as Router3 } from "express";
import { z as z3 } from "zod";

// src/types/extraction.ts
import { z as z2 } from "zod";
var extractedTransactionSchema = z2.object({
  type: z2.enum(["INCOME", "EXPENSE"]).nullable(),
  amount: z2.number().int().positive().nullable(),
  category: z2.enum(["Sales", "Inventory", "Rent", "Operational", "Other"]),
  description: z2.string(),
  // Only set when the speaker actually stated a count ("magunia matano" /
  // "5 bags") — null otherwise. Never inferred or guessed (AI_SPEC.md).
  quantity: z2.number().int().positive().nullable(),
  unit: z2.string().nullable(),
  confidence: z2.number().min(0).max(1)
});
var geminiResponseSchema = z2.object({
  transactions: z2.array(extractedTransactionSchema).min(1)
});

// server/lib/gemini.ts
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";
var SYSTEM_INSTRUCTION = `You extract financial transactions from a Tanzanian microbusiness owner's spoken transcript. The speech may be in Swahili, English, or a mix of both (code-switching) \u2014 you must handle all three.

A recording usually describes a single transaction, but sometimes a merchant reports several in one breath (e.g. "Niliuza mchele elfu ishirini kisha nikanunua mafuta elfu tano" \u2014 sold rice for 20,000, then bought fuel for 5,000). Always return a JSON array under "transactions": one item for the common single-transaction case, multiple items only when the transcript clearly describes separate, distinct events. Never split a single amount or a single event into more than one item, and never merge two distinct events into one.

Rules (apply to every item):
- amount is always a plain integer, extracted regardless of which currency word (if any) the speaker uses \u2014 "shillings", "dollars", "pounds", "euros", "elfu"/"laki"/"milioni", or no currency word at all. The app's currency is a separate display label the user picks elsewhere and never affects how you read the number: "100 dollars" is amount 100, "20 pounds" is amount 20, exactly like "elfu ishirini" is amount 20000. Never refuse or null out an amount just because the currency word isn't Tanzanian shillings. Common shorthand: "20k" or "elfu ishirini" = 20000. "laki moja" = 100000. "milioni mbili" = 2000000.
- type is INCOME if the speaker received/earned money (sold something, got paid), EXPENSE if they spent money (bought, paid for something).
- category is one of: Sales (sold goods/services), Inventory (bought stock to resell), Rent (pango/kodi), Operational (fuel, transport, utilities, labor), Other.
- description is a short 1-4 word summary of what the transaction was for, in the same language mix as the transcript.
- quantity and unit: only fill these in when the speaker explicitly states a count of physical units \u2014 "magunia matano ya mchele" (5 bags of rice), "chupa kumi" (10 bottles), "3 bags of cement". quantity is the integer count, unit is a short word for what's being counted in the same language as the transcript (e.g. "magunia", "chupa", "bags", "pieces"). If no count is stated, leave both null \u2014 a plain amount like "mchele elfu ishirini" (rice for 20,000) has no quantity, don't invent one from the price. A currency word attached to the amount ("20 pounds", "50 dollars") is never a quantity/unit \u2014 "pounds" and "dollars" there name money, not a count of physical items.
- confidence is your own certainty (0 to 1) that you extracted this item correctly.
- If an item's amount is genuinely ambiguous or not stated (e.g. "nimepata mia" \u2014 mia alone is ambiguous), set its amount to null. Never invent a number you cannot infer.
- If an item's type (income vs expense) cannot be determined from the transcript, set its type to null. Never guess.
- Do not let a low-confidence guess mask itself as certain \u2014 reflect real uncertainty in the confidence score.

Examples:
"Leo nimeuza mchele elfu ishirini" -> {"transactions":[{"type":"INCOME","amount":20000,"category":"Sales","description":"Mchele","quantity":null,"unit":null,"confidence":0.95}]}
"Nimenunua stock ya laki mbili" -> {"transactions":[{"type":"EXPENSE","amount":200000,"category":"Inventory","description":"Stock","quantity":null,"unit":null,"confidence":0.95}]}
"I paid rent 300 thousand" -> {"transactions":[{"type":"EXPENSE","amount":300000,"category":"Rent","description":"Rent","quantity":null,"unit":null,"confidence":0.95}]}
"Leo nimeuza twenty five thousand" -> {"transactions":[{"type":"INCOME","amount":25000,"category":"Sales","description":"Mauzo","quantity":null,"unit":null,"confidence":0.9}]}
"Nimepata mia" -> {"transactions":[{"type":"INCOME","amount":null,"category":"Other","description":"Mia","quantity":null,"unit":null,"confidence":0.3}]}
"Elfu ishirini" -> {"transactions":[{"type":null,"amount":20000,"category":"Other","description":"","quantity":null,"unit":null,"confidence":0.3}]}
"Niliuza mchele elfu ishirini kisha nikanunua mafuta elfu tano" -> {"transactions":[{"type":"INCOME","amount":20000,"category":"Sales","description":"Mchele","quantity":null,"unit":null,"confidence":0.95},{"type":"EXPENSE","amount":5000,"category":"Operational","description":"Mafuta","quantity":null,"unit":null,"confidence":0.95}]}
"I sold rice for 20k and paid rent 300 thousand" -> {"transactions":[{"type":"INCOME","amount":20000,"category":"Sales","description":"Rice","quantity":null,"unit":null,"confidence":0.95},{"type":"EXPENSE","amount":300000,"category":"Rent","description":"Rent","quantity":null,"unit":null,"confidence":0.95}]}
"Niliuza magunia matano ya mchele kwa laki moja" -> {"transactions":[{"type":"INCOME","amount":100000,"category":"Sales","description":"Mchele","quantity":5,"unit":"magunia","confidence":0.95}]}
"I bought 10 bottles of cooking oil for fifty thousand" -> {"transactions":[{"type":"EXPENSE","amount":50000,"category":"Inventory","description":"Cooking oil","quantity":10,"unit":"bottles","confidence":0.95}]}
"I sold rice for 100 dollars" -> {"transactions":[{"type":"INCOME","amount":100,"category":"Sales","description":"Rice","quantity":null,"unit":null,"confidence":0.95}]}
"I sold rice for 20 pounds" -> {"transactions":[{"type":"INCOME","amount":20,"category":"Sales","description":"Rice","quantity":null,"unit":null,"confidence":0.95}]}
"Bought fuel for 50 dollars" -> {"transactions":[{"type":"EXPENSE","amount":50,"category":"Operational","description":"Fuel","quantity":null,"unit":null,"confidence":0.95}]}`;
var TRANSACTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING", enum: ["INCOME", "EXPENSE"], nullable: true },
    amount: { type: "INTEGER", nullable: true },
    category: {
      type: "STRING",
      enum: ["Sales", "Inventory", "Rent", "Operational", "Other"]
    },
    description: { type: "STRING" },
    quantity: { type: "INTEGER", nullable: true },
    unit: { type: "STRING", nullable: true },
    confidence: { type: "NUMBER" }
  },
  required: ["category", "description", "confidence"]
};
var RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    transactions: { type: "ARRAY", items: TRANSACTION_SCHEMA }
  },
  required: ["transactions"]
};
async function extractTransactions(transcript) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts: [{ text: `Transcript: "${transcript}"` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gemini extraction failed (${response.status}): ${body}`);
  }
  const data = await response.json();
  const text2 = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text2) {
    throw new Error("Gemini returned no content");
  }
  const raw = JSON.parse(text2);
  const parsed = geminiResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Gemini output failed validation: ${parsed.error.message}`);
  }
  return parsed.data.transactions.map((item) => ({
    ...item,
    needsClarification: item.type === null || item.amount === null
  }));
}

// server/routes/extract.ts
var extractRouter = Router3();
var requestSchema = z3.object({
  transcript: z3.string().trim().min(1).max(2e3)
});
extractRouter.post("/", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const transactions2 = await extractTransactions(parsed.data.transcript);
    res.json({ transactions: transactions2 });
  } catch (error) {
    console.error("Extraction failed", error);
    res.status(502).json({ error: "Extraction failed" });
  }
});

// server/app.ts
var app = express();
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/transactions", resolveUser, transactionsRouter);
app.use("/api/transcribe", resolveUser, transcribeRouter);
app.use("/api/extract", resolveUser, extractRouter);
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && "status" in err) {
    res.status(400).json({ error: "Malformed request body" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// api/_handler.ts
var handler_default = app;
export {
  handler_default as default
};
