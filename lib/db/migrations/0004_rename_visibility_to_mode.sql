-- Add new mode column with Turkish enum values and migrate data from visibility
ALTER TABLE "Chat" ADD COLUMN "mode" varchar DEFAULT 'ilkyardim' NOT NULL;

UPDATE "Chat"
SET "mode" = CASE
  WHEN "visibility" = 'private' THEN 'ilkyardim'
  WHEN "visibility" = 'public' THEN 'egitim'
  ELSE 'ilkyardim'
END;

ALTER TABLE "Chat" DROP COLUMN "visibility";


