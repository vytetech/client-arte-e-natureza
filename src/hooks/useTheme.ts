import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

export const FONT_OPTIONS = [
  "Cormorant Garamond",
  "Playfair Display",
  "EB Garamond",
  "Lora",
  "Merriweather",
  "Inter",
  "Montserrat",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Space Mono",
  "Cairo",
  "Amiri",
];

const FONT_FALLBACK: Record<string, string> = {
  "Cormorant Garamond": '"Cormorant Garamond", "Georgia", serif',
  "Playfair Display": '"Playfair Display", "Georgia", serif',
  "EB Garamond": '"EB Garamond", "Georgia", serif',
  Lora: '"Lora", "Georgia", serif',
  Merriweather: '"Merriweather", "Georgia", serif',
  Inter: '"Inter", -apple-system, sans-serif',
  Montserrat: '"Montserrat", -apple-system, sans-serif',
  Poppins: '"Poppins", -apple-system, sans-serif',
  Roboto: '"Roboto", -apple-system, sans-serif',
  "Open Sans": '"Open Sans", -apple-system, sans-serif',
  "Space Mono": '"Space Mono", monospace',
  Cairo: '"Cairo", sans-serif',
  Amiri: '"Amiri", serif',
};

function ensureFontLoaded(family: string) {
  if (!family || !FONT_OPTIONS.includes(family)) return;
  const id = `gfont-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap`;
  document.head.appendChild(link);
}

export function applyTheme(s: Record<string, string>) {
  const root = document.documentElement.style;
  const colors: Record<string, string> = {
    "design.bg": "--c-bg",
    "design.ink": "--c-ink",
    "design.primary": "--c-primary",
    "design.accent": "--c-accent",
    "design.dark": "--c-dark",
    "design.sand": "--c-sand",
    "design.sand2": "--c-sand2",
  };
  for (const [key, cssVar] of Object.entries(colors)) {
    const v = s[key];
    if (v && /^#[0-9a-fA-F]{6}$/.test(v)) root.setProperty(cssVar, v);
  }

  const fd = s["design.fontDisplay"];
  if (fd && FONT_FALLBACK[fd]) {
    ensureFontLoaded(fd);
    root.setProperty("--font-display", FONT_FALLBACK[fd]);
  }
  const fb = s["design.fontBody"];
  if (fb && FONT_FALLBACK[fb]) {
    ensureFontLoaded(fb);
    root.setProperty("--font-body", FONT_FALLBACK[fb]);
  }

  const size = Number(s["design.baseSize"]);
  if (size >= 85 && size <= 120) root.setProperty("--size-base", `${size}%`);

  root.setProperty("--headings-weight", s["design.headingsBold"] === "0" ? "500" : "700");
  root.setProperty("--headings-style", s["design.headingsItalic"] === "1" ? "italic" : "normal");
  root.setProperty("--body-weight", s["design.bodyBold"] === "1" ? "500" : "400");
}

export function useTheme() {
  const { data: settings } = trpc.content.settings.useQuery(undefined, {
    staleTime: 60_000,
    retry: false,
  });
  useEffect(() => {
    if (settings) applyTheme(settings);
  }, [settings]);
}

export function useSettings() {
  const { data: settings } = trpc.content.settings.useQuery(undefined, {
    staleTime: 60_000,
    retry: false,
  });
  const s = (key: string, fallback: string) => settings?.[key] ?? fallback;
  const visible = (key: string) => (settings?.[key] ?? "1") !== "0";
  return { settings: settings ?? {}, s, visible };
}
