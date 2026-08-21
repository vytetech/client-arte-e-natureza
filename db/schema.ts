import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  customType,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("role", ["user", "admin"]);
export const draftType = pgEnum("draft_type", ["text", "image", "video"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  avatar: text("avatar"),
  passwordHash: text("passwordHash"),
  role: userRole("role").default("user").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  technique: varchar("technique", { length: 255 }).default("").notNull(),
  status: varchar("status", { length: 64 }).default("DISPONÍVEL").notNull(),
  year: varchar("year", { length: 16 }).default("2026").notNull(),
  price: varchar("price", { length: 64 }).default("Sob consulta").notNull(),
  couponEnabled: boolean("couponEnabled").default(false).notNull(),
  image: varchar("image", { length: 512 }).notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

export const siteTexts = pgTable("site_texts", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  value: text("value").notNull(),
});

export type SiteText = typeof siteTexts.$inferSelect;

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  mime: varchar("mime", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;

export const drafts = pgTable("drafts", {
  id: serial("id").primaryKey(),
  type: draftType("type").notNull(),
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

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
});

export type Setting = typeof settings.$inferSelect;
