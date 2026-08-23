ALTER TABLE "works" ADD COLUMN "widthCm" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "heightCm" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "thicknessCm" numeric(8, 2);--> statement-breakpoint
CREATE TABLE "work_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"workId" integer NOT NULL,
	"url" varchar(512) NOT NULL,
	"alt" varchar(255) DEFAULT '' NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "work_images" ADD CONSTRAINT "work_images_workId_works_id_fk" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
