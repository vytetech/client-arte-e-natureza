import { Link } from "react-router";
import { useSettings } from "@/hooks/useTheme";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useLang } from "@/lib/i18n";

function formatBRL(value: string, lang: string) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 7000;
  const locale = lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : lang === "ar" ? "ar" : "es";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(safeAmount);
}

function text(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template,
  );
}

export default function PromotionSection({ variant = "home" }: { variant?: "home" | "compact" }) {
  const { s } = useSettings();
  const { t, lang } = useLang();
  const readingOn = s("prize.reading", "0") === "1";
  const workOn = s("prize.work", "0") === "1";
  const amount = formatBRL(s("promotion.minimumAmount", "7000"), lang);
  const benefits = [
    readingOn ? t("promotion.reading") : "",
    workOn ? t("promotion.work") : "",
  ].filter(Boolean);
  const whatsapp = useWhatsApp(t("promotion.whatsapp_message"));

  if (benefits.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className="mt-4 rounded-lg border border-[var(--c-accent)]/50 bg-[#fff8ec] px-4 py-3">
        <div className="text-sm font-semibold text-[var(--c-ink)]">
          {t("promotion.available")}
        </div>
        <p className="mt-1 text-sm text-[var(--c-ink)]/75">
          {text(t("promotion.detail"), { amount })}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--c-ink)]/75">
          {benefits.map((benefit) => (
            <li key={benefit}>• {benefit}</li>
          ))}
        </ul>
        <a
          href={whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--c-primary)] transition hover:opacity-75"
        >
          {t("promotion.cta")}
        </a>
      </div>
    );
  }

  return (
    <section className="border-y border-[var(--c-ink)]/10 bg-[#fff8ec] py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="eyebrow text-[var(--c-primary)]">{t("promotion.eyebrow")}</div>
          <h2 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
            {t("promotion.title")}
          </h2>
          <p className="mt-5 font-display text-xl italic text-[var(--c-ink)]/75">
            {text(t("promotion.minimum"), { amount })}
          </p>
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block border border-[var(--c-primary)] bg-[var(--c-primary)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-transparent hover:text-[var(--c-primary)]"
          >
            {t("promotion.cta")}
          </a>
        </div>
        <div className="rounded-lg border border-[var(--c-accent)]/40 bg-white/70 p-6">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-ink)]/45">
            {t("promotion.benefits")}
          </div>
          <ul className="mt-5 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-lg text-[var(--c-ink)]/80">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--c-primary)]" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/galeria"
            className="mt-7 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-primary)] transition hover:opacity-75"
          >
            {t("home.cta_works")}
          </Link>
        </div>
      </div>
    </section>
  );
}
