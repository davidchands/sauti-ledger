CREATE TYPE "public"."currency" AS ENUM('TZS', 'USD', 'EUR');--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "currency" "currency" DEFAULT 'TZS' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rate_usd_to_tzs" real DEFAULT 2500 NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rate_eur_to_tzs" real DEFAULT 2700 NOT NULL;