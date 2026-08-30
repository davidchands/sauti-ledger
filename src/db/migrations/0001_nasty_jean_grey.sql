ALTER TABLE "users" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "device_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_device_id_idx" ON "users" USING btree ("device_id");