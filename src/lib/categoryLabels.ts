import type { LangCtx } from "@/lib/i18n";

const CATEGORY_KEYS: Record<string, string> = {
  pinturas: "category.pinturas",
  esculturas: "category.esculturas",
  "galeria a ceu aberto": "category.ceu_aberto",
  "circo & forma": "category.circo",
  recortes: "category.recortes",
  "arte ambiental": "category.ambiental",
};

function normalizeCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function categoryLabel(category: string, t: LangCtx["t"]) {
  const key = CATEGORY_KEYS[normalizeCategory(category)];
  return key ? t(key) : category;
}
