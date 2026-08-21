import type { Work } from "@db/schema";

const now = new Date(0);

export const defaultTexts: Record<string, string> = {
  hero_title: "ATELIER DANIEL DETOMI",
  hero_subtitle: "Arte e Natureza em Tiradentes - Minas Gerais",
  hero_text:
    "Um artista que nao se limita a uma tecnica, mas a um territorio criativo, onde pintura, escultura, instalacao ambiental e desenho grafico convivem como manifestacoes de uma mesma visao.\n\nAqui, a arte nao fica atras de vidro: ela cresce no jardim, emerge da encosta e caminha entre as arvores.",
  home_painting_title: "A Pintura - o mundo lirico e o mundo grafico",
  home_painting_text:
    "Paisagens densas, fauna e flora brasileiras em cores vibrantes convivem com o universo da ilusao de otica, pop art e circo.",
  home_sculpture_title: "A Escultura e o Recorte - o corpo na paisagem",
  home_sculpture_text:
    "Araras, veados, capivaras e grandes faces na encosta sao obras que existem em relacao direta com o lugar.",
  home_alterego_title: "O Indigena e o Palhaco - os alter-egos",
  home_alterego_text:
    "A cabeca indigena com cocar e os palhacos equilibristas revelam o artista como pensador visual.",
  artist_bio:
    "Daniel Detomi e mineiro, nascido em Sao Joao del-Rei. Desenvolveu seu trabalho criativo em Tiradentes - MG, junto a artistas que ajudaram a moldar a cena cultural da regiao.\n\nSuas obras valorizam o reuso de papel mache, metal e madeira de demolicao, unindo arte, cultura e consciencia ambiental.",
  artist_quote: "Do descarte nasce a obra. Da terra, a memoria. Do olhar, a forma.",
  expo_title: "Exposicoes",
  expo_recortes_title: "RECORTES DO CERRADO",
  expo_recortes_text:
    "A fauna do cerrado mineiro recortada em metal de reuso ocupa o espaco como quem retoma o proprio territorio.",
  expo_terra_title: "TERRA BRASILIS",
  expo_terra_text:
    "Papel mache, fauna brasileira e madeira de demolicao em uma mostra sobre cultura, inclusao e consciencia ambiental.",
  tiradentes_title: "Tiradentes - Minas Gerais",
  tiradentes_text:
    "Tiradentes e uma das cidades historicas mais bem preservadas do Brasil. Ruas de pedra, casario colonial, igrejas barrocas e a Serra de Sao Jose inspiram artistas ha geracoes.\n\nO Atelier Daniel Detomi - Arte e Natureza faz parte dessa historia: um lugar onde a arte cresce no jardim e recebe visitantes de portas abertas.",
  footer_tagline: "Arte e Natureza - Tiradentes, Minas Gerais",
  "cafe.hero.eyebrow": "Espaço de Café",
  "cafe.hero.title": "Um encontro entre arte, conversa e cotidiano",
  "cafe.hero.description":
    "Registros publicados pelo ateliê: pequenos encontros, imagens e histórias que aproximam a criação da vida diária.",
};

export const defaultSettings: Record<string, string> = {
  "contact.whatsapp": "5532984527407",
  "section.manifesto": "1",
  "section.linguagens": "1",
  "section.video": "1",
  "section.destino": "1",
  "section.imagens": "1",
  "section.ceuaberto": "1",
  "section.mapa": "1",
};

const defaultWorksBase: Omit<Work, "couponEnabled">[] = [
  { id: 1, slug: "camaleao", title: "Camaleao", category: "Pinturas", technique: "Pintura sobre tela", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-12.jpg", description: "Um camaleao gigante em cores do Brasil.", sortOrder: 1, createdAt: now, updatedAt: now },
  { id: 2, slug: "revoada", title: "Revoada", category: "Pinturas", technique: "Pintura sobre tela", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-14.jpg", description: "Aves brasileiras em uma composicao vibrante.", sortOrder: 2, createdAt: now, updatedAt: now },
  { id: 3, slug: "tiradentes-panel", title: "Tiradentes", category: "Pinturas", technique: "Pintura sobre madeira de demolicao", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-13.jpg", description: "A paisagem historica de Tiradentes em madeira reaproveitada.", sortOrder: 3, createdAt: now, updatedAt: now },
  { id: 4, slug: "noite-tropical", title: "Noite Tropical", category: "Pinturas", technique: "Pintura sobre tela", status: "available", year: "2026", price: "Sob consulta", image: "/images/pintura-tropical.jpg", description: "Cena tropical entre sonho e natureza.", sortOrder: 4, createdAt: now, updatedAt: now },
  { id: 5, slug: "cupido", title: "Cupido", category: "Pinturas", technique: "Pintura sobre tabuas de demolicao", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-11.jpg", description: "Figura romantica sobre madeira reaproveitada.", sortOrder: 5, createdAt: now, updatedAt: now },
  { id: 6, slug: "cocar", title: "Cocar", category: "Esculturas", technique: "Papel mache e plumaria pintada", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-1.jpg", description: "Cabeca em papel mache com cocar multicolorido.", sortOrder: 6, createdAt: now, updatedAt: now },
  { id: 7, slug: "guardiao", title: "Guardiao", category: "Esculturas", technique: "Papel mache, cocar de varetas pintadas", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-2.jpg", description: "Busto guardiao com pintura corporal geometrica.", sortOrder: 7, createdAt: now, updatedAt: now },
  { id: 8, slug: "araras", title: "Araras", category: "Esculturas", technique: "Escultura de parede pintada a mao", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-5.jpg", description: "Araras em relevo para parede.", sortOrder: 8, createdAt: now, updatedAt: now },
  { id: 9, slug: "ancionais", title: "Ancionais", category: "Galeria a Ceu Aberto", technique: "Papel mache em grande escala", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/work-3.jpg", description: "Rostos monumentais no jardim do atelie.", sortOrder: 9, createdAt: now, updatedAt: now },
  { id: 10, slug: "capivaras", title: "Capivaras", category: "Galeria a Ceu Aberto", technique: "Conjunto em metal recortado e pintado", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/work-8.jpg", description: "Conjunto de animais em metal para area externa.", sortOrder: 10, createdAt: now, updatedAt: now },
  { id: 11, slug: "veados", title: "Veados", category: "Galeria a Ceu Aberto", technique: "Metal de reuso, asas em chapa pintada", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/work-9.jpg", description: "Veados-campeiros em cena poetica de jardim.", sortOrder: 11, createdAt: now, updatedAt: now },
  { id: 12, slug: "dalmata", title: "Dalmata", category: "Circo & Forma", technique: "Pintura sobre fundo xadrez optico", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-15.jpg", description: "Um dalmata sobre padrao xadrez em ilusao de otica.", sortOrder: 12, createdAt: now, updatedAt: now },
  { id: 13, slug: "tenis-xadrez", title: "Tenis Xadrez", category: "Circo & Forma", technique: "Pintura, ilusao de otica", status: "available", year: "2026", price: "Sob consulta", image: "/images/circo-tenis.jpg", description: "Objeto cotidiano em composicao grafica.", sortOrder: 13, createdAt: now, updatedAt: now },
  { id: 14, slug: "arlequins", title: "Arlequins", category: "Circo & Forma", technique: "Pintura emoldurada, serie circo", status: "available", year: "2026", price: "Sob consulta", image: "/images/circo-harlequins.jpg", description: "Palhacos e arlequins equilibristas.", sortOrder: 14, createdAt: now, updatedAt: now },
  { id: 15, slug: "lobo-guara", title: "Lobo-Guara", category: "Recortes", technique: "Recorte em chapas de metal de reuso", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-6.jpg", description: "Lobo-guara em metal recortado e pintado.", sortOrder: 15, createdAt: now, updatedAt: now },
  { id: 16, slug: "onca", title: "Onca", category: "Recortes", technique: "Metal recortado e pintado", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-7.jpg", description: "Onca-pintada em metal com pintura manual.", sortOrder: 16, createdAt: now, updatedAt: now },
  { id: 17, slug: "seriemas", title: "Seriemas", category: "Recortes", technique: "Metal recortado, conjunto de aves", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/work-10.jpg", description: "Seriemas e filhotes em cena de jardim.", sortOrder: 17, createdAt: now, updatedAt: now },
  { id: 18, slug: "guardioes-da-encosta", title: "Guardioes da Encosta", category: "Arte Ambiental", technique: "Papel mache monumental in situ", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/ambiental-mascaras.jpg", description: "Rostos monumentais integrados a paisagem.", sortOrder: 18, createdAt: now, updatedAt: now },
  { id: 19, slug: "vigia", title: "Vigia", category: "Arte Ambiental", technique: "Papel mache e metal de reuso", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/work-4.jpg", description: "Mascara e seriema em dialogo com o jardim.", sortOrder: 19, createdAt: now, updatedAt: now },
];

export const defaultWorks: Work[] = defaultWorksBase.map((work) => ({
  ...work,
  couponEnabled: false,
}));
