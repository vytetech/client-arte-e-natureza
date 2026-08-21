import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 75 * 1024 * 1024 }));

// Serve uploaded media from the database
app.get("/api/media/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);
  const { getDb } = await import("./queries/connection");
  const schema = await import("@db/schema");
  const { eq } = await import("drizzle-orm");
  const rows = await getDb()
    .select()
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);
  const row = rows.at(0);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.body(new Uint8Array(row.data), 200, {
    "Content-Type": row.mime,
    "Content-Length": String(row.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Security-Policy": "script-src 'none'",
  });
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
