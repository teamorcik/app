ALTER TABLE "Chat" ADD COLUMN "mode" varchar DEFAULT 'ilkyardim' NOT NULL;--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "visibility";