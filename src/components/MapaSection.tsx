import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useLang } from "@/lib/i18n";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=-21.095564,-44.132506";
const MAP_URL =
  "https://www.google.com/maps/place/21%C2%B005'44.0%22S+44%C2%B007'57.0%22W/@-21.0953434,-44.1356491,17z/data=!4m4!3m3!8m2!3d-21.0955636!4d-44.1325055?hl=pt-BR";
const EMBED_URL =
  "https://maps.google.com/maps?q=-21.095564,-44.132506&hl=pt-BR&z=16&output=embed";

export default function MapaSection() {
  const { t } = useLang();
  const whatsapp = useWhatsApp({ purpose: "visits" });
  return (
    <section id="como-chegar" className="border-t border-[var(--c-ink)]/10 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="eyebrow text-[var(--c-primary)]">{t("map.eyebrow")}</div>
        <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
          {t("map.title")}
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          {/* Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="border-l-2 border-[var(--c-primary)] pl-5">
              <h3 className="font-display text-xl font-semibold">{t("map.info_title")}</h3>
              <p className="mt-2 leading-relaxed text-[var(--c-ink)]/75">
                {t("map.info_text")}
              </p>
            </div>

            <div className="space-y-3 text-sm text-[var(--c-ink)]/75">
              <p className="flex gap-3">
                <span className="eyebrow w-24 shrink-0 pt-0.5 text-[var(--c-ink)]/45" style={{ fontSize: "0.55rem" }}>
                  {t("map.coords")}
                </span>
                <span className="font-mono">21°05'44.0"S · 44°07'57.0"W</span>
              </p>
              <p className="flex gap-3">
                <span className="eyebrow w-24 shrink-0 pt-0.5 text-[var(--c-ink)]/45" style={{ fontSize: "0.55rem" }}>
                  {t("map.city")}
                </span>
                <span>{t("map.city_val")}</span>
              </p>
              <p className="flex gap-3">
                <span className="eyebrow w-24 shrink-0 pt-0.5 text-[var(--c-ink)]/45" style={{ fontSize: "0.55rem" }}>
                  {t("map.visits")}
                </span>
                <span>{t("map.visits_val")}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[var(--c-primary)] bg-[var(--c-primary)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-transparent hover:text-[var(--c-primary)]"
              >
                {t("map.route")}
              </a>
              <a
                href={whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[var(--c-ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] transition hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)]"
              >
                {t("map.visit")}
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--c-primary)]/25" />
              <iframe
                src={EMBED_URL}
                title={t("map.iframe_title")}
                className="relative h-[380px] w-full border-0 bg-[var(--c-sand2)] md:h-[440px]"
                loading="eager"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 border border-[var(--c-ink)] bg-[var(--c-bg)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)]"
              >
                {t("map.open")}
              </a>
            </div>
            <p className="mt-3 text-xs italic text-[var(--c-ink)]/55">
              {t("map.note")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
