CREATE TABLE "draft_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"draftId" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"title" varchar(255) DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "draft_translations_draft_locale_unique" UNIQUE("draftId","locale")
);
--> statement-breakpoint
ALTER TABLE "draft_translations" ADD CONSTRAINT "draft_translations_draftId_drafts_id_fk" FOREIGN KEY ("draftId") REFERENCES "public"."drafts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "draft_translations" ("draftId", "locale", "title", "content")
SELECT "id", 'pt', "title", "content" FROM "drafts"
ON CONFLICT ("draftId", "locale") DO NOTHING;
