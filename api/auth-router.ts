import * as cookie from "cookie";
import * as crypto from "crypto";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { env } from "./lib/env";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { TRPCError } from "@trpc/server";

// Local admin credentials (username: dandan)
const ADMIN_USERNAME = "dandan";
const ADMIN_PASSWORD_SCRYPT =
  "b94372626f494e5fd4ab2ea5dceec0ca99d88d44c3a4c140ce44d83bba38ba5cef54b63b6266c3a0b7f78deb41b64e468d96ef76bbc2c64ff249cd8cd298cfa8";
const ADMIN_SALT = "atelier-detomi-v1";

function verifyPassword(password: string): boolean {
  const hash = crypto.scryptSync(password, ADMIN_SALT, 64);
  const expected = Buffer.from(ADMIN_PASSWORD_SCRYPT, "hex");
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  loginPassword: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const okUser = input.username.trim().toLowerCase() === ADMIN_USERNAME;
      const okPass = verifyPassword(input.password);
      if (!okUser || !okPass) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário ou senha incorretos.",
        });
      }

      const unionId = "local:dandan";
      await upsertUser({
        unionId,
        name: "Administrador",
        role: "admin",
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({ unionId, clientId: env.appId });
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
