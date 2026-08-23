import Layout from "@/components/Layout";
import { useTexts } from "@/hooks/useTexts";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useLang } from "@/lib/i18n";

export default function Exposicoes() {
  const { t } = useTexts();
  const { t: tr } = useLang();
  const whatsapp = useWhatsApp({ purpose: "sales" });

  return (
    <Layout>
      <section className="bg-[var(--c-dark)] py-20 text-[var(--c-bg)]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-accent)]">{tr("expo.eyebrow")}</div>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">
            {t("expo_title", tr("expo.title_fallback"))}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        {/* Banner: Recortes do Cerrado */}
        <div className="grid items-stretch gap-0 overflow-hidden bg-white shadow-[0_10px_40px_rgba(26,23,18,0.08)] md:grid-cols-2">
          <img
            src="/images/expo-recortes-real.jpg"
            alt={tr("expo.banner_recortes_alt")}
            className="h-full max-h-[560px] w-full object-cover"
          />
          <div className="flex flex-col justify-center p-10">
            <span className="eyebrow w-fit bg-[var(--c-primary)] px-4 py-1.5 text-[var(--c-bg)]" style={{ fontSize: "0.55rem" }}>
              {tr("expo.badge")}
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold text-[var(--c-primary)]">
              {t("expo_recortes_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-[var(--c-primary)]/40" />
            {t("expo_recortes_text").split("\n\n").map((p, i) => (
              <p key={i} className="mt-5 leading-relaxed text-[var(--c-ink)]/80">{p}</p>
            ))}
          </div>
        </div>

        {/* Terra Brasilis */}
        <div className="mt-14 grid items-stretch gap-0 overflow-hidden bg-white shadow-[0_10px_40px_rgba(26,23,18,0.08)] md:grid-cols-2">
          <div className="order-2 flex flex-col justify-center p-10 md:order-1">
            <span className="eyebrow w-fit bg-[var(--c-dark)] px-4 py-1.5 text-[var(--c-bg)]" style={{ fontSize: "0.55rem" }}>
              {tr("expo.badge")}
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold">{t("expo_terra_title")}</h2>
            <div className="mt-4 h-px w-12 bg-[var(--c-ink)]/30" />
            {t("expo_terra_text").split("\n\n").map((p, i) => (
              <p key={i} className="mt-5 leading-relaxed text-[var(--c-ink)]/80">{p}</p>
            ))}
          </div>
          <img
            src="/images/expo-terra-real.jpg"
            alt={tr("expo.banner_terra_alt")}
            className="order-1 h-full max-h-[560px] w-full object-cover md:order-2"
          />
        </div>

        {/* Registros das mostras */}
        <div className="mt-16">
          <div className="eyebrow text-[var(--c-primary)]">{tr("expo.reg_eyebrow")}</div>
          <h2 className="mt-3 font-display text-3xl font-semibold">{tr("expo.reg_title")}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { src: "/images/expo-terra-2.jpg", key: "expo.photo0" },
              { src: "/images/artist-real-2.jpg", key: "expo.photo1" },
              { src: "/images/amb-1.jpg", key: "expo.photo2" },
            ].map((f) => (
              <figure key={f.src} className="group">
                <div className="overflow-hidden">
                  <img
                    src={f.src}
                    alt={tr(f.key)}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{tr(f.key)}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-16 border border-[var(--c-ink)]/15 px-8 py-12 text-center">
          <h3 className="font-display text-2xl font-semibold">
            {tr("expo.cta_title")}
          </h3>
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block border border-[var(--c-ink)] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] transition hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)]"
          >
            {tr("expo.cta_btn")}
          </a>
        </div>
      </section>
    </Layout>
  );
}
