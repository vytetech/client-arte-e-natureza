export type Lang = "pt" | "en" | "es" | "ar";

export const LANGUAGE_META: Record<
  Lang,
  { countryCode: string; localeCode: string; label: string; rtl?: boolean }
> = {
  pt: { countryCode: "BR", localeCode: "PT", label: "Português" },
  en: { countryCode: "IE", localeCode: "EN", label: "English" },
  es: { countryCode: "ES", localeCode: "ES", label: "Español" },
  ar: { countryCode: "SA", localeCode: "AR", label: "العربية", rtl: true },
};

export function formatLanguageLabel(lang: Lang) {
  const meta = LANGUAGE_META[lang];
  return `${meta.countryCode}   ${meta.localeCode}   ${meta.label}`;
}
