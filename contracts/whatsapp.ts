export const WHATSAPP_PURPOSES = ["general", "visits", "sales"] as const;
export type WhatsAppPurpose = (typeof WHATSAPP_PURPOSES)[number];

export type WhatsAppContact = {
  id: 1 | 2;
  number: string;
  displayNumber: string;
  description: string;
  purpose: WhatsAppPurpose;
  order: number;
};

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidWhatsAppNumber(value: string) {
  const digits = normalizeWhatsAppNumber(value);
  return /^[1-9]\d{9,14}$/.test(digits);
}

export function formatWhatsAppNumber(value: string) {
  const digits = normalizeWhatsAppNumber(value);
  if (!digits) return "";

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4);
    const local = digits.slice(4);
    const prefix = local.length === 9 ? local.slice(0, 5) : local.slice(0, 4);
    const suffix = local.length === 9 ? local.slice(5) : local.slice(4);
    return `+55 (${ddd}) ${prefix}-${suffix}`;
  }

  return `+${digits}`;
}

export function isWhatsAppPurpose(value: string): value is WhatsAppPurpose {
  return WHATSAPP_PURPOSES.includes(value as WhatsAppPurpose);
}

export function normalizeWhatsAppPurpose(value: string): WhatsAppPurpose {
  return isWhatsAppPurpose(value) ? value : "general";
}

export function getWhatsAppUrl(value: string, message?: string) {
  const digits = normalizeWhatsAppNumber(value);
  if (!digits) return "";

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const buildWhatsAppUrl = getWhatsAppUrl;
