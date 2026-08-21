import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useLang } from "@/lib/i18n";
import { statusTranslationKey } from "@contracts/status";
import { categoryLabel } from "@/lib/categoryLabels";

const ARTIST_PHOTOS = [
  { src: "/images/bastidores-1.jpg", key: "gal.bast0" },
  { src: "/images/bastidores-2.jpg", key: "gal.bast1" },
  { src: "/images/bastidores-3.jpg", key: "gal.bast2" },
  { src: "/images/bastidores-4.jpg", key: "gal.bast3" },
];

const AMBIENT_PHOTOS = [
  { src: "/images/amb-1.jpg", key: "gal.amb0" },
  { src: "/images/amb-2.jpg", key: "gal.amb1" },
  { src: "/images/amb-3.jpg", key: "gal.amb2" },
];

export default function Galeria() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") ?? "";
  const { t, lang } = useLang();
  const whatsapp = useWhatsApp();
  const { data: works, isLoading } = trpc.content.works.useQuery(lang);

  const categories = Array.from(new Set((works ?? []).map((w) => w.category)));
  const filtered = cat ? (works ?? []).filter((w) => w.category === cat) : (works ?? []);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="eyebrow text-[var(--c-primary)]">{t("gal.eyebrow")}</div>
        <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">{t("gal.title")}</h1>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-b border-[var(--c-ink)]/10 pb-5">
          <button
            onClick={() => setParams({})}
            className={`font-display text-lg transition ${
              !cat ? "border-b border-[var(--c-primary)] font-semibold text-[var(--c-primary)]" : "text-[var(--c-ink)]/55 hover:text-[var(--c-primary)]"
            }`}
          >
            {t("gal.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setParams({ cat: c })}
              className={`font-display text-lg transition ${
                cat === c ? "border-b border-[var(--c-primary)] font-semibold text-[var(--c-primary)]" : "text-[var(--c-ink)]/55 hover:text-[var(--c-primary)]"
              }`}
            >
              {categoryLabel(c, t)}
            </button>
          ))}
        </div>

        {isLoading && <p className="mt-14 text-[var(--c-ink)]/60">{t("gal.loading")}</p>}

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <Link key={w.slug} to={`/obra/${w.slug}`} className="group">
              <div className="overflow-hidden bg-[var(--c-sand2)]">
                <img
                  src={w.image}
                  alt={w.title}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="eyebrow text-[var(--c-primary)]" style={{ fontSize: "0.55rem" }}>
                  {categoryLabel(w.category, t)}
                </span>
                <span className="text-xs text-[var(--c-ink)]/45">{w.year}</span>
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-semibold transition group-hover:text-[var(--c-primary)]">
                {w.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--c-ink)]/55">{w.technique}</p>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--c-ink)]/10 pt-3">
                <span className="font-display text-lg font-semibold">{w.price}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--c-ink)]/50">
                  {t(statusTranslationKey(w.status))}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* BASTIDORES DO ATELIÊ */}
        <div className="mt-24 border-t border-[var(--c-ink)]/10 pt-16">
          <div className="eyebrow text-[var(--c-primary)]">{t("gal.bast_eyebrow")}</div>
          <h2 className="mt-3 font-display text-3xl font-semibold">{t("gal.bast_title")}</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {ARTIST_PHOTOS.map((p) => (
              <figure key={p.src} className="group">
                <div className="overflow-hidden">
                  <img
                    src={p.src}
                    alt={t(p.key)}
                    className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{t(p.key)}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* O ATELIÊ E SUAS PAREDES */}
        <div className="mt-16">
          <div className="eyebrow text-[var(--c-primary)]">{t("gal.amb_eyebrow")}</div>
          <h2 className="mt-3 font-display text-3xl font-semibold">{t("gal.amb_title")}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {AMBIENT_PHOTOS.map((p) => (
              <figure key={p.src} className="group">
                <div className="overflow-hidden">
                  <img
                    src={p.src}
                    alt={t(p.key)}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{t(p.key)}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-[var(--c-dark)] px-8 py-12 text-center text-[var(--c-bg)]">
          <h3 className="font-display text-3xl font-semibold">{t("gal.cta_title")}</h3>
          <p className="mx-auto mt-3 max-w-md font-display text-lg italic text-white/65">
            {t("gal.cta_text")}
          </p>
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block border border-[#25D366] bg-[#25D366] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[#4ee38a]"
          >
            {t("gal.cta_btn")}
          </a>
        </div>
      </section>
    </Layout>
  );
}
