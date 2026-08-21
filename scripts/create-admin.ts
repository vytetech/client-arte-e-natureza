import "dotenv/config";
import * as schema from "@db/schema";
import { hashPassword, validatePasswordStrength } from "../api/lib/password";
import { closeDb, getDb } from "../api/queries/connection";
import { findUserByEmail, normalizeEmail } from "../api/queries/users";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to bootstrap the first administrator.`);
  }
  return value;
}

async function main() {
  const name = requiredEnv("ADMIN_NAME");
  const email = normalizeEmail(requiredEnv("ADMIN_EMAIL"));
  const password = requiredEnv("ADMIN_PASSWORD");
  const passwordError = validatePasswordStrength(password);

  if (passwordError) {
    throw new Error(passwordError);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    console.log("Admin already exists; no changes made.");
    return;
  }

  await getDb().insert(schema.users).values({
    unionId: `email:${email}`,
    name,
    email,
    role: "admin",
    isActive: true,
    passwordHash: hashPassword(password),
  });

  console.log("Admin created successfully.");
}

main()
  .then(async () => {
    await closeDb();
    process.exit(0);
  })
  .catch(async (error) => {
    await closeDb();
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
