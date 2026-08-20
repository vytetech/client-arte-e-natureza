import Layout from "@/components/Layout";
import MapaSection from "@/components/MapaSection";
import { useTexts } from "@/hooks/useTexts";
import { WHATSAPP_URL } from "@/config";

export default function Tiradentes() {
  const { t } = useTexts();

  return (
    <Layout>
      <section className="relative flex min-h-[62vh] items-end">
        <img
          src="/images/real-tiradentes-panel.jpg"
          alt="Tiradentes, Minas Gerais"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 text-white">
          <div className="eyebrow text-[var(--c-accent)]">A cidade</div>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">
            {t("tiradentes_title", "Tiradentes — Minas Gerais")}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2">
        <div>
          {t("tiradentes_text").split("\n\n").map((p, i) => (
            <p
              key={i}
              className={`mb-6 leading-relaxed text-[var(--c-ink)]/85 ${
                i === 0 ? "font-display text-xl md:text-2xl" : "text-[17px]"
              }`}
            >
              {p}
            </p>
          ))}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border border-[var(--c-ink)] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] transition hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)]"
          >
            Agendar visita ao ateliê
          </a>
        </div>
        <div className="space-y-10">
          <figure>
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--c-primary)]/25" />
              <img src="/images/placa-1.jpg" alt="Placa do ateliê na estrada" className="relative w-full object-cover" />
            </div>
            <figcaption className="mt-3 border-l-2 border-[var(--c-primary)] pl-4 text-sm italic text-[var(--c-ink)]/60">
              A placa na estrada indica o caminho — siga a seta vermelha.
            </figcaption>
          </figure>
          <figure>
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--c-primary)]/25" />
              <img src="/images/real-ancionais.jpg" alt="Esculturas no jardim do ateliê" className="relative w-full object-cover" />
            </div>
            <figcaption className="mt-3 border-l-2 border-[var(--c-primary)] pl-4 text-sm italic text-[var(--c-ink)]/60">
              Os Ancionais: rostos monumentais no jardim do ateliê, com a mata ao fundo.
            </figcaption>
          </figure>
        </div>
      </section>

      <MapaSection />
    </Layout>
  );
}
