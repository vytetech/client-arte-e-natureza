import { Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";

const CATEGORIES = [
  { name: "Pinturas", image: "/images/pintura-tropical.jpg", desc: "O Brasil imaginário: fauna, flora e paisagens em cores vibrantes — e o universo gráfico da ilusão de ótica." },
  { name: "Esculturas", image: "/images/work-1.jpg", desc: "Papel machê moldado à mão: cabeças com cocares em homenagem aos povos originários." },
  { name: "Galeria a Céu Aberto", image: "/images/real-ancionais.jpg", desc: "O jardim do ateliê como museu: animais do cerrado em tamanho real entre as plantas." },
  { name: "Circo & Forma", image: "/images/circo-tenis.jpg", desc: "Xadrez que ondula, arlequins equilibristas: a percepção visual como tema." },
  { name: "Recortes", image: "/images/work-7.jpg", desc: "A fauna brasileira recortada em chapas de metal de reúso e pintada à mão." },
  { name: "Arte Ambiental", image: "/images/ambiental-mascaras.jpg", desc: "Obras que só existem em relação ao lugar: rostos monumentais na encosta, a paisagem como moldura." },
];

export default function Obras() {
  const { data: works } = trpc.content.works.useQuery();

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="eyebrow text-[var(--c-primary)]">Acervo</div>
        <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Obras</h1>
        <p className="mt-5 max-w-2xl font-display text-xl italic leading-relaxed text-[var(--c-ink)]/70">
          Seis linguagens que convivem no mesmo território criativo. Escolha uma categoria —
          ou caminhe por todas, como quem caminha pelo jardim.
        </p>

        <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const count = works?.filter((w) => w.category === c.name).length ?? 0;
            return (
              <Link key={c.name} to={`/galeria?cat=${encodeURIComponent(c.name)}`} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-0 top-5 bg-[var(--c-dark)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--c-bg)]">
                    {String(i + 1).padStart(2, "0")} — {count} {count === 1 ? "obra" : "obras"}
                  </span>
                </div>
                <div className="mt-5 h-px w-10 bg-[var(--c-primary)] transition-all duration-500 group-hover:w-20" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-[var(--c-ink)] transition group-hover:text-[var(--c-primary)]">
                  {c.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--c-ink)]/65">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
