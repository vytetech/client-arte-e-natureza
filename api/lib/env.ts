import "dotenv/config";

function read(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function required(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function requiredInProduction(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value?.trim() ?? "";
}

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = requiredInProduction("DATABASE_URL");
const sessionSecret = isProduction
  ? required("SESSION_SECRET")
  : read("SESSION_SECRET") || "development-only-session-secret";

export const env = {
  sessionSecret,
  isProduction,
  databaseUrl,
  hasDatabase: Boolean(databaseUrl),
};
