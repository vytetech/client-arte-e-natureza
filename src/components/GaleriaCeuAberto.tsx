import { Link } from "react-router";
import { WHATSAPP_URL } from "@/config";
import { useLang } from "@/lib/i18n";

const FOTOS = [
  { src: "/images/real-ancionais.jpg", i: 0 },
  { src: "/images/ceu-1.jpg", i: 1 },
  { src: "/images/ceu-2.jpg", i: 2 },
  { src: "/images/real-guardioes.jpg", i: 3 },
  { src: "/images/real-vigia.jpg", i: 4 },
  { src: "/images/real-seriemas.jpg", i: 5 },
];

export default function GaleriaCeuAberto() {
  const { t } = useLang();
  return (
    <section className="bg-[var(--c-dark)] py-24 text-[var(--c-bg)]">
      <div className="mx-auto max-w-6xl px-5">
        <div className="eyebrow text-[var(--c-accent)]">{t("gca.eyebrow")}</div>
        <h2 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
          {t("gca.title")}
        </h2>
        <p className="mt-6 max-w-2xl font-display text-lg italic leading-relaxed text-white/65">
          {t("gca.intro")}
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FOTOS.map((f) => (
            <figure key={f.src} className="group">
              <div className="overflow-hidden border border-white/10">
                <img
                  src={f.src}
                  alt={t(`gca.${f.i}.title`)}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="mt-4">
                <div className="flex items-baseline gap-3">
                  <span className="h-px w-8 shrink-0 bg-[var(--c-accent)]" />
                  <h3 className="font-display text-xl font-semibold">{t(`gca.${f.i}.title`)}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t(`gca.${f.i}.desc`)}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-10">
          <p className="max-w-md text-sm leading-relaxed text-white/55">
            {t("gca.note")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/galeria?cat=Galeria%20a%20C%C3%A9u%20Aberto"
              className="border border-[var(--c-accent)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--c-accent)] transition hover:bg-[var(--c-accent)] hover:text-[var(--c-dark)]"
            >
              {t("gca.cta_works")}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#25D366] bg-[#25D366] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-transparent hover:text-[#4ee38a]"
            >
              {t("gca.cta_visit")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
