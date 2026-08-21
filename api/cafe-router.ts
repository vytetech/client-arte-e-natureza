import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, adminQuery } from "./middleware";

const TOGGLE_KEY = "cafe.enabled";

async function isEnabled(): Promise<boolean> {
  const rows = await getDb()
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, TOGGLE_KEY))
    .limit(1);
  return rows.at(0)?.value === "1";
}

async function requireEnabled() {
  if (!(await isEnabled())) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "O Espaço de Café está desativado. Ative-o para acessar os rascunhos.",
    });
  }
}

const draftInput = z.object({
  type: z.enum(["text", "image", "video"]),
  title: z.string().max(255).default(""),
  content: z.string().min(1, "Conteúdo obrigatório"),
  note: z.string().default(""),
});

export const cafeRouter = createRouter({
  /** Estado do espaço (visível mesmo desativado, para renderizar o toggle) */
  status: adminQuery.query(async () => ({ enabled: await isEnabled() })),

  toggle: adminQuery
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      await getDb()
        .insert(schema.settings)
        .values({ key: TOGGLE_KEY, value: input.enabled ? "1" : "0" })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value: input.enabled ? "1" : "0" },
        });
      return { success: true, enabled: input.enabled };
    }),

  /** Lista rascunhos — bloqueado quando o espaço está desativado */
  list: adminQuery.query(async () => {
    await requireEnabled();
    return getDb().select().from(schema.drafts).orderBy(desc(schema.drafts.updatedAt));
  }),

  create: adminQuery.input(draftInput).mutation(async ({ input }) => {
    await requireEnabled();
    const result = await getDb()
      .insert(schema.drafts)
      .values(input)
      .returning({ id: schema.drafts.id });
    return { success: true, id: result[0].id };
  }),

  update: adminQuery
    .input(z.object({ id: z.number(), data: draftInput }))
    .mutation(async ({ input }) => {
      await requireEnabled();
      await getDb()
        .update(schema.drafts)
        .set(input.data)
        .where(eq(schema.drafts.id, input.id));
      return { success: true };
    }),

  remove: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await requireEnabled();
      await getDb().delete(schema.drafts).where(eq(schema.drafts.id, input.id));
      return { success: true };
    }),
});
