import { asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, publicQuery } from "./middleware";

export const contentRouter = createRouter({
  texts: publicQuery.query(async () => {
    const rows = await getDb().select().from(schema.siteTexts);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }),

  works: publicQuery.query(() =>
    getDb().select().from(schema.works).orderBy(asc(schema.works.sortOrder)),
  ),

  settings: publicQuery.query(async () => {
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
      const rows = await getDb()
        .select()
        .from(schema.works)
        .where(eq(schema.works.slug, input))
        .limit(1);
      return rows.at(0) ?? null;
    }),
});
