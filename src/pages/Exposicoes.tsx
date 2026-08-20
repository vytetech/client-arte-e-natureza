import Layout from "@/components/Layout";
import { useTexts } from "@/hooks/useTexts";
import { WHATSAPP_URL } from "@/config";

export default function Exposicoes() {
  const { t } = useTexts();

  return (
    <Layout>
      <section className="bg-[var(--c-dark)] py-20 text-[var(--c-bg)]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-accent)]">Mostras</div>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">
            {t("expo_title", "Exposições")}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        {/* Banner: Recortes do Cerrado */}
        <div className="grid items-stretch gap-0 overflow-hidden bg-white shadow-[0_10px_40px_rgba(26,23,18,0.08)] md:grid-cols-2">
          <img
            src="/images/expo-recortes-real.jpg"
            alt="Banner da exposição Recortes do Cerrado"
            className="h-full max-h-[560px] w-full object-cover"
          />
          <div className="flex flex-col justify-center p-10">
            <span className="eyebrow w-fit bg-[var(--c-primary)] px-4 py-1.5 text-[var(--c-bg)]" style={{ fontSize: "0.55rem" }}>
              Exposição
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
              Exposição
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold">{t("expo_terra_title")}</h2>
            <div className="mt-4 h-px w-12 bg-[var(--c-ink)]/30" />
            {t("expo_terra_text").split("\n\n").map((p, i) => (
              <p key={i} className="mt-5 leading-relaxed text-[var(--c-ink)]/80">{p}</p>
            ))}
          </div>
          <img
            src="/images/expo-terra-real.jpg"
            alt="Cartaz da exposição Terra Brasilis"
            className="order-1 h-full max-h-[560px] w-full object-cover md:order-2"
          />
        </div>

        {/* Registros das mostras */}
        <div className="mt-16">
          <div className="eyebrow text-[var(--c-primary)]">Registros</div>
          <h2 className="mt-3 font-display text-3xl font-semibold">As mostras, em cena</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { src: "/images/expo-terra-2.jpg", alt: "Painel da exposição Terra Brasilis montado na parede" },
              { src: "/images/artist-real-2.jpg", alt: "O artista na abertura, junto ao painel biográfico" },
              { src: "/images/amb-1.jpg", alt: "Série circo exposta na sala do ateliê" },
            ].map((f) => (
              <figure key={f.src} className="group">
                <div className="overflow-hidden">
                  <img
                    src={f.src}
                    alt={f.alt}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{f.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-16 border border-[var(--c-ink)]/15 px-8 py-12 text-center">
          <h3 className="font-display text-2xl font-semibold">
            Quer receber as novidades das próximas exposições?
          </h3>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block border border-[var(--c-ink)] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] transition hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)]"
          >
            Falar com o ateliê
          </a>
        </div>
      </section>
    </Layout>
  );
}
