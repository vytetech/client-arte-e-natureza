export type Lang = "pt" | "en" | "es" | "ar";

export const LANGUAGE_META: Record<Lang, { label: string; rtl?: boolean }> = {
  pt: { label: "Português" },
  en: { label: "English" },
  es: { label: "Español" },
  ar: { label: "العربية", rtl: true },
};

export function formatLanguageLabel(lang: Lang) {
  return LANGUAGE_META[lang].label;
}
