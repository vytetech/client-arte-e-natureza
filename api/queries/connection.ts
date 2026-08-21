import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let pool: Pool;

export function hasDatabaseConfig() {
  return env.hasDatabase;
}

export function getDb() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required for database access");
  }
  if (!instance) {
    pool = new Pool({
      connectionString: env.databaseUrl,
    });
    instance = drizzle(pool, {
      schema: fullSchema,
    });
  }
  return instance;
}
