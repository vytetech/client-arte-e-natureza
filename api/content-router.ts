import { asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { defaultSettings, defaultTexts, defaultWorks } from "./default-content";
import { getDb, hasDatabaseConfig } from "./queries/connection";
import { createRouter, publicQuery } from "./middleware";

function useDefaultContent() {
  return !hasDatabaseConfig();
}

export const contentRouter = createRouter({
  texts: publicQuery.query(async () => {
    if (useDefaultContent()) {
      console.warn("[content] DATABASE_URL is not configured; using default public texts.");
      return defaultTexts;
    }
    const rows = await getDb().select().from(schema.siteTexts);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }),

  works: publicQuery.query(() =>
    useDefaultContent()
      ? defaultWorks
      : getDb().select().from(schema.works).orderBy(asc(schema.works.sortOrder)),
  ),

  settings: publicQuery.query(async () => {
    if (useDefaultContent()) {
      console.warn("[content] DATABASE_URL is not configured; using default public settings.");
      return defaultSettings;
    }
    const rows = await getDb().select().from(schema.settings);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }),

  workBySlug: publicQuery
    .input((raw: unknown) => {
      if (typeof raw !== "string") throw new Error("slug inválido");
      return raw;
    })
    .query(async ({ input }) => {
      if (useDefaultContent()) {
        return defaultWorks.find((work) => work.slug === input) ?? null;
      }
      const rows = await getDb()
        .select()
        .from(schema.works)
        .where(eq(schema.works.slug, input))
        .limit(1);
      return rows.at(0) ?? null;
    }),
});
