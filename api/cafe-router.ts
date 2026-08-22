import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, adminQuery, publicQuery } from "./middleware";

const TOGGLE_KEY = "cafe.enabled";
const locales = ["pt", "en", "es", "ar"] as const;
const localeInput = z.enum(locales);

function logCafeError(operation: string, error: unknown) {
  const err = error as { code?: string; message?: string };
  console.error("cafe_operation_failed", {
    operation,
    code: err?.code,
    message: error instanceof Error ? error.message : String(error),
  });
}

function parseLocale(raw: unknown): (typeof locales)[number] {
  if (raw === "pt" || raw === "en" || raw === "es" || raw === "ar") return raw;
  if (
    raw &&
    typeof raw === "object" &&
    "locale" in raw &&
    (raw.locale === "pt" || raw.locale === "en" || raw.locale === "es" || raw.locale === "ar")
  ) {
    return raw.locale;
  }
  return "pt";
}

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
  description: z.string().default(""),
  note: z.string().default(""),
  published: z.boolean().optional(),
  translations: z.record(localeInput, z.object({
    title: z.string().max(255).default(""),
    content: z.string().default(""),
    description: z.string().default(""),
  })).optional(),
});

async function upsertDraftTranslations(
  draftId: number,
  translations: Record<string, { title: string; content: string; description?: string }> | undefined,
) {
  if (!translations) return;
  for (const locale of locales) {
    const value = translations[locale];
    if (!value) continue;
    await getDb()
      .insert(schema.draftTranslations)
      .values({
        draftId,
        locale,
        title: value.title ?? "",
        content: value.content ?? "",
        description: value.description ?? "",
      })
      .onConflictDoUpdate({
        target: [schema.draftTranslations.draftId, schema.draftTranslations.locale],
        set: {
          title: value.title ?? "",
          content: value.content ?? "",
          description: value.description ?? "",
        },
      });
  }
}

export const cafeRouter = createRouter({
  public: publicQuery
    .input((raw: unknown) => parseLocale(raw))
    .query(async ({ input: locale }) => {
    try {
      const enabled = await isEnabled();
      if (!enabled) return { enabled: false, items: [] };

      const rows = await getDb()
        .select({
          id: schema.drafts.id,
          type: schema.drafts.type,
          title: schema.drafts.title,
          content: schema.drafts.content,
          description: schema.drafts.description,
          updatedAt: schema.drafts.updatedAt,
          createdAt: schema.drafts.createdAt,
        })
        .from(schema.drafts)
        .where(eq(schema.drafts.published, true))
        .orderBy(desc(schema.drafts.updatedAt), desc(schema.drafts.createdAt));

      const translations = await getDb()
        .select()
        .from(schema.draftTranslations)
        .where(eq(schema.draftTranslations.locale, locale));
      const byDraftId = new Map(translations.map((translation) => [translation.draftId, translation]));

      const items = rows
        .map((draft) => {
          const translation = byDraftId.get(draft.id);
          const isText = draft.type === "text";
          const title = locale === "pt" ? translation?.title || draft.title : translation?.title ?? "";
          const description = locale === "pt"
            ? translation?.description || draft.description || ""
            : translation?.description ?? "";
          const content = isText
            ? locale === "pt"
              ? translation?.content || draft.content
              : translation?.content ?? ""
            : draft.content;

          return {
            id: draft.id,
            type: draft.type,
            title,
            description,
            content,
            updatedAt: draft.updatedAt,
          };
        })
        .filter((draft) => draft.content.trim().length > 0);

      return { enabled: true, items };
    } catch (error) {
      logCafeError("cafe_public_failed", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao carregar o Espaço de Café.",
      });
    }
  }),

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
    try {
      await requireEnabled();
      const rows = await getDb().select().from(schema.drafts).orderBy(desc(schema.drafts.updatedAt));
      const translations = await getDb().select().from(schema.draftTranslations);
      const grouped = new Map<number, Record<string, { title: string; content: string; description: string }>>();
      for (const translation of translations) {
        const current = grouped.get(translation.draftId) ?? {};
        current[translation.locale] = {
          title: translation.title,
          content: translation.content,
          description: translation.description,
        };
        grouped.set(translation.draftId, current);
      }
      return rows.map((draft) => ({
        ...draft,
        translations: grouped.get(draft.id) ?? {},
      }));
    } catch (error) {
      logCafeError("cafe_list_failed", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao carregar os rascunhos do Espaço de Café.",
      });
    }
  }),

  create: adminQuery.input(draftInput).mutation(async ({ input }) => {
    await requireEnabled();
    const result = await getDb()
      .insert(schema.drafts)
      .values({
        type: input.type,
        title: input.title,
        content: input.content,
        description: input.description,
        note: input.note,
        published: input.published ?? false,
      })
      .returning({ id: schema.drafts.id });
    await upsertDraftTranslations(result[0].id, input.translations);
    return { success: true, id: result[0].id };
  }),

  update: adminQuery
    .input(z.object({ id: z.number(), data: draftInput }))
    .mutation(async ({ input }) => {
      await requireEnabled();
      await getDb()
        .update(schema.drafts)
        .set({
          type: input.data.type,
          title: input.data.title,
          content: input.data.content,
          description: input.data.description,
          note: input.data.note,
        })
        .where(eq(schema.drafts.id, input.id));
      await upsertDraftTranslations(input.id, input.data.translations);
      return { success: true };
    }),

  remove: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await requireEnabled();
      await getDb().delete(schema.drafts).where(eq(schema.drafts.id, input.id));
      return { success: true };
    }),

  setPublished: adminQuery
    .input(z.object({ id: z.number(), published: z.boolean() }))
    .mutation(async ({ input }) => {
      await requireEnabled();
      await getDb()
        .update(schema.drafts)
        .set({ published: input.published })
        .where(eq(schema.drafts.id, input.id));
      return { success: true };
    }),
});
