export type Lang = "pt" | "en" | "es" | "ar";

export const LANGUAGE_META: Record<Lang, { countryCode: string; label: string; rtl?: boolean }> = {
  pt: { countryCode: "BR", label: "Português" },
  en: { countryCode: "IE", label: "English" },
  es: { countryCode: "ES", label: "Español" },
  ar: { countryCode: "PS", label: "العربية", rtl: true },
};

export function formatLanguageLabel(lang: Lang) {
  return LANGUAGE_META[lang].label;
}
