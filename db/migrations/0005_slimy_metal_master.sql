CREATE TYPE "public"."locale" AS ENUM('pt', 'en', 'es', 'ar');--> statement-breakpoint
CREATE TABLE "site_text_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"textId" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"value" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_text_translations_text_locale_unique" UNIQUE("textId","locale")
);
--> statement-breakpoint
CREATE TABLE "work_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"workId" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(64) NOT NULL,
	"technique" varchar(255) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "work_translations_work_locale_unique" UNIQUE("workId","locale")
);
--> statement-breakpoint
ALTER TABLE "site_text_translations" ADD CONSTRAINT "site_text_translations_textId_site_texts_id_fk" FOREIGN KEY ("textId") REFERENCES "public"."site_texts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_translations" ADD CONSTRAINT "work_translations_workId_works_id_fk" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "site_text_translations" ("textId", "locale", "value")
SELECT "id", 'pt', "value"
FROM "site_texts"
ON CONFLICT ("textId", "locale") DO NOTHING;
--> statement-breakpoint
INSERT INTO "work_translations" ("workId", "locale", "title", "category", "technique", "description")
SELECT "id", 'pt', "title", "category", "technique", COALESCE("description", '')
FROM "works"
ON CONFLICT ("workId", "locale") DO NOTHING;
