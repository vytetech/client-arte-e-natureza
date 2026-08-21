export interface SiteConfig {
  language: string
  title: string
  description: string
  brandName: string
}

export interface HeroConfig {
  titleText: string
  subtitleLines: string[]
  ctaLabel: string
  roomLabel: string
  /** Path from public/, e.g. "/images/hero.jpg". Empty → black background. */
  fluidImagePath: string
}

export interface WorkItem {
  id: string
  title: string
  type: string
  status: string
  metrics: string
  /** Path from public/, e.g. "/images/work-1.jpg". */
  image: string
  artist: string
  location: string
  medium: string
  article: string
}

export interface GalleryConfig {
  eyebrowLabel: string
  titleLines: string[]
  stats: { label: string; value: string }[]
  sideLabel: string
  works: WorkItem[]
}

export interface InstantConfig {
  textLines: [string, string, string] | string[]
  videoPath: string
  roomLabel: string
}

export interface NavLink {
  label: string
  href?: string
}

export interface FooterConfig {
  brandText: string
  taglineLines: string[]
  navigationHeading: string
  navigationLinks: NavLink[]
  contactHeading: string
  contactLinks: NavLink[]
  copyright: string
  creditText: string
}

export interface WorkDetailConfig {
  backLabel: string
  artistLabel: string
  locationLabel: string
  mediumLabel: string
  backToGalleryLabel: string
  metaRoomSuffix: string
  footerNote: string
  notFoundTitle: string
  notFoundLink: string
}

export const WHATSAPP_URL = "https://wa.me/5532984527407"
export const INSTAGRAM_URL =
  "https://www.instagram.com/danieldetomiartenatureza"

export const siteConfig: SiteConfig = {
  language: "pt-BR",
  title: "Atelier Daniel Detomi — Arte e Natureza",
  description:
    "Atelier Daniel Detomi em Tiradentes — MG: esculturas em papel machê, fauna brasileira em metal de reúso e pinturas em madeira de demolição. Arte, cultura e consciência ambiental.",
  brandName: "Atelier Daniel Detomi",
}

export const heroConfig: HeroConfig = {
  titleText: "DANIEL DETOMI",
  subtitleLines: [
    "Atelier Daniel Detomi — Arte e Natureza, em Tiradentes MG.",
    "Esculturas e pinturas nascem do reúso: papel machê, metal",
    "e madeira de demolição viram povos originários, fauna e",
    "paisagens do Brasil. Visite o ateliê ou chame no WhatsApp.",
  ],
  ctaLabel: "Conhecer as Obras",
  roomLabel: "Sala 01 // Atelier & Jardim",
  fluidImagePath: "/images/hero-source.jpg",
}

export const galleryConfig: GalleryConfig = {
  eyebrowLabel: "SALA 02 // GALERIA",
  titleLines: ["Obras", "do", "Ateliê"],
  stats: [
    { label: "Obras", value: "16" },
    { label: "Técnicas", value: "03" },
    { label: "Trajetória", value: "Desde 1990" },
    { label: "Matéria-prima", value: "100% reúso" },
    { label: "Cidade", value: "Tiradentes MG" },
  ],
  sideLabel: "ATELIÊ::SALA_02",
  works: [
    {
      id: "DD-001",
      title: "COCAR",
      type: "papel-machê",
      status: "available",
      metrics: "2026",
      image: "/images/work-1.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Papel machê e plumária pintada à mão",
      article:
        "Cabeça em papel machê com cocar multicolorido — a peça que abre o ateliê e dá rosto à homenagem de Daniel Detomi aos povos originários do Brasil. Na imagem, o rosto surge em terracota profundo, atravessado por grafismos negros e faixas vermelhas; acima, o cocar explode em centenas de varetas pintadas fio a fio em amarelo, vermelho, azul e preto.\n\nA construção é totalmente manual: camadas de papel reaproveitado são empastadas, moldadas e lixadas até ganharem a anatomia do rosto. Depois vem a pintura — cada grafismo é traçado à mão, sem molde, o que torna impossível repetir a peça.\n\nO cocar não é ornamento: é símbolo de honra e liderança nas culturas indígenas. Ao colocá-lo no centro da obra, o artista declara onde está o seu respeito — e convida o visitante a olhar para o Brasil pelos olhos de quem estava aqui primeiro.\n\nComo peça de coleção, é das mais fortes do ateliê: presença escultural que transforma uma sala inteira. Quem passa, para. Quem para, escuta o que ela tem a dizer sobre a terra que pisamos.",
    },
    {
      id: "DD-002",
      title: "GUARDIÃO",
      type: "papel-machê",
      status: "available",
      metrics: "2026",
      image: "/images/work-2.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Papel machê, cocar de varetas pintadas",
      article:
        "Busto em papel machê sobre base listrada, com pintura corporal geométrica e cocar de varetas pintadas uma a uma. Na fotografia, o rosto olha de perfil: máscara negra sobre os olhos, faixas vermelhas nas bochechas, linhas escuras descendo pelo pescoço — e o cocar irradiando em todas as direções como um sol.\n\nAs varetas do cocar são recortadas, enroladas e pintadas individualmente em faixas de amarelo, preto e vermelho, depois encaixadas na estrutura — um trabalho de dias para uma única peça. A base em listras horizontais sustenta o conjunto como um pedestal de museu.\n\nA pintura facial segue a tradição dos grafismos indígenas brasileiros: cada linha tem função, nada é decoração vazia. O olhar lateral dá à peça uma sensação de vigia — um guardião que acompanha o ambiente.\n\nÉ obra para quem procura um ponto focal absoluto: em um hall, sobre um aparador ou em uma estante baixa, o Guardião impõe silêncio e respeito ao redor.",
    },
    {
      id: "DD-003",
      title: "ANCIONAIS",
      type: "papel-machê",
      status: "unavailable",
      metrics: "2026",
      image: "/images/work-3.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Papel machê em grande escala, uso externo",
      article:
        "No jardim do ateliê, cinco rostos monumentais em papel machê repousam lado a lado na borda de um barranco verde, com a mata atlântica fechando o fundo. Na imagem, as cabeças gigantes — cada uma com expressão própria, entre o riso e a meditação — dividem a cena com recortes de animais do cerrado e um veado que atravessa o gramado.\n\nSão obras de grande escala feitas para o tempo: o papel machê recebe tratamento para uso externo, e chuva, sol e musgo vão acrescentando camadas novas à pele de cada rosto. O envelhecimento não estraga a obra — ele a continua.\n\nA instalação resume a filosofia do ateliê: a arte não fica atrás de vidro, ela vive no chão, na grama, entre as árvores. Os rostos são os antigos da terra, olhando quem chega.\n\nPara hotéis, pousadas, restaurantes e jardins amplos, conjuntos como este transformam a área externa em atração permanente — o tipo de lugar que o visitante fotografa e conta para os outros.",
    },
    {
      id: "DD-004",
      title: "VIGIA",
      type: "papel-machê",
      status: "unavailable",
      metrics: "2026",
      image: "/images/work-4.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Papel machê e metal de reúso",
      article:
        "Entre agaves azul-esverdeadas, uma máscara de grafismos negros sobre fundo terracota observa o jardim, enquanto uma seriema em metal recortado — pintada em tons de palha — caminha diante dela. A fotografia captura exatamente o encontro que define o trabalho de Detomi: os povos originários e a fauna do cerrado no mesmo quadro.\n\nA máscara é papel machê em escala generosa, com faixas horizontais negras que atravessam testa, olhos e boca — pintura corporal que fala de identidade e território. A seriema é chapa de metal desenhada, cortada e pintada à mão, com as longas pernas vermelhas e o topete eriçado da ave real.\n\nColocadas juntas unavailable, as duas obras criam uma narrativa silenciosa: a máscara vigia, a ave patrulha. Nenhuma peça é igual à outra — o gesto do artista está em cada traço.\n\nDuplas e conjuntos assim são ideais para cantos de jardim, espelhos d'água e entradas de propriedades: arte que conversa com a paisagem em vez de competir com ela.",
    },
    {
      id: "DD-005",
      title: "ARARAS",
      type: "escultura-parede",
      status: "available",
      metrics: "2026",
      image: "/images/work-5.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Escultura de parede pintada à mão",
      article:
        "Três araras em escultura de parede sobre fundo branco: duas araras-azuis de um azul profundo com máscara amarela, e uma arara-vermelha que derrama do vermelho ao amarelo e ao azul ao longo das asas. A fotografia mostra a peça como ela chega ao cliente — limpa, nítida, pronta para pendurar.\n\nCada arara é construída em camadas: corpo, asas e longa cauda são peças separadas, sobrepostas para criar relevo real. As penas são incisas e pintadas individualmente, o que dá à plumagem uma textura que muda com a luz do ambiente ao longo do dia.\n\nA arara é o símbolo máximo da fauna brasileira — e também um alerta: espécies como a arara-azul quase desapareceram pela destruição do habitat. Pendurar estas aves na parede é decorar com significado.\n\nComo conjunto ou em peças individuais, funcionam em salas, varandas, corredores e fachadas comerciais. É o tipo de obra que ninguém passa sem comentar — Brasil em estado puro, em voo permanente.",
    },
    {
      id: "DD-006",
      title: "LOBO-GUARÁ",
      type: "metal-reúso",
      status: "available",
      metrics: "2026",
      image: "/images/work-6.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Recorte em chapas de metal de reúso",
      article:
        "O lobo-guará atravessa o jardim em passo largo, flagrado na fotografia entre agaves e pedras: pelagem vermelho-alaranjada pintada fio a fio, gola e orelhas claras, e as longas pernas negras que parecem meias — inconfundível para quem conhece o cerrado.\n\nA peça é recortada em chapa de metal de reúso: primeiro o desenho em escala real, depois o corte, a dobra sutil que dá volume ao corpo e, por fim, a pintura — camadas de pelo aplicadas com pincel fino, seguindo a direção real da pelagem do animal.\n\nO lobo-guará é o maior canídeo da América do Sul e um dos símbolos mais ameaçados do cerrado mineiro. Na obra, ele não está parado: está no meio do passo, a caminho de algum lugar — como o próprio cerrado, que precisa continuar existindo.\n\nInstalado entre plantas, o efeito é de encontro real: o visitante dobra a esquina e dá de cara com o lobo. Uma obra que une emoção, decoração autoral e defesa ambiental na mesma chapa.",
    },
    {
      id: "DD-007",
      title: "ONÇA",
      type: "metal-reúso",
      status: "available",
      metrics: "2026",
      image: "/images/work-7.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Metal recortado e pintado",
      article:
        "A onça-pintada avança em direção à câmera, corpo baixo e mandíbula aberta, sobre um fundo de pedras e terra vermelha. Na fotografia, cada roseta da pelagem aparece desenhada: dezenas de pintas irregulares, nenhuma igual à outra — exatamente como na onça de verdade.\n\nA silhueta é recortada em metal e pintada à mão em camadas: primeiro o dourado-ocre do fundo, depois as rosetas uma a uma, por último os detalhes do focinho, dos olhos esverdeados e das garras. É o trabalho mais minucioso do repertório do ateliê.\n\nA onça é o topo da cadeia alimentar das matas brasileiras: onde ela está, o ecossistema inteiro está de pé. A obra carrega esse recado sem precisar de legenda — a postura do animal diz tudo.\n\nPara jardins de pedra, muros, entradas de trilhas e espaços que pedem força, a Onça é a peça definitiva. Imponente sem ser agressiva: majestade em estado puro.",
    },
    {
      id: "DD-008",
      title: "CAPIVARAS",
      type: "metal-reúso",
      status: "unavailable",
      metrics: "2026",
      image: "/images/work-8.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Conjunto em metal recortado e pintado",
      article:
        "Um pedaço do cerrado montado unavailable: capivaras de todos os tamanhos pastam sobre as pedras, um veado amamenta o filhote malhado e, pendurado na coluna da varanda, um macaco amarelo balança pelo braço. A fotografia mostra como os conjuntos do ateliê funcionam — uma cena completa, não peças soltas.\n\nCada animal é recortado em metal de reúso e pintado à mão em tons de palha e ferrugem que se misturam ao verde do gramado. Os tamanhos variam de propósito: a composição imita um bando real, com adultos e filhotes.\n\nA graça do conjunto está na liberdade: as peças podem ser rearrumadas, espalhadas ou agrupadas conforme o espaço e a estação do ano. O jardim vira um palco que muda quando o dono quiser.\n\nConjuntos assim são feitos sob medida — o cliente escolhe as espécies, as quantidades e os tamanhos. Ideal para pousadas, restaurantes com área externa e jardins de família: natureza que não precisa de água nem ração, só de admiração.",
    },
    {
      id: "DD-009",
      title: "VEADOS",
      type: "metal-reúso",
      status: "unavailable",
      metrics: "2026",
      image: "/images/work-9.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Metal de reúso, asas em chapa pintada",
      article:
        "Três veados-campeiros atravessam o jardim entre bromélias vermelhas e flores roxas — um deles galhado, um filhote malhado junto ao chão — e, acima de tudo, um par de asas brancas abertas paira sobre a cena. A fotografia captura o lado mais poético do ateliê: a fauna real encontrando o imaginário.\n\nOs veados são recortados em metal e pintados em tons de canela e palha, com os pelos da barriga e do pescoço marcados a pincel. As asas, em chapa branca, têm cada pena recortada e sobreposta — leveza construída em material pesado.\n\nA cena mistura documento e sonho: os veados são os que habitam o cerrado de verdade, ao redor de Tiradentes; as asas são o desejo de proteção sobre eles. Arte que conta história sem usar palavras.\n\nÉ composição de forte apelo emocional — das mais fotografadas pelos visitantes. Sob encomenda, a cena pode ganhar novas figuras: mais veados, outras aves, novos voos.",
    },
    {
      id: "DD-010",
      title: "SERIEMAS",
      type: "metal-reúso",
      status: "unavailable",
      metrics: "2026",
      image: "/images/work-10.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Metal recortado e pintado, conjunto de aves",
      article:
        "Seriemas e seus filhotes ocupam o gramado: as aves adultas de asas entreabertas em tons de ferrugem, e ao redor delas um bando de filhotes escuros bicando o capim entre flores amarelas. A fotografia mostra o conjunto como ele é — uma cena de vida, não uma fileira de objetos.\n\nAs seriemas são recortadas em metal de reúso com as penas das asas e da cauda desenhadas em relevo, e pintadas na paleta exata da ave: castanho, palha e pernas vermelhas. Os filhotes, menores e escuros, dão a medida da cena.\n\nA seriema é a ave-símbolo do cerrado mineiro — seu canto atravessa os campos de Tiradentes ao amanhecer. Tê-la unavailable, em metal, é fixar para sempre o som e a paisagem da região.\n\nPerfeito para gramados, jardins de pousadas e praças: as peças resistem ao tempo e criam movimento — cada visitante jura que as aves mudaram de lugar desde a última visita.",
    },
    {
      id: "DD-011",
      title: "CUPIDO",
      type: "madeira-demolição",
      status: "available",
      metrics: "2026",
      image: "/images/work-11.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Pintura sobre tábuas de demolição",
      article:
        "Um cupido de asas azuladas se contorce sobre as nuvens, arco esticado e aljava cheia de flechas — pintado sobre tábuas verticais de demolição cujas juntas e ranhuras atravessam o corpo do personagem. A fotografia mostra o efeito: a pintura parece um afresco descoberto sob a parede de uma casa antiga.\n\nA madeira de demolição chega ao ateliê com décadas de história — tinta descascada, marcas de pregos, veios abertos pelo tempo. Detomi não esconde nada disso: compõe a cena sobre as marcas, e cada falha da tábua vira sombra, nuvem ou contorno.\n\nO resultado é um romantismo raro: a técnica clássica da figura humana encontrando o material mais humilde. É o encontro entre a tradição barroca de Minas e a consciência do reúso.\n\nObra para quem busca delicadeza com profundidade — perfeita para quartos, corredores e espaços de estar que pedem uma peça de conversa. Nenhuma tábua se repete; cada Cupido é único.",
    },
    {
      id: "DD-012",
      title: "CAMALEÃO",
      type: "pintura",
      status: "available",
      metrics: "2026",
      image: "/images/work-12.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Pintura, cores da bandeira do Brasil",
      article:
        "Um camaleão gigante enrola o rabo em espiral sobre o galho, o corpo vestido com a bandeira do Brasil: cabeça verde, tronco amarelo, e o azul estrelado correndo pelas costas e pela cauda. Atrás dele, a bandeira ondula pintada. A fotografia mostra a assinatura do artista no canto — obra autoral, das mais reconhecíveis do ateliê.\n\nA pintura trabalha escalas de cor impressionantes: as escamas do animal são pintadas uma a uma, com luz e sombra em cada ponta, criando um volume que parece saltar do plano.\n\nO humor da peça é sério no fundo: como o camaleão, o Brasil muda de cor conforme o ambiente — mas a essência continua ali, segurando firme o galho. É identidade nacional pintada com sorriso.\n\nObra vibrante para salas, escritórios e espaços comerciais — das mais pedidas por quem visita o ateliê e quer levar o Brasil inteiro numa parede só.",
    },
    {
      id: "DD-013",
      title: "TIRADENTES",
      type: "madeira-demolição",
      status: "available",
      metrics: "2026",
      image: "/images/work-13.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Pintura sobre painel de madeira reaproveitada",
      article:
        "A paisagem de Tiradentes pintada sobre painel de madeira reaproveitada: torres de igreja colonial à direita, casario de telhados vermelhos descendo o vale, serras verdes fechando o horizonte — e tucanos e ipês em primeiro plano, enquadrando a cena como uma janela para a cidade.\n\nFoi em Tiradentes, no início dos anos 90, que Daniel Detomi começou sua trajetória ao lado de artistas como Fernando Pita e Toti, da Oficina de Agosto — um movimento que transformou a cidade, Bichinho e adjacências em pólo de arte. Este painel é memória afetiva e documento ao mesmo tempo.\n\nA madeira reaproveitada dá à pintura uma profundidade que tela nenhuma tem: os veios atravessam as montanhas, as juntas das tábuas marcam os planos da paisagem, e a tinta se acomoda nas irregularidades como a luz da tarde mineira.\n\nObra para quem ama Minas Gerais — ou para quem quer levar um pedaço dela para casa. Das peças mais procuradas por visitantes da cidade histórica.",
    },
    {
      id: "DD-014",
      title: "REVOADA",
      type: "pintura",
      status: "available",
      metrics: "2026",
      image: "/images/work-14.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Pintura sobre tela",
      article:
        "Uma revoada de pássaros sobre o amarelo do ipê florido: papagaios verdes, araras-azuis, periquitos e tucanos dividem os galhos numa composição que não para de se mover diante dos olhos. A fotografia mostra a densidade da tela — são dezenas de aves, cada uma com pose e olhar próprios.\n\nO fundo é um degradê de verdes e azuis que sugere a mata ao longe; na frente, a explosão dourada das flores do ipê organiza o caos. Sobre essa estrutura, cada ave foi pintada com paciência de artesão: pena por pena, bico por bico.\n\nA tela é uma celebração da mata brasileira em festa — o ipê floresce por poucos dias no ano, e a pintura fixa para sempre esse instante em que a floresta inteira parece acesa.\n\nUm painel que enche qualquer parede de vida — e de canto de pássaro imaginado. Ideal para salas amplas, recepções e qualquer espaço que precise acordar.",
    },
    {
      id: "DD-015",
      title: "DÁLMATA",
      type: "pintura",
      status: "available",
      metrics: "2026",
      image: "/images/work-15.jpg",
      artist: "Daniel Detomi",
      location: "Tiradentes — MG",
      medium: "Pintura sobre fundo xadrez óptico",
      article:
        "Um dálmata em pose alerta, língua de fora, sobre um fundo xadrez preto e branco que ondula e engana os olhos — o padrão geométrico entorta atrás do cachorro como se a parede respirasse. A fotografia mostra o jogo óptico em pleno efeito: figura e fundo disputando a atenção.\n\nO fundo xadrez é pintado com precisão matemática e depois distorcido de propósito — as linhas curvas criam a ilusão de movimento numa superfície parada. Sobre ele, o dálmata é pintado em branco absoluto com manchas irregulares, como na raça de verdade.\n\nA série do fundo xadrez virou marca do artista: rigor geométrico quebrado pela vida — a língua rosada e o olhar vivo do cachorro desarmam qualquer geometria.\n\nO ateliê aceita retratos de pets sob encomenda: o companheiro da família imortalizado com a mesma técnica. Uma obra que diverte, impressiona e emociona — difícil pedir mais de uma parede.",
    },
    {
      id: "DD-016",
      title: "O_ARTISTA",
      type: "sobre-o-artista",
      status: "unavailable",
      metrics: "1990–",
      image: "/images/work-16.jpg",
      artist: "Daniel Detomi",
      location: "São João del-Rei — MG",
      medium: "Papel machê, metal de reúso, madeira de demolição",
      article:
        "Na fotografia, Daniel Detomi posa ao lado de uma de suas criações: o dálmata sobre o fundo xadrez, dentro do ateliê em Tiradentes. Camiseta vinho, sorriso contido — o retrato de um artista que vive cercado pelas próprias criaturas.\n\nMineiro de São João del-Rei, Detomi desenvolveu seu trabalho criativo no início dos anos 90, na cidade histórica de Tiradentes. Conviveu com renomados artistas, como Fernando Pita e Toti (Oficina de Agosto), com quem foi pioneiro de um movimento artístico e cultural que transformou Tiradentes, Bichinho e adjacências em um pólo de arte reconhecido.\n\nSuas obras, de temáticas variadas, têm como foco o reúso das mais diversas matérias-primas — papel machê, chapas de metal, madeira de demolição — moldando a arte mineira, valorizando a cultura, promovendo a inclusão social e a conscientização ambiental.\n\nNo Atelier Daniel Detomi — Arte e Natureza, o visitante caminha entre esculturas monumentais no jardim e painéis nas paredes. Ateliê aberto a visitas em Tiradentes — MG: chame no WhatsApp +55 32 98452-7407 e agende a sua.",
    },
  ],
}

export const instantConfig: InstantConfig = {
  textLines: [
    "REÚSO",
    "arte que nasce do que seria descartado",
    "Atelier Daniel Detomi — Tiradentes, Minas Gerais",
  ],
  videoPath: "/videos/ambient.mp4",
  roomLabel: "Sala 03 // O Ateliê",
}

export const footerConfig: FooterConfig = {
  brandText: "Daniel Detomi",
  taglineLines: [
    "ATELIER DANIEL DETOMI — ARTE E NATUREZA",
    "TIRADENTES — MINAS GERAIS — BRASIL",
    "DO DESCARTE NASCE A OBRA",
  ],
  navigationHeading: "NAVEGAÇÃO",
  navigationLinks: [
    { label: "Abertura", href: "/" },
    { label: "Obras do Ateliê", href: "/" },
    { label: "O Ateliê", href: "/" },
  ],
  contactHeading: "CONTATO",
  contactLinks: [
    { label: "WhatsApp +55 32 98452-7407", href: WHATSAPP_URL },
    { label: "Instagram @danieldetomiartenatureza", href: INSTAGRAM_URL },
    { label: "Tiradentes — Minas Gerais — Brasil" },
    { label: "Ateliê aberto a visitas" },
  ],
  copyright: "© 2026 ATELIER DANIEL DETOMI — ARTE E NATUREZA",
  creditText: "FEITO COM REÚSO, LUZ E GESTO",
}

export const workDetailConfig: WorkDetailConfig = {
  backLabel: "← VOLTAR",
  artistLabel: "Artista",
  locationLabel: "Origem",
  mediumLabel: "Técnica",
  backToGalleryLabel: "Voltar à Galeria",
  metaRoomSuffix: "// FICHA DA OBRA",
  footerNote: "Cada obra é única. Fale com o artista pelo WhatsApp para adquirir a sua.",
  notFoundTitle: "Obra não encontrada",
  notFoundLink: "Voltar à galeria",
}

// Helper map for WorkDetail lookups
export const worksById: Record<string, WorkItem> = Object.fromEntries(
  galleryConfig.works.map((w) => [w.id.toLowerCase(), w]),
)
