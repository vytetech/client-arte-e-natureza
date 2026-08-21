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

function optionalUrl(name: string): string {
  const value = read(name);
  if (!value) return "";
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
}

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = requiredInProduction("DATABASE_URL");
const appSecret = isProduction
  ? required("APP_SECRET")
  : read("APP_SECRET") || "development-only-session-secret";
const appId = read("APP_ID") || (isProduction ? "" : "local-admin");
const kimiAuthUrl = optionalUrl("KIMI_AUTH_URL");
const kimiOpenUrl = optionalUrl("KIMI_OPEN_URL");
const hasKimiOAuth = Boolean(appId && read("APP_SECRET") && kimiAuthUrl && kimiOpenUrl);

if (isProduction && (kimiAuthUrl || kimiOpenUrl || appId) && !hasKimiOAuth) {
  throw new Error(
    "Kimi OAuth is partially configured. Set APP_ID, APP_SECRET, KIMI_AUTH_URL and KIMI_OPEN_URL, or remove Kimi variables.",
  );
}

export const env = {
  appId,
  appSecret,
  isProduction,
  databaseUrl,
  hasDatabase: Boolean(databaseUrl),
  kimiAuthUrl,
  kimiOpenUrl,
  hasKimiOAuth,
  ownerUnionId: read("OWNER_UNION_ID"),
};
