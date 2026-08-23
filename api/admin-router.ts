import { z } from "zod";
import { and, asc, count, eq, ne } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, adminQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { hashPassword, validatePasswordStrength } from "./lib/password";
import { findUserByUsername, isValidUsername, normalizeUsername } from "./queries/users";
import { normalizeStatus } from "@contracts/status";
import { isValidWhatsAppNumber, isWhatsAppPurpose, normalizeWhatsAppNumber } from "@contracts/whatsapp";
import * as fs from "node:fs";
import * as path from "node:path";
import { defaultSettings } from "./default-content";

const workStatusInput = z.string().max(64).default("available").transform((value, ctx) => {
  const status = normalizeStatus(value);
  if (!status) {
    ctx.addIssue({ code: "custom", message: "Status inválido." });
    return z.NEVER;
  }
  return status;
});

const dimensionInput = z.number().min(0).max(999999.99).nullable().default(null);
const workImageInput = z.object({
  url: z.string().min(1).max(512),
  alt: z.string().max(255).default(""),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

const workInput = z.object({
  slug: z.string().min(1).max(64),
  title: z.string().min(1).max(255),
  category: z.string().min(1).max(64),
  technique: z.string().max(255).default(""),
  status: workStatusInput,
  year: z.string().max(16).default("2026"),
  price: z.string().max(64).default("Sob consulta"),
  isUniquePiece: z.boolean().default(false),
  editionNumber: z.number().int().positive().nullable().default(null),
  editionTotal: z.number().int().positive().nullable().default(null),
  editionLabel: z.string().max(64).default(""),
  widthCm: dimensionInput,
  heightCm: dimensionInput,
  thicknessCm: dimensionInput,
  image: z.string().min(1).max(512),
  images: z.array(workImageInput).default([]),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
}).superRefine((value, ctx) => {
  if (value.isUniquePiece) return;
  if ((value.editionNumber === null) !== (value.editionTotal === null)) {
    ctx.addIssue({ code: "custom", message: "Informe número e total da edição." });
  }
  if (value.editionNumber !== null && value.editionTotal !== null && value.editionNumber > value.editionTotal) {
    ctx.addIssue({ code: "custom", message: "Número da peça não pode ser maior que o total da edição." });
  }
});

const booleanSettingKeys = new Set([
  "coupon.enabled",
  "prize.reading",
  "prize.work",
  "prize.reading.link",
  "shipping.enabled",
  "shipping.note",
  "shipping.international",
  "lang.en",
  "lang.es",
  "lang.ar",
  "contact.whatsapp.1.enabled",
  "contact.whatsapp.2.enabled",
]);

const dateSettingKeys = new Set(["coupon.start", "coupon.end"]);

function assertBadRequest(condition: boolean, message: string) {
  if (!condition) {
    throw new TRPCError({ code: "BAD_REQUEST", message });
  }
}

function isDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeSettingValue(key: string, value: string) {
  const trimmed = value.trim();

  if (booleanSettingKeys.has(key)) {
    return trimmed === "1" || trimmed.toLowerCase() === "true" ? "1" : "0";
  }

  if (key === "coupon.percent") {
    if (!trimmed) return "";
    const percent = Number(trimmed);
    assertBadRequest(Number.isFinite(percent) && percent > 0 && percent <= 100, "Percentual do cupom deve ser maior que 0 e menor ou igual a 100.");
    return String(percent);
  }

  if (dateSettingKeys.has(key)) {
    assertBadRequest(!trimmed || isDateInput(trimmed), "Data do cupom inválida.");
    return trimmed;
  }

  if (key === "promotion.minimumAmount") {
    if (!trimmed) return "";
    const amount = Number(trimmed);
    assertBadRequest(Number.isFinite(amount) && amount > 0, "Valor mínimo da promoção deve ser maior que 0.");
    return String(amount);
  }

  if (key === "contact.whatsapp" || /^contact\.whatsapp\.[12]\.number$/.test(key)) {
    const digits = normalizeWhatsAppNumber(trimmed);
    if (!digits) return "";
    assertBadRequest(isValidWhatsAppNumber(digits), "Número do WhatsApp inválido.");
    return digits;
  }

  if (/^contact\.whatsapp\.[12]\.purpose$/.test(key)) {
    assertBadRequest(isWhatsAppPurpose(trimmed), "Tipo de WhatsApp inválido.");
    return trimmed;
  }

  if (/^contact\.whatsapp\.[12]\.order$/.test(key)) {
    const order = Number(trimmed);
    assertBadRequest(Number.isInteger(order) && order >= 1 && order <= 2, "Ordem do WhatsApp inválida.");
    return String(order);
  }

  return value;
}

function validateCombinedSettings(settings: Record<string, string>, changedKeys: string[]) {
  const changed = new Set(changedKeys);
  if (settings["coupon.enabled"] === "1") {
    const percent = settings["coupon.percent"]?.trim() ?? "";
    assertBadRequest(!!percent, "Informe o percentual do cupom.");
    normalizeSettingValue("coupon.percent", percent);
  }

  if (changed.has("coupon.start") || changed.has("coupon.end") || changed.has("coupon.enabled")) {
    const start = settings["coupon.start"]?.trim() ?? "";
    const end = settings["coupon.end"]?.trim() ?? "";
    assertBadRequest(!start || isDateInput(start), "Data inicial do cupom inválida.");
    assertBadRequest(!end || isDateInput(end), "Data final do cupom inválida.");
    assertBadRequest(!start || !end || end >= start, "Data final do cupom não pode ser anterior à data inicial.");
  }

  for (const id of [1, 2] as const) {
    if (settings[`contact.whatsapp.${id}.enabled`] !== "1") continue;
    const digits = normalizeWhatsAppNumber(settings[`contact.whatsapp.${id}.number`] ?? "");
    assertBadRequest(!!digits, `Informe o número do WhatsApp ${id}.`);
    assertBadRequest(isValidWhatsAppNumber(digits), `Número do WhatsApp ${id} inválido.`);
  }
}

const userRoleInput = z.enum(["admin"]);
const localeInput = z.enum(["pt", "en", "es", "ar"]);
const variantStatusInput = workStatusInput;

const variantTranslationInput = z.object({
  name: z.string().max(120).default(""),
  description: z.string().default(""),
  dimensions: z.string().max(120).default(""),
});

const variantInput = z.object({
  workId: z.number().int().positive(),
  name: z.string().trim().min(1).max(120),
  description: z.string().default(""),
  dimensions: z.string().max(120).default(""),
  price: z.number().min(0),
  active: z.boolean().default(true),
  status: variantStatusInput,
  sortOrder: z.number().int().default(0),
  translations: z.object({
    pt: variantTranslationInput.optional(),
    en: variantTranslationInput.optional(),
    es: variantTranslationInput.optional(),
    ar: variantTranslationInput.optional(),
  }).optional(),
});

type VariantTranslationPayload = z.infer<typeof variantTranslationInput>;
type WorkPayload = z.infer<typeof workInput>;

function normalizeWorkImages(input: Pick<WorkPayload, "image" | "images">) {
  const byUrl = new Map<string, z.infer<typeof workImageInput>>();
  const source = input.images.length > 0
    ? input.images
    : [{ url: input.image, alt: "", isPrimary: true, sortOrder: 1 }];

  source.forEach((image, index) => {
    const url = image.url.trim();
    if (!url) return;
    byUrl.set(url, {
      url,
      alt: image.alt.trim(),
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder || index + 1,
    });
  });

  if (!byUrl.has(input.image)) {
    byUrl.set(input.image, { url: input.image, alt: "", isPrimary: true, sortOrder: 0 });
  }

  const images = Array.from(byUrl.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = images.find((image) => image.isPrimary)?.url ?? input.image ?? images[0]?.url;
  return images.map((image, index) => ({
    ...image,
    isPrimary: image.url === primary,
    sortOrder: index + 1,
  }));
}

function workValues(input: WorkPayload) {
  const { images, ...work } = input;
  void images;
  return {
    ...work,
    image: normalizeWorkImages(input).find((item) => item.isPrimary)?.url ?? input.image,
    widthCm: input.widthCm === null ? null : String(input.widthCm),
    heightCm: input.heightCm === null ? null : String(input.heightCm),
    thicknessCm: input.thicknessCm === null ? null : String(input.thicknessCm),
  };
}

async function replaceWorkImages(workId: number, input: Pick<WorkPayload, "image" | "images">) {
  const images = normalizeWorkImages(input);
  await getDb().delete(schema.workImages).where(eq(schema.workImages.workId, workId));
  if (!images.length) return;
  await getDb().insert(schema.workImages).values(images.map((image) => ({
    workId,
    url: image.url,
    alt: image.alt,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
  })));
}

function coerceWorkDimensions<T extends { widthCm: unknown; heightCm: unknown; thicknessCm: unknown }>(work: T) {
  return {
    ...work,
    widthCm: work.widthCm === null ? null : Number(work.widthCm),
    heightCm: work.heightCm === null ? null : Number(work.heightCm),
    thicknessCm: work.thicknessCm === null ? null : Number(work.thicknessCm),
  };
}

async function upsertVariantTranslations(
  variantId: number,
  base: VariantTranslationPayload,
  translations: Partial<Record<"pt" | "en" | "es" | "ar", VariantTranslationPayload>> = {},
) {
  for (const locale of ["pt", "en", "es", "ar"] as const) {
    const translation = locale === "pt" ? translations.pt ?? base : translations[locale];
    if (!translation) continue;
    if (locale !== "pt" && !translation.name.trim() && !translation.description.trim() && !translation.dimensions.trim()) continue;
    await getDb()
      .insert(schema.workVariantTranslations)
      .values({
        variantId,
        locale,
        name: translation.name || base.name,
        description: translation.description,
        dimensions: translation.dimensions,
      })
      .onConflictDoUpdate({
        target: [schema.workVariantTranslations.variantId, schema.workVariantTranslations.locale],
        set: {
          name: translation.name || base.name,
          description: translation.description,
          dimensions: translation.dimensions,
        },
      });
  }
}

function variantValues(input: z.infer<typeof variantInput>) {
  return {
    workId: input.workId,
    name: input.name,
    description: input.description,
    dimensions: input.dimensions,
    price: String(input.price),
    active: input.active,
    status: input.status,
    sortOrder: input.sortOrder,
  };
}

const userCreateInput = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(255),
  username: z.string().trim().min(3, "Usuário deve ter ao menos 3 caracteres.").max(64),
  password: z.string().min(1),
  role: userRoleInput.default("admin"),
});

const userUpdateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1, "Nome é obrigatório.").max(255),
  username: z.string().trim().min(3, "Usuário deve ter ao menos 3 caracteres.").max(64),
  isActive: z.boolean(),
});

const userSafeFields = {
  id: schema.users.id,
  name: schema.users.name,
  username: schema.users.username,
  email: schema.users.email,
  role: schema.users.role,
  isActive: schema.users.isActive,
  createdAt: schema.users.createdAt,
  updatedAt: schema.users.updatedAt,
  lastSignInAt: schema.users.lastSignInAt,
};

function usernameUnionId(username: string) {
  return `username:${username}`;
}

async function ensureUsernameAvailable(username: string, exceptUserId?: number) {
  const existing = await findUserByUsername(username);
  if (existing && existing.id !== exceptUserId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Este usuário já está cadastrado.",
    });
  }
}

function parseUsername(username: string) {
  const normalized = normalizeUsername(username);
  if (!isValidUsername(normalized)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Usuário deve ter 3 a 64 caracteres e usar apenas letras, números, ponto, hífen ou underline.",
    });
  }
  return normalized;
}

async function countOtherActiveAdmins(userId: number) {
  const rows = await getDb()
    .select({ value: count() })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.role, "admin"),
        eq(schema.users.isActive, true),
        ne(schema.users.id, userId),
      ),
    );
  return rows[0]?.value ?? 0;
}

async function assertCanDisableOrDeleteAdmin(userId: number) {
  const otherActiveAdmins = await countOtherActiveAdmins(userId);
  if (otherActiveAdmins < 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Não é possível remover ou desativar o último administrador ativo.",
    });
  }
}

function assertValidPassword(password: string) {
  const error = validatePasswordStrength(password);
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error });
  }
}

export const adminRouter = createRouter({
  listUsers: adminQuery.query(() =>
    getDb()
      .select(userSafeFields)
      .from(schema.users)
      .orderBy(asc(schema.users.name), asc(schema.users.username)),
  ),

  createUser: adminQuery.input(userCreateInput).mutation(async ({ input }) => {
    const username = parseUsername(input.username);
    assertValidPassword(input.password);
    await ensureUsernameAvailable(username);

    const rows = await getDb()
      .insert(schema.users)
      .values({
        unionId: usernameUnionId(username),
        name: input.name,
        username,
        role: input.role,
        isActive: true,
        passwordHash: hashPassword(input.password),
      })
      .returning(userSafeFields);

    return rows[0];
  }),

  updateUser: adminQuery.input(userUpdateInput).mutation(async ({ input }) => {
    const username = parseUsername(input.username);
    const rows = await getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, input.id))
      .limit(1);
    const user = rows.at(0);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
    }

    if (user.role === "admin" && user.isActive && !input.isActive) {
      await assertCanDisableOrDeleteAdmin(user.id);
    }
    await ensureUsernameAvailable(username, user.id);

    const updated = await getDb()
      .update(schema.users)
      .set({
        name: input.name,
        username,
        isActive: input.isActive,
      })
      .where(eq(schema.users.id, input.id))
      .returning(userSafeFields);

    return updated[0];
  }),

  resetUserPassword: adminQuery
    .input(z.object({ id: z.number().int().positive(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      assertValidPassword(input.password);
      const updated = await getDb()
        .update(schema.users)
        .set({ passwordHash: hashPassword(input.password) })
        .where(eq(schema.users.id, input.id))
        .returning({ id: schema.users.id });

      if (!updated.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      return { success: true };
    }),

  deleteUser: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, input.id))
        .limit(1);
      const user = rows.at(0);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      if (user.role === "admin" && user.isActive) {
        await assertCanDisableOrDeleteAdmin(user.id);
      }

      await getDb().delete(schema.users).where(eq(schema.users.id, input.id));
      return { success: true };
    }),

  listTexts: adminQuery.query(async () => {
    const texts = await getDb().select().from(schema.siteTexts);
    const translations = await getDb().select().from(schema.siteTextTranslations);
    return texts.map((text) => ({
      ...text,
      translations: Object.fromEntries(
        translations
          .filter((translation) => translation.textId === text.id)
          .map((translation) => [translation.locale, translation.value]),
      ) as Record<"pt" | "en" | "es" | "ar", string | undefined>,
    }));
  }),

  updateText: adminQuery
    .input(z.object({ key: z.string().min(1), value: z.string() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.siteTexts)
        .set({ value: input.value })
        .where(eq(schema.siteTexts.key, input.key));
      return { success: true };
    }),

  updateTextTranslation: adminQuery
    .input(z.object({ key: z.string().min(1), locale: localeInput, value: z.string() }))
    .mutation(async ({ input }) => {
      const rows = await getDb()
        .select({ id: schema.siteTexts.id })
        .from(schema.siteTexts)
        .where(eq(schema.siteTexts.key, input.key))
        .limit(1);
      const text = rows.at(0);
      if (!text) throw new TRPCError({ code: "NOT_FOUND", message: "Texto não encontrado." });

      await getDb()
        .insert(schema.siteTextTranslations)
        .values({ textId: text.id, locale: input.locale, value: input.value })
        .onConflictDoUpdate({
          target: [schema.siteTextTranslations.textId, schema.siteTextTranslations.locale],
          set: { value: input.value },
        });

      if (input.locale === "pt") {
        await getDb()
          .update(schema.siteTexts)
          .set({ value: input.value })
          .where(eq(schema.siteTexts.id, text.id));
      }

      return { success: true };
    }),

  listWorks: adminQuery.query(async () => {
    const works = await getDb().select().from(schema.works).orderBy(asc(schema.works.sortOrder));
    const images = await getDb().select().from(schema.workImages).orderBy(asc(schema.workImages.sortOrder), asc(schema.workImages.id));
    const translations = await getDb().select().from(schema.workTranslations);
    const variants = await getDb().select().from(schema.workVariants).orderBy(asc(schema.workVariants.sortOrder), asc(schema.workVariants.id));
    const variantTranslations = await getDb().select().from(schema.workVariantTranslations);
    return works.map((work) => {
      const workImages = images.filter((image) => image.workId === work.id);
      return {
        ...coerceWorkDimensions(work),
        images: workImages.length > 0
          ? workImages
          : [{
            id: 0,
            workId: work.id,
            url: work.image,
            alt: "",
            isPrimary: true,
            sortOrder: 1,
            createdAt: work.createdAt,
          }],
        variants: variants
          .filter((variant) => variant.workId === work.id)
          .map((variant) => ({
            ...variant,
            price: Number(variant.price),
            translations: Object.fromEntries(
              variantTranslations
                .filter((translation) => translation.variantId === variant.id)
                .map((translation) => [translation.locale, {
                  name: translation.name,
                  description: translation.description,
                  dimensions: translation.dimensions,
                }]),
            ) as Record<"pt" | "en" | "es" | "ar", {
              name: string;
              description: string;
              dimensions: string;
            } | undefined>,
          })),
        translations: Object.fromEntries(
          translations
            .filter((translation) => translation.workId === work.id)
            .map((translation) => [translation.locale, {
              title: translation.title,
              category: translation.category,
              technique: translation.technique,
              description: translation.description,
            }]),
        ) as Record<"pt" | "en" | "es" | "ar", {
          title: string;
          category: string;
          technique: string;
          description: string;
        } | undefined>,
      };
    });
  }),

  createWork: adminQuery.input(workInput).mutation(async ({ input }) => {
    const rows = await getDb().insert(schema.works).values(workValues(input)).returning({ id: schema.works.id });
    const workId = rows[0]?.id;
    if (workId) {
      await replaceWorkImages(workId, input);
      await getDb()
        .insert(schema.workTranslations)
        .values({
          workId,
          locale: "pt",
          title: input.title,
          category: input.category,
          technique: input.technique,
          description: input.description,
        })
        .onConflictDoNothing();
    }
    return { success: true };
  }),

  updateWork: adminQuery
    .input(z.object({ id: z.number(), data: workInput }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.works)
        .set(workValues(input.data))
        .where(eq(schema.works.id, input.id));
      await replaceWorkImages(input.id, input.data);
      await getDb()
        .insert(schema.workTranslations)
        .values({
          workId: input.id,
          locale: "pt",
          title: input.data.title,
          category: input.data.category,
          technique: input.data.technique,
          description: input.data.description,
        })
        .onConflictDoUpdate({
          target: [schema.workTranslations.workId, schema.workTranslations.locale],
          set: {
            title: input.data.title,
            category: input.data.category,
            technique: input.data.technique,
            description: input.data.description,
          },
        });
      return { success: true };
    }),

  listWorkVariants: adminQuery
    .input(z.object({ workId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const variants = await getDb()
        .select()
        .from(schema.workVariants)
        .where(eq(schema.workVariants.workId, input.workId))
        .orderBy(asc(schema.workVariants.sortOrder), asc(schema.workVariants.id));
      const translations = await getDb().select().from(schema.workVariantTranslations);
      return variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        translations: Object.fromEntries(
          translations
            .filter((translation) => translation.variantId === variant.id)
            .map((translation) => [translation.locale, {
              name: translation.name,
              description: translation.description,
              dimensions: translation.dimensions,
            }]),
        ) as Record<"pt" | "en" | "es" | "ar", {
          name: string;
          description: string;
          dimensions: string;
        } | undefined>,
      }));
    }),

  createWorkVariant: adminQuery.input(variantInput).mutation(async ({ input }) => {
    const rows = await getDb()
      .insert(schema.workVariants)
      .values(variantValues(input))
      .returning({ id: schema.workVariants.id });
    const variantId = rows[0]?.id;
    if (!variantId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Variação não criada." });
    await upsertVariantTranslations(
      variantId,
      { name: input.name, description: input.description, dimensions: input.dimensions },
      input.translations,
    );
    return { success: true, id: variantId };
  }),

  updateWorkVariant: adminQuery
    .input(z.object({ id: z.number().int().positive(), data: variantInput.omit({ workId: true }).extend({ workId: z.number().int().positive().optional() }) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.workVariants)
        .set({
          name: input.data.name,
          description: input.data.description,
          dimensions: input.data.dimensions,
          price: String(input.data.price),
          active: input.data.active,
          status: input.data.status,
          sortOrder: input.data.sortOrder,
        })
        .where(eq(schema.workVariants.id, input.id));
      await upsertVariantTranslations(
        input.id,
        { name: input.data.name, description: input.data.description, dimensions: input.data.dimensions },
        input.data.translations,
      );
      return { success: true };
    }),

  toggleWorkVariant: adminQuery
    .input(z.object({ id: z.number().int().positive(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.workVariants)
        .set({ active: input.active })
        .where(eq(schema.workVariants.id, input.id));
      return { success: true };
    }),

  deleteWorkVariant: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await getDb().delete(schema.workVariants).where(eq(schema.workVariants.id, input.id));
      return { success: true };
    }),

  reorderWorkVariants: adminQuery
    .input(z.object({ orderedIds: z.array(z.number().int().positive()).min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (let i = 0; i < input.orderedIds.length; i++) {
        await db
          .update(schema.workVariants)
          .set({ sortOrder: i + 1 })
          .where(eq(schema.workVariants.id, input.orderedIds[i]));
      }
      return { success: true };
    }),

  updateWorkTranslation: adminQuery
    .input(z.object({
      id: z.number(),
      locale: localeInput,
      data: z.object({
        title: z.string().min(1).max(255),
        category: z.string().min(1).max(64),
        technique: z.string().max(255).default(""),
        description: z.string().default(""),
      }),
    }))
    .mutation(async ({ input }) => {
      await getDb()
        .insert(schema.workTranslations)
        .values({
          workId: input.id,
          locale: input.locale,
          title: input.data.title,
          category: input.data.category,
          technique: input.data.technique,
          description: input.data.description,
        })
        .onConflictDoUpdate({
          target: [schema.workTranslations.workId, schema.workTranslations.locale],
          set: {
            title: input.data.title,
            category: input.data.category,
            technique: input.data.technique,
            description: input.data.description,
          },
        });

      if (input.locale === "pt") {
        await getDb()
          .update(schema.works)
          .set({
            title: input.data.title,
            category: input.data.category,
            technique: input.data.technique,
            description: input.data.description,
          })
          .where(eq(schema.works.id, input.id));
      }

      return { success: true };
    }),

  deleteWork: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(schema.works).where(eq(schema.works.id, input.id));
      return { success: true };
    }),

  setWorkCoupon: adminQuery
    .input(z.object({ id: z.number(), enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.works)
        .set({ couponEnabled: input.enabled })
        .where(eq(schema.works.id, input.id));
      return { success: true };
    }),

  listImages: adminQuery.query(() => {
    const dir = path.resolve(process.cwd(), "public/images");
    try {
      return fs
        .readdirSync(dir)
        .filter((f) => /\.(jpe?g|png|gif|webp|svg)$/i.test(f))
        .map((f) => `/images/${f}`)
        .sort();
    } catch {
      return [] as string[];
    }
  }),

  reorderWorks: adminQuery
    .input(z.object({ orderedIds: z.array(z.number()).min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (let i = 0; i < input.orderedIds.length; i++) {
        await db
          .update(schema.works)
          .set({ sortOrder: i + 1 })
          .where(eq(schema.works.id, input.orderedIds[i]));
      }
      return { success: true };
    }),

  // ---- MEDIA (uploads) ----
  listMedia: adminQuery.query(async () => {
    const rows = await getDb()
      .select({
        id: schema.media.id,
        name: schema.media.name,
        mime: schema.media.mime,
        size: schema.media.size,
        createdAt: schema.media.createdAt,
      })
      .from(schema.media)
      .orderBy(asc(schema.media.id));
    return rows.map((r) => ({ ...r, url: `/api/media/${r.id}` }));
  }),

  uploadMedia: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        mime: z
          .string()
          .regex(
            /^(image\/(jpeg|jpg|png|gif|webp|svg\+xml|avif|bmp|x-icon|vnd\.microsoft\.icon)|video\/(mp4|webm|ogg|quicktime))$/i,
            "Formato não suportado (use imagem JPG/PNG/GIF/WebP/SVG ou vídeo MP4/WebM)",
          ),
        dataBase64: z.string().min(1).max(70 * 1024 * 1024),
      }),
    )
    .mutation(async ({ input }) => {
      const buf = Buffer.from(input.dataBase64, "base64");
      if (buf.length > 50 * 1024 * 1024) {
        throw new Error("Arquivo muito grande (máx. 50 MB).");
      }
      const result = await getDb().insert(schema.media).values({
        name: input.name,
        mime: input.mime,
        size: buf.length,
        data: buf,
      }).returning({ id: schema.media.id });
      const id = result[0].id;
      return { success: true, id, url: `/api/media/${id}` };
    }),

  renameMedia: adminQuery
    .input(z.object({ id: z.number(), name: z.string().min(1).max(255) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.media)
        .set({ name: input.name })
        .where(eq(schema.media.id, input.id));
      return { success: true };
    }),

  deleteMedia: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(schema.media).where(eq(schema.media.id, input.id));
      return { success: true };
    }),

  // ---- SETTINGS (design / seções) ----
  listSettings: adminQuery.query(async () => {
    const rows = await getDb().select().from(schema.settings);
    const map = new Map(Object.entries(defaultSettings).map(([key, value]) => [key, { key, value }]));
    for (const row of rows) map.set(row.key, row);
    const explicitKeys = new Set(rows.map((row) => row.key));
    const legacyWhatsApp = rows.find((row) => row.key === "contact.whatsapp")?.value;
    if (legacyWhatsApp && !explicitKeys.has("contact.whatsapp.1.number")) {
      map.set("contact.whatsapp.1.number", { key: "contact.whatsapp.1.number", value: legacyWhatsApp });
    }
    return Array.from(map.values());
  }),

  updateSetting: adminQuery
    .input(z.object({ key: z.string().min(1).max(128), value: z.string() }))
    .mutation(async ({ input }) => {
      const value = normalizeSettingValue(input.key, input.value);
      const currentRows = await getDb().select().from(schema.settings);
      const current = Object.fromEntries(currentRows.map((setting) => [setting.key, setting.value]));
      validateCombinedSettings({ ...current, [input.key]: value }, [input.key]);

      await getDb()
        .insert(schema.settings)
        .values({ key: input.key, value })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value },
        });
      return { success: true };
    }),

  updateSettings: adminQuery
    .input(z.object({ values: z.record(z.string().min(1).max(128), z.string()) }))
    .mutation(async ({ input }) => {
      const normalized = Object.fromEntries(
        Object.entries(input.values).map(([key, value]) => [key, normalizeSettingValue(key, value)]),
      );
      const currentRows = await getDb().select().from(schema.settings);
      const current = Object.fromEntries(currentRows.map((setting) => [setting.key, setting.value]));
      validateCombinedSettings({ ...current, ...normalized }, Object.keys(normalized));

      for (const [key, value] of Object.entries(normalized)) {
        await getDb()
          .insert(schema.settings)
          .values({ key, value })
          .onConflictDoUpdate({
            target: schema.settings.key,
            set: { value },
          });
      }
      return { success: true };
    }),
});
