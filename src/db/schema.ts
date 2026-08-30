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

export const languageEnum = pgEnum('language', ['sw', 'en'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('users_phone_number_idx').on(table.phoneNumber)])

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
  // Integer Tanzanian shillings — never floating point (AGENTS.md § 6).
  amount: integer('amount').notNull(),
  category: transactionCategoryEnum('category').notNull(),
  description: text('description').notNull().default(''),
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
