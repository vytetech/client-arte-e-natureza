import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  customType,
  // bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const works = mysqlTable("works", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  technique: varchar("technique", { length: 255 }).default("").notNull(),
  status: varchar("status", { length: 64 }).default("DISPONÍVEL").notNull(),
  year: varchar("year", { length: 16 }).default("2026").notNull(),
  price: varchar("price", { length: 64 }).default("Sob consulta").notNull(),
  image: varchar("image", { length: 512 }).notNull(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

export const siteTexts = mysqlTable("site_texts", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  value: text("value").notNull(),
});

export type SiteText = typeof siteTexts.$inferSelect;

const longblob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "longblob";
  },
});

export const media = mysqlTable("media", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  mime: varchar("mime", { length: 100 }).notNull(),
  size: int("size").notNull(),
  data: longblob("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;

export const drafts = mysqlTable("drafts", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ["text", "image", "video"]).notNull(),
  title: varchar("title", { length: 255 }).default("").notNull(),
  content: text("content").notNull(), // texto livre ou URL da mídia (/api/media/:id)
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Draft = typeof drafts.$inferSelect;

export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
});

export type Setting = typeof settings.$inferSelect;
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
