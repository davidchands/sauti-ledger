import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  uuid,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE'])

export const transactionCategoryEnum = pgEnum('transaction_category', [
  'Sales',
  'Inventory',
  'Rent',
  'Operational',
  'Other',
])

export const transactionSourceEnum = pgEnum('transaction_source', ['VOICE', 'MANUAL'])

export const transactionStatusEnum = pgEnum('transaction_status', [
  'PENDING',
  'CONFIRMED',
  'SYNCED',
])

export const currencyEnum = pgEnum('currency', ['TZS', 'USD', 'EUR'])

export const languageEnum = pgEnum('language', ['sw', 'en'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Nullable until Phase 3's real OTP auth lands (AGENTS.md § 3a) — MVP
  // identity is device-based instead.
  phoneNumber: text('phone_number'),
  deviceId: text('device_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('users_phone_number_idx').on(table.phoneNumber),
  uniqueIndex('users_device_id_idx').on(table.deviceId),
])

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  businessName: text('business_name'),
  preferredLanguage: languageEnum('preferred_language').notNull().default('sw'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('profiles_user_id_idx').on(table.userId)])

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  // A plain number, up to 2 decimal places (e.g. cents) — most spoken
  // amounts are whole numbers, but decimals are kept when stated.
  // Denominated in `currency`, never assumed to be shillings
  // (AI_SPEC.md § 3a).
  amount: real('amount').notNull(),
  // The currency `amount` was recorded in, set once at creation from the
  // app's currency setting at that moment — never edited afterward.
  currency: currencyEnum('currency').notNull().default('TZS'),
  // Exchange-rate snapshot frozen at creation time (server/lib/
  // exchangeRates.ts) so a transaction's converted value never drifts
  // as today's rates change — see README § multi-currency. Defaults
  // exist only to backfill rows from before this column existed.
  rateUsdToTzs: real('rate_usd_to_tzs').notNull().default(2500),
  rateEurToTzs: real('rate_eur_to_tzs').notNull().default(2700),
  category: transactionCategoryEnum('category').notNull(),
  description: text('description').notNull().default(''),
  // How many units were involved, when the speaker actually said a count
  // ("magunia matano" / "5 bags") — null when no quantity was mentioned,
  // never guessed (AI_SPEC.md).
  quantity: integer('quantity'),
  unit: text('unit'),
  rawTranscript: text('raw_transcript'),
  language: languageEnum('language'),
  source: transactionSourceEnum('source').notNull(),
  confidence: real('confidence'),
  status: transactionStatusEnum('status').notNull().default('CONFIRMED'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  transactions: many(transactions),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}))
