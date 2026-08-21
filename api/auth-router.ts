import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./lib/session";
import { verifyPassword } from "./lib/password";
import { findUserByEmail, normalizeEmail } from "./queries/users";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./queries/connection";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  loginPassword: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.username);
      const user = await findUserByEmail(email);
      const okPass = verifyPassword(input.password, user?.passwordHash);
      if (!user || user.role !== "admin" || !user.isActive || !okPass) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário ou senha incorretos.",
        });
      }

      await getDb()
        .update(schema.users)
        .set({ lastSignInAt: new Date() })
        .where(eq(schema.users.id, user.id));

      const token = await signSessionToken({ unionId: user.unionId });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          // Sem maxAge: cookie de sessão — expira ao fechar o navegador,
          // exigindo usuário e senha a cada acesso à área administrativa.
        }),
      );
      return { success: true };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
