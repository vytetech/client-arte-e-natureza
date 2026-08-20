import { Link, useParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { WHATSAPP_URL } from "@/config";

export default function ObraDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: work, isLoading } = trpc.content.workBySlug.useQuery(slug ?? "", {
    enabled: !!slug,
  });

  const waLink = work
    ? `${WHATSAPP_URL}?text=${encodeURIComponent(`Olá! Tenho interesse na obra "${work.title}" (${work.category}).`)}`
    : WHATSAPP_URL;

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Link to="/galeria" className="eyebrow text-[var(--c-primary)] hover:underline">
          ← Voltar à Galeria
        </Link>

        {isLoading && <p className="mt-14 text-[var(--c-ink)]/60">Carregando…</p>}

        {!isLoading && !work && (
          <div className="mt-14">
            <h1 className="font-display text-3xl font-semibold">Obra não encontrada</h1>
            <Link to="/galeria" className="mt-3 inline-block text-[var(--c-primary)] hover:underline">
              Voltar à galeria
            </Link>
          </div>
        )}

        {work && (
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--c-primary)]/25" />
              <img src={work.image} alt={work.title} className="relative w-full object-cover" />
            </div>
            <div>
              <span className="eyebrow text-[var(--c-primary)]">{work.category}</span>
              <h1 className="mt-3 font-display text-5xl font-semibold">{work.title}</h1>
              <dl className="mt-6 space-y-2 border-t border-[var(--c-ink)]/10 pt-5 text-sm text-[var(--c-ink)]/70">
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">Artista</dt><dd>Daniel Detomi</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">Técnica</dt><dd>{work.technique}</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">Ano</dt><dd>{work.year}</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">Situação</dt><dd>{work.status}</dd></div>
              </dl>
              <div className="mt-7 border-l-2 border-[var(--c-primary)] pl-5">
                <div className="eyebrow text-[var(--c-ink)]/50" style={{ fontSize: "0.55rem" }}>Preço</div>
                <div className="mt-1 font-display text-3xl font-semibold text-[var(--c-primary)]">{work.price}</div>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block border border-[#25D366] bg-[#25D366] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[#1a7a3c]"
              >
                Consultar pelo WhatsApp
              </a>
              <div className="mt-10 border-t border-[var(--c-ink)]/10 pt-8">
                {(work.description ?? "").split("\n\n").map((p, i) => (
                  <p
                    key={i}
                    className={`mb-5 leading-relaxed text-[var(--c-ink)]/85 ${
                      i === 0 ? "font-display text-xl italic" : "text-[15px]"
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
