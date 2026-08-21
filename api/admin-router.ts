import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, adminQuery } from "./middleware";
import * as fs from "node:fs";
import * as path from "node:path";

const workInput = z.object({
  slug: z.string().min(1).max(64),
  title: z.string().min(1).max(255),
  category: z.string().min(1).max(64),
  technique: z.string().max(255).default(""),
  status: z.string().max(64).default("Disponível"),
  year: z.string().max(16).default("2026"),
  price: z.string().max(64).default("Sob consulta"),
  image: z.string().min(1).max(512),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

export const adminRouter = createRouter({
  listTexts: adminQuery.query(() => getDb().select().from(schema.siteTexts)),

  updateText: adminQuery
    .input(z.object({ key: z.string().min(1), value: z.string() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.siteTexts)
        .set({ value: input.value })
        .where(eq(schema.siteTexts.key, input.key));
      return { success: true };
    }),

  listWorks: adminQuery.query(() =>
    getDb().select().from(schema.works).orderBy(asc(schema.works.sortOrder)),
  ),

  createWork: adminQuery.input(workInput).mutation(async ({ input }) => {
    await getDb().insert(schema.works).values(input);
    return { success: true };
  }),

  updateWork: adminQuery
    .input(z.object({ id: z.number(), data: workInput }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.works)
        .set(input.data)
        .where(eq(schema.works.id, input.id));
      return { success: true };
    }),

  deleteWork: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(schema.works).where(eq(schema.works.id, input.id));
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
  listSettings: adminQuery.query(() => getDb().select().from(schema.settings)),

  updateSetting: adminQuery
    .input(z.object({ key: z.string().min(1).max(128), value: z.string() }))
    .mutation(async ({ input }) => {
      await getDb()
        .insert(schema.settings)
        .values({ key: input.key, value: input.value })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value: input.value },
        });
      return { success: true };
    }),
});
