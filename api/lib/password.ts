import * as crypto from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 } as const;

export const MIN_PASSWORD_LENGTH = 10;

export function validatePasswordStrength(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS)
    .toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string | null | undefined) {
  if (!passwordHash) return false;

  const [algorithm, salt, hashHex] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;

  const actual = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
