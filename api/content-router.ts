import { and, asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { defaultSettings, defaultTexts, defaultWorks } from "./default-content";
import { textTranslations, workTranslations, type WorkTranslationSeed } from "@db/content-translations";
import { getDb, hasDatabaseConfig } from "./queries/connection";
import { createRouter, publicQuery } from "./middleware";

type Locale = "pt" | "en" | "es" | "ar";

function parseLocale(raw: unknown): Locale {
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

function localizedDefaultTexts(locale: Locale) {
  const localized = { ...defaultTexts };
  for (const [key, translations] of Object.entries(textTranslations)) {
    localized[key] = translations[locale] ?? "";
  }
  return localized;
}

function localizeDefaultWork(work: (typeof defaultWorks)[number], locale: Locale) {
  const translation = workTranslations[work.slug]?.[locale] as WorkTranslationSeed | undefined;
  const images = [{
    id: 0,
    workId: work.id,
    url: work.image,
    alt: work.title,
    isPrimary: true,
    sortOrder: 1,
    createdAt: work.createdAt,
  }];
  if (!translation) return locale === "pt" ? { ...work, images } : { ...work, images, title: "", technique: "", description: "" };
  return {
    ...work,
    images,
    title: translation.title,
    technique: translation.technique,
    description: translation.description,
  };
}

function coerceWorkDimensions<T extends object>(work: T): T & {
  widthCm: number | null;
  heightCm: number | null;
  thicknessCm: number | null;
} {
  const dimensions = work as T & { widthCm?: unknown; heightCm?: unknown; thicknessCm?: unknown };
  return {
    ...work,
    widthCm: dimensions.widthCm === null || dimensions.widthCm === undefined ? null : Number(dimensions.widthCm),
    heightCm: dimensions.heightCm === null || dimensions.heightCm === undefined ? null : Number(dimensions.heightCm),
    thicknessCm: dimensions.thicknessCm === null || dimensions.thicknessCm === undefined ? null : Number(dimensions.thicknessCm),
  };
}

async function listPublicWorkImages() {
  return getDb()
    .select()
    .from(schema.workImages)
    .orderBy(asc(schema.workImages.sortOrder), asc(schema.workImages.id));
}

function attachImages<T extends { id: number; image: string; title?: string; createdAt?: Date }>(
  works: T[],
  images: Awaited<ReturnType<typeof listPublicWorkImages>>,
) {
  return works.map((work) => {
    const gallery = images.filter((image) => image.workId === work.id);
    return {
      ...coerceWorkDimensions(work),
      images: gallery.length > 0
        ? gallery
        : [{
          id: 0,
          workId: work.id,
          url: work.image,
          alt: work.title ?? "",
          isPrimary: true,
          sortOrder: 1,
          createdAt: work.createdAt ?? new Date(0),
        }],
    };
  });
}

async function localizeWorks(locale: Locale) {
  const rows = await getDb().select().from(schema.works).orderBy(asc(schema.works.sortOrder));
  const images = await listPublicWorkImages();
  if (locale === "pt") return attachImages(rows, images);

  const translations = await getDb().select().from(schema.workTranslations).where(eq(schema.workTranslations.locale, locale));
  const byWorkId = new Map(translations.map((translation) => [translation.workId, translation]));
  return attachImages(rows, images).map((work) => {
    const translation = byWorkId.get(work.id);
    return translation
      ? { ...work, title: translation.title, technique: translation.technique, description: translation.description }
      : { ...work, title: "", technique: "", description: "" };
  });
}

async function localizeWorkVariants(workId: number, locale: Locale) {
  const variants = await getDb()
    .select()
    .from(schema.workVariants)
    .where(and(eq(schema.workVariants.workId, workId), eq(schema.workVariants.active, true)))
    .orderBy(asc(schema.workVariants.sortOrder), asc(schema.workVariants.id));

  if (locale === "pt") {
    return variants.map((variant) => ({ ...variant, price: Number(variant.price) }));
  }

  const translations = await getDb()
    .select()
    .from(schema.workVariantTranslations)
    .where(eq(schema.workVariantTranslations.locale, locale));
  const byVariantId = new Map(translations.map((translation) => [translation.variantId, translation]));

  return variants.map((variant) => {
    const translation = byVariantId.get(variant.id);
    return translation
      ? {
        ...variant,
        price: Number(variant.price),
        name: translation.name,
        description: translation.description,
        dimensions: translation.dimensions,
      }
      : {
        ...variant,
        price: Number(variant.price),
        name: "",
        description: "",
        dimensions: "",
      };
  });
}

function useDefaultContent() {
  return !hasDatabaseConfig();
}

export const contentRouter = createRouter({
  texts: publicQuery
    .input((raw: unknown) => parseLocale(raw))
    .query(async ({ input: locale }) => {
    if (useDefaultContent()) {
      console.warn("[content] DATABASE_URL is not configured; using default public texts.");
      return localizedDefaultTexts(locale);
    }

    const rows = await getDb().select().from(schema.siteTexts);
    const translations = await getDb()
      .select()
      .from(schema.siteTextTranslations)
      .where(eq(schema.siteTextTranslations.locale, locale));
    const byTextId = new Map(translations.map((translation) => [translation.textId, translation.value]));
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = locale === "pt" ? byTextId.get(r.id) ?? r.value : byTextId.get(r.id) ?? "";
    return map;
  }),

  works: publicQuery
    .input((raw: unknown) => parseLocale(raw))
    .query(({ input: locale }) =>
      useDefaultContent()
        ? defaultWorks.map((work) => localizeDefaultWork(work, locale))
        : localizeWorks(locale),
    ),

  settings: publicQuery.query(async () => {
    if (useDefaultContent()) {
      console.warn("[content] DATABASE_URL is not configured; using default public settings.");
      return defaultSettings;
    }
    const rows = await getDb().select().from(schema.settings);
    const map: Record<string, string> = { ...defaultSettings };
    for (const r of rows) map[r.key] = r.value;
    return map;
  }),

  workBySlug: publicQuery
    .input((raw: unknown) => {
      if (typeof raw === "string") return { slug: raw, locale: "pt" as Locale };
      if (raw && typeof raw === "object" && "slug" in raw && typeof raw.slug === "string") {
        return { slug: raw.slug, locale: parseLocale(raw) };
      }
      throw new Error("slug inválido");
    })
    .query(async ({ input }) => {
      if (useDefaultContent()) {
        const work = defaultWorks.find((item) => item.slug === input.slug);
        return work ? localizeDefaultWork(work, input.locale) : null;
      }
      const rows = await getDb()
        .select()
        .from(schema.works)
        .where(eq(schema.works.slug, input.slug))
        .limit(1);
      const work = rows.at(0);
      if (!work) return null;
      const [workImages] = await Promise.all([
        getDb()
          .select()
          .from(schema.workImages)
          .where(eq(schema.workImages.workId, work.id))
          .orderBy(asc(schema.workImages.sortOrder), asc(schema.workImages.id)),
      ]);
      const workWithImages = attachImages([work], workImages)[0];
      const variants = await localizeWorkVariants(work.id, input.locale);
      if (input.locale === "pt") return { ...workWithImages, variants };

      const translations = await getDb()
        .select()
        .from(schema.workTranslations)
        .where(and(eq(schema.workTranslations.workId, work.id), eq(schema.workTranslations.locale, input.locale)))
        .limit(1);
      const translation = translations.at(0);
      return translation
        ? { ...workWithImages, title: translation.title, technique: translation.technique, description: translation.description, variants }
        : { ...workWithImages, title: "", technique: "", description: "", variants };
    }),
});
