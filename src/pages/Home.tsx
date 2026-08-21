import { Link } from "react-router";
import Layout from "@/components/Layout";
import MapaSection from "@/components/MapaSection";
import GaleriaCeuAberto from "@/components/GaleriaCeuAberto";
import { useTexts } from "@/hooks/useTexts";
import { useSettings } from "@/hooks/useTheme";
import { WHATSAPP_URL } from "@/config";
import { useLang } from "@/lib/i18n";

function Paras({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split("\n\n").map((p, i) => (
        <p key={i} className="mb-4 leading-relaxed last:mb-0">
          {p}
        </p>
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useTexts();
  const { visible } = useSettings();
  const { t: tr } = useLang();

  return (
    <Layout>
      {/* HERO — Tiradentes em tela cheia, imagem fixa */}
      <section className="relative flex min-h-[94vh] items-end">
        <img
          src="/images/real-tiradentes-panel.jpg"
          alt={tr("home.hero_alt")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/15" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 text-white">
          <div className="eyebrow fade-up text-[var(--c-accent)]" style={{ animationDelay: "0.1s" }}>
            {tr("home.hero_eyebrow")}
          </div>
          <h1
            className="fade-up mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl"
            style={{ animationDelay: "0.25s" }}
          >
            {t("hero_title", tr("home.hero_title_fallback"))}
          </h1>
          <p
            className="fade-up mt-4 max-w-xl font-display text-xl italic text-white/85 md:text-2xl"
            style={{ animationDelay: "0.4s" }}
          >
            {t("hero_subtitle", tr("home.hero_subtitle_fallback"))}
          </p>
          <div className="fade-up mt-9 flex flex-wrap gap-4" style={{ animationDelay: "0.55s" }}>
            <Link
              to="/obras"
              className="border border-[var(--c-primary)] bg-[var(--c-primary)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[var(--c-bg)]"
            >
              {tr("home.cta_works")}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/40 px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition hover:border-white hover:bg-white hover:text-[var(--c-ink)]"
            >
              {tr("home.cta_visit")}
            </a>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <div className="h-10 w-px bg-white/40" />
        </div>
      </section>

      {/* MANIFESTO */}
      {visible("section.manifesto") && (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="eyebrow text-[var(--c-primary)]">{tr("home.manifesto_eyebrow")}</div>
        <div className="mx-auto mt-5 h-px w-16 bg-[var(--c-primary)]/40" />
        <Paras
          text={t("hero_text")}
          className="mt-8 font-display text-xl leading-relaxed text-[var(--c-ink)]/85 md:text-2xl"
        />
      </section>
      )}

      {/* TRÊS LINGUAGENS */}
      {visible("section.linguagens") && (
      <section className="border-y border-[var(--c-ink)]/10 bg-[var(--c-sand)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-primary)]">{tr("home.lang_eyebrow")}</div>
          <h2 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
            {tr("home.lang_title")}
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { img: "/images/real-revoada.jpg", key: "painting", altKey: "home.painting_alt" },
              { img: "/images/real-guardiao.jpg", key: "sculpture", altKey: "home.sculpture_alt" },
              { img: "/images/real-arlequins.jpg", key: "alterego", altKey: "home.alterego_alt" },
            ].map((b) => (
              <article key={b.key} className="group">
                <div className="overflow-hidden">
                  <img
                    src={b.img}
                    alt={tr(b.altKey)}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 h-px w-10 bg-[var(--c-primary)]" />
                <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-[var(--c-ink)]">
                  {t(`home_${b.key}_title`)}
                </h3>
                <Paras
                  text={t(`home_${b.key}_text`)}
                  className="mt-3 text-sm leading-relaxed text-[var(--c-ink)]/70"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* VÍDEO — o ateliê em movimento */}
      {visible("section.video") && (
      <section className="bg-[var(--c-dark)] py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="eyebrow text-[var(--c-accent)]">{tr("home.video_eyebrow")}</div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-[var(--c-bg)] md:text-4xl">
            {tr("home.video_title")}
          </h2>
          <div className="mt-10 overflow-hidden border border-white/10">
            <video
              src="/videos/atelier.mp4"
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>
          <p className="mt-4 text-sm italic text-white/50">
            {tr("home.video_caption")}
          </p>
        </div>
      </section>
      )}

      {/* O ATELIÊ COMO DESTINO */}
      {visible("section.destino") && (
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2">
        <div className="relative">
          <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--c-primary)]/30" />
          <img
            src="/images/placa-1.jpg"
            alt={tr("home.sign_alt")}
            className="relative w-full object-cover"
          />
        </div>
        <div>
          <div className="eyebrow text-[var(--c-primary)]">{tr("home.destino_eyebrow")}</div>
          <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
            {tr("home.destino_title")}
          </h2>
          <p className="mt-5 leading-relaxed text-[var(--c-ink)]/80">
            {tr("home.destino_text")}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block border border-[var(--c-ink)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] transition hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)]"
          >
            {tr("home.destino_cta")}
          </a>
        </div>
      </section>
      )}

      {/* O ATELIÊ EM IMAGENS */}
      {visible("section.imagens") && (
      <section className="border-t border-[var(--c-ink)]/10 bg-[var(--c-sand)] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-primary)]">{tr("home.imagens_eyebrow")}</div>
          <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
            {tr("home.imagens_title")}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { src: "/images/placa-2.jpg", altKey: "home.image0_alt" },
              { src: "/images/atelier-interior-real.jpg", altKey: "home.image1_alt" },
              { src: "/images/amb-1.jpg", altKey: "home.image2_alt" },
              { src: "/images/logo-cartao.jpg", altKey: "home.image3_alt" },
            ].map((f) => (
              <figure key={f.src} className="group">
                <div className="overflow-hidden">
                  <img
                    src={f.src}
                    alt={tr(f.altKey)}
                    className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{tr(f.altKey)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* GALERIA DE ARTE ECOLÓGICA AO AR LIVRE */}
      {visible("section.ceuaberto") && (
            <GaleriaCeuAberto />
      )}

      {/* MAPA — COMO CHEGAR */}
      {visible("section.mapa") && (
            <MapaSection />
      )}
    </Layout>
  );
}
