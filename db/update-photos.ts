import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { works } from "./schema";

const updates: Record<string, string> = {
  camaleao: "/images/real-camaleao.jpg",
  revoada: "/images/real-revoada.jpg",
  "tiradentes-panel": "/images/real-tiradentes-panel.jpg",
  "noite-tropical": "/images/real-noite.jpg",
  cupido: "/images/real-cupido.jpg",
  guardiao: "/images/real-guardiao.jpg",
  araras: "/images/real-araras.jpg",
  ancionais: "/images/real-ancionais.jpg",
  capivaras: "/images/real-guardioes.jpg",
  veados: "/images/real-vigia.jpg",
  dalmata: "/images/real-dalmata.jpg",
  "tenis-xadrez": "/images/real-tenis.jpg",
  arlequins: "/images/real-arlequins.jpg",
  "lobo-guara": "/images/real-lobo.jpg",
  onca: "/images/real-onca.jpg",
  seriemas: "/images/real-seriemas.jpg",
  "guardioes-da-encosta": "/images/ceu-1.jpg",
  vigia: "/images/ceu-2.jpg",
};

const newWorks = [
  {
    slug: "tucano",
    title: "Tucano",
    category: "Recortes",
    technique: "Recorte em chapa, pintura à mão",
    status: "DISPONÍVEL",
    year: "2026",
    price: "Sob consulta",
    image: "/images/real-tucano.jpg",
    sortOrder: 20,
    description:
      "Um tucano-toco em tamanho monumental ocupa a parede: bico alaranjado pintado em degradê, olho azul-elétrico e plumagem negra recortada em chapa.\n\nNo bico, uma surpresa: a sequência da evolução humana gravada em silhueta — o passado caminhando sobre o símbolo da fauna brasileira.\n\nPeça de parede de grande impacto, feita para áreas internas ou varandas protegidas. O ateliê produz outras espécies sob encomenda.",
  },
  {
    slug: "dalmata-xadrez",
    title: "Dálmata no Xadrez",
    category: "Circo & Forma",
    technique: "Painel pintado, xadrez óptico",
    status: "DISPONÍVEL",
    year: "2026",
    price: "Sob consulta",
    image: "/images/real-dalmata-xadrez.jpg",
    sortOrder: 21,
    description:
      "O dálmata em corpo inteiro sobre o xadrez que ondula — a versão em painel da série de ilusão de ótica do ateliê.\n\nCada mancha é pintada individualmente e o fundo xadrez é calculado para entortar atrás do cachorro, criando a sensação de parede viva.\n\nRetratos de pets sob encomenda com a mesma técnica: o ateliê trabalha a partir de fotos do animal.",
  },
];

async function run() {
  const db = getDb();
  for (const [slug, image] of Object.entries(updates)) {
    await db.update(works).set({ image }).where(eq(works.slug, slug));
  }
  console.log("Updated", Object.keys(updates).length, "work images.");
  for (const w of newWorks) {
    await db
      .insert(works)
      .values(w)
      .onConflictDoUpdate({
        target: works.slug,
        set: { image: w.image },
      });
  }
  console.log("Inserted new works:", newWorks.map((w) => w.slug).join(", "));
  process.exit(0);
}

run();
