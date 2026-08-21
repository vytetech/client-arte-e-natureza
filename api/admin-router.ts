import { z } from "zod";
import { and, asc, count, eq, ne } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, adminQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { hashPassword, validatePasswordStrength } from "./lib/password";
import { findUserByEmail, normalizeEmail } from "./queries/users";
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

const userRoleInput = z.enum(["admin"]);

const userCreateInput = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(255),
  email: z.string().trim().email("E-mail inválido.").max(320),
  password: z.string().min(1),
  role: userRoleInput.default("admin"),
});

const userUpdateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1, "Nome é obrigatório.").max(255),
  email: z.string().trim().email("E-mail inválido.").max(320),
  isActive: z.boolean(),
});

const userSafeFields = {
  id: schema.users.id,
  name: schema.users.name,
  email: schema.users.email,
  role: schema.users.role,
  isActive: schema.users.isActive,
  createdAt: schema.users.createdAt,
  updatedAt: schema.users.updatedAt,
  lastSignInAt: schema.users.lastSignInAt,
};

function emailUnionId(email: string) {
  return `email:${email}`;
}

async function ensureEmailAvailable(email: string, exceptUserId?: number) {
  const existing = await findUserByEmail(email);
  if (existing && existing.id !== exceptUserId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Este e-mail já está cadastrado.",
    });
  }
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
      .orderBy(asc(schema.users.name), asc(schema.users.email)),
  ),

  createUser: adminQuery.input(userCreateInput).mutation(async ({ input }) => {
    const email = normalizeEmail(input.email);
    assertValidPassword(input.password);
    await ensureEmailAvailable(email);

    const rows = await getDb()
      .insert(schema.users)
      .values({
        unionId: emailUnionId(email),
        name: input.name,
        email,
        role: input.role,
        isActive: true,
        passwordHash: hashPassword(input.password),
      })
      .returning(userSafeFields);

    return rows[0];
  }),

  updateUser: adminQuery.input(userUpdateInput).mutation(async ({ input }) => {
    const email = normalizeEmail(input.email);
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
    await ensureEmailAvailable(email, user.id);

    const updated = await getDb()
      .update(schema.users)
      .set({
        name: input.name,
        email,
        unionId: emailUnionId(email),
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
