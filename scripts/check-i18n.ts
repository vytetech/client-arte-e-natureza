import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const files = [
  resolve(root, "src/lib/i18n.tsx"),
  resolve(root, "src/lib/adminI18n.ts"),
];
const langs = ["pt", "en", "es", "ar"] as const;

type Lang = (typeof langs)[number];

function extractDict(source: string, name: Lang) {
  const start = source.indexOf(`${name}: {`);
  if (start === -1) return [];

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = start;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      escaped = char === "\\" && !escaped;
      if (char === "\"" && !escaped) inString = false;
      if (char !== "\\") escaped = false;
      continue;
    }
    if (char === "\"") inString = true;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const block = source.slice(start, end);
  return [...block.matchAll(/^\s+"([^"]+)":/gm)].map((match) => match[1]);
}

const keysByLang: Record<Lang, string[]> = { pt: [], en: [], es: [], ar: [] };

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const isAdmin = file.endsWith("adminI18n.ts");
  for (const lang of langs) {
    const keys = isAdmin ? extractDict(source, lang) : [...source.matchAll(new RegExp(`const ${lang}: Dict = \\{([\\s\\S]*?)\\n\\};`, "gm"))]
      .flatMap((match) => [...match[1].matchAll(/^\s+"([^"]+)":/gm)].map((keyMatch) => keyMatch[1]));
    keysByLang[lang].push(...keys);
  }
}

let failed = false;
const base = new Set(keysByLang.pt);

for (const lang of langs) {
  const keys = keysByLang[lang];
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
  const missing = [...base].filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !base.has(key));

  if (duplicates.length || missing.length || extra.length) {
    failed = true;
    console.error(`[i18n] ${lang}`, { duplicates, missing, extra });
  } else {
    console.log(`[i18n] ${lang}: ${keys.length} keys OK`);
  }
}

if (failed) process.exit(1);
