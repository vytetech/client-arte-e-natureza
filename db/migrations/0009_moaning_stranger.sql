CREATE TABLE "work_variant_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"variantId" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"dimensions" varchar(120) DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "work_variant_translations_variant_locale_unique" UNIQUE("variantId","locale")
);
--> statement-breakpoint
CREATE TABLE "work_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"workId" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"dimensions" varchar(120) DEFAULT '' NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"status" varchar(64) DEFAULT 'available' NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "isUniquePiece" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "editionNumber" integer;--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "editionTotal" integer;--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "editionLabel" varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_variant_translations" ADD CONSTRAINT "work_variant_translations_variantId_work_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."work_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_variants" ADD CONSTRAINT "work_variants_workId_works_id_fk" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;