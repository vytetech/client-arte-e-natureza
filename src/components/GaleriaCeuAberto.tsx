import { Link } from "react-router";
import { WHATSAPP_URL } from "@/config";

const FOTOS = [
  {
    src: "/images/real-ancionais.jpg",
    titulo: "Os Originários",
    desc: "Cinco rostos monumentais em homenagem aos povos originários, em papel machê na borda do barranco, com a mata atlântica ao fundo — cada expressão entre o riso e a meditação.",
  },
  {
    src: "/images/ceu-1.jpg",
    titulo: "Guardiões da Mata",
    desc: "Máscaras de grafismos emergem da encosta entre samambaias, vigiadas por uma onça recortada no alto.",
  },
  {
    src: "/images/ceu-2.jpg",
    titulo: "O Vigia e a Seriema",
    desc: "A máscara vigia, a ave patrulha — povos originários e fauna do cerrado no mesmo quadro vivo.",
  },
  {
    src: "/images/real-guardioes.jpg",
    titulo: "Capivaras e Veados",
    desc: "Um bando inteiro de capivaras e veados em metal recortado pastando no gramado do jardim.",
  },
  {
    src: "/images/real-vigia.jpg",
    titulo: "Veados com Asas",
    desc: "Três veados-campeiros atravessam as bromélias sob um par de asas brancas abertas.",
  },
  {
    src: "/images/real-seriemas.jpg",
    titulo: "Seriemas e Saracuras",
    desc: "Seriemas de asas entreabertas e saracuras escuras bicando o capim entre flores amarelas.",
  },
];

export default function GaleriaCeuAberto() {
  return (
    <section className="bg-[var(--c-dark)] py-24 text-[var(--c-bg)]">
      <div className="mx-auto max-w-6xl px-5">
        <div className="eyebrow text-[var(--c-accent)]">O jardim é o museu</div>
        <h2 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
          Galeria de arte ecológica ao ar livre
        </h2>
        <p className="mt-6 max-w-2xl font-display text-lg italic leading-relaxed text-white/65">
          No jardim do ateliê, a arte não fica atrás de vidro: ela cresce na grama, emerge da
          encosta e caminha entre as árvores. Rostos monumentais, onças, veados, capivaras e
          seriemas — obras que o tempo, a chuva e o musgo continuam pintando.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FOTOS.map((f) => (
            <figure key={f.src} className="group">
              <div className="overflow-hidden border border-white/10">
                <img
                  src={f.src}
                  alt={f.titulo}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="mt-4">
                <div className="flex items-baseline gap-3">
                  <span className="h-px w-8 shrink-0 bg-[var(--c-accent)]" />
                  <h3 className="font-display text-xl font-semibold">{f.titulo}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-10">
          <p className="max-w-md text-sm leading-relaxed text-white/55">
            A galeria a céu aberto só pode ser visitada pessoalmente, no ateliê em Tiradentes —
            mediante agendamento.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/galeria?cat=Galeria%20a%20C%C3%A9u%20Aberto"
              className="border border-[var(--c-accent)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--c-accent)] transition hover:bg-[var(--c-accent)] hover:text-[var(--c-dark)]"
            >
              Ver as obras do jardim
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#25D366] bg-[#25D366] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-transparent hover:text-[#4ee38a]"
            >
              Agendar visita
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
