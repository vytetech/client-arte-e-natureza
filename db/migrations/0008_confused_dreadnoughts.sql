ALTER TABLE "draft_translations" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "drafts" ADD COLUMN "description" text;