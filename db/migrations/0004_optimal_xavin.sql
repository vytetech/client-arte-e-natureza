ALTER TABLE "users" ADD COLUMN "username" varchar(64);--> statement-breakpoint
WITH ranked_users AS (
  SELECT "id", row_number() OVER (ORDER BY "id") AS rn
  FROM "users"
)
UPDATE "users"
SET "username" = CASE
  WHEN ranked_users.rn = 1 THEN 'admin'
  ELSE 'user-' || "users"."id"
END
FROM ranked_users
WHERE "users"."id" = ranked_users."id"
  AND "users"."username" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
