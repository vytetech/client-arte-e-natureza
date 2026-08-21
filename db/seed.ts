import { eq } from "drizzle-orm";
import { closeDb, getDb } from "../api/queries/connection";
import * as schema from "./schema";

const C = {
  PINTURAS: "Pinturas",
  ESCULTURAS: "Esculturas",
  CEU_ABERTO: "Galeria a Céu Aberto",
  CIRCO: "Circo & Forma",
  RECORTES: "Recortes",
  AMBIENTAL: "Arte Ambiental",
};

const works: schema.InsertWork[] = [
  // PINTURAS
  { slug: "camaleao", title: "Camaleão", category: C.PINTURAS, technique: "Pintura sobre tela", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-camaleao.jpg", sortOrder: 1,
    description: "Um camaleão gigante enrola o rabo em espiral sobre o galho, o corpo vestido com a bandeira do Brasil: cabeça verde, tronco amarelo, e o azul estrelado correndo pelas costas.\n\nAs escamas do animal são pintadas uma a uma, com luz e sombra em cada ponta, criando um volume que parece saltar do plano.\n\nComo o camaleão, o Brasil muda de cor conforme o ambiente — mas a essência continua firme no galho. Obra vibrante, das mais pedidas por quem visita o ateliê." },
  { slug: "revoada", title: "Revoada", category: C.PINTURAS, technique: "Pintura sobre tela", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-revoada.jpg", sortOrder: 2,
    description: "Papagaios verdes, araras-azuis, periquitos e tucanos dividem os galhos de um ipê florido — dezenas de aves, cada uma com pose e olhar próprios.\n\nO fundo é um degradê de verdes e azuis que sugere a mata ao longe; na frente, a explosão dourada das flores organiza o caos.\n\nO ipê floresce por poucos dias no ano. A pintura fixa para sempre esse instante em que a floresta inteira parece acesa." },
  { slug: "tiradentes-panel", title: "Tiradentes", category: C.PINTURAS, technique: "Pintura sobre madeira de demolição", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-tiradentes-panel.jpg", sortOrder: 3,
    description: "Torres de igreja colonial, casario de telhados vermelhos descendo o vale, serras verdes no horizonte — e tucanos e ipês em primeiro plano.\n\nFoi em Tiradentes, no início dos anos 90, que Daniel Detomi começou sua trajetória ao lado de artistas como Fernando Pita e Toti, da Oficina de Agosto.\n\nA madeira reaproveitada dá à pintura uma profundidade que tela nenhuma tem: os veios atravessam as montanhas e as juntas das tábuas marcam os planos da paisagem." },
  { slug: "noite-tropical", title: "Noite Tropical", category: C.PINTURAS, technique: "Pintura sobre tela", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-noite.jpg", sortOrder: 4,
    description: "Um rio de vitórias-régias sob a lua cheia: figuras humanas, helicônias vermelhas, peixes e botos dividem a água numa cena entre o sonho e o mito amazônico.\n\nÉ o Brasil imaginário de Detomi em sua forma mais lírica — a natureza não como cenário, mas como personagem.\n\nUma tela que pede parede ampla e tempo de contemplação." },
  { slug: "cupido", title: "Cupido", category: C.PINTURAS, technique: "Pintura sobre tábuas de demolição", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-cupido.jpg", sortOrder: 5,
    description: "Um cupido de asas azuladas se contorce sobre as nuvens, arco esticado — pintado sobre tábuas de demolição cujas juntas atravessam o corpo do personagem como um afresco descoberto sob a parede.\n\nDetomi não esconde as marcas da madeira: compõe sobre elas. Cada falha da tábua vira sombra, nuvem ou contorno.\n\nRomantismo e reúso na mesma peça. Nenhuma tábua se repete; cada Cupido é único." },
  // ESCULTURAS
  { slug: "cocar", title: "Cocar", category: C.ESCULTURAS, technique: "Papel machê e plumária pintada", status: "available", year: "2026", price: "Sob consulta", image: "/images/work-1.jpg", sortOrder: 6,
    description: "Cabeça em papel machê com cocar multicolorido — homenagem direta aos povos originários do Brasil. O rosto em terracota é atravessado por grafismos negros; acima, o cocar explode em centenas de varetas pintadas fio a fio.\n\nCamadas de papel reaproveitado são empastadas, moldadas e lixadas até ganharem a anatomia do rosto. Depois, cada grafismo é traçado à mão, sem molde.\n\nO cocar é símbolo de honra e liderança. Presença escultural que transforma uma sala inteira." },
  { slug: "guardiao", title: "Guardião", category: C.ESCULTURAS, technique: "Papel machê, cocar de varetas pintadas", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-guardiao.jpg", sortOrder: 7,
    description: "Busto em papel machê sobre base listrada, com pintura corporal geométrica e cocar de varetas que irradiam em todas as direções como um sol.\n\nAs varetas são recortadas, enroladas e pintadas uma a uma em faixas de amarelo, preto e vermelho — dias de trabalho para uma única peça.\n\nO olhar lateral dá à peça a sensação de vigia: um guardião que acompanha o ambiente." },
  { slug: "araras", title: "Araras", category: C.ESCULTURAS, technique: "Escultura de parede pintada à mão", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-araras.jpg", sortOrder: 8,
    description: "Duas araras-azuis e uma arara-vermelha em escultura de parede: corpo, asas e cauda são peças separadas, sobrepostas para criar relevo real.\n\nAs penas são incisas e pintadas individualmente — a plumagem muda com a luz do ambiente ao longo do dia.\n\nA arara-azul quase desapareceu pela destruição do habitat. Pendurar estas aves na parede é decorar com significado." },
  // GALERIA A CÉU ABERTO
  { slug: "ancionais", title: "Ancionais", category: C.CEU_ABERTO, technique: "Papel machê em grande escala, uso externo", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/real-ancionais.jpg", sortOrder: 9,
    description: "Cinco rostos monumentais em papel machê repousam lado a lado na borda do barranco, com a mata atlântica fechando o fundo — cada um com expressão própria, entre o riso e a meditação.\n\nSão obras feitas para o tempo: chuva, sol e musgo vão acrescentando camadas novas à pele de cada rosto. O envelhecimento não estraga a obra — ele a continua.\n\nNo jardim do ateliê, a arte não fica atrás de vidro: vive no chão, na grama, entre as árvores." },
  { slug: "capivaras", title: "Capivaras", category: C.CEU_ABERTO, technique: "Conjunto em metal recortado e pintado", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/real-guardioes.jpg", sortOrder: 10,
    description: "Capivaras de todos os tamanhos pastam sobre as pedras, um veado amamenta o filhote malhado e um macaco amarelo balança na coluna da varanda.\n\nCada animal é recortado em metal de reúso e pintado em tons de palha e ferrugem que se misturam ao verde do gramado.\n\nOs conjuntos são feitos sob medida — o cliente escolhe espécies, quantidades e tamanhos. O jardim vira um palco que muda quando o dono quiser." },
  { slug: "veados", title: "Veados", category: C.CEU_ABERTO, technique: "Metal de reúso, asas em chapa pintada", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/real-vigia.jpg", sortOrder: 11,
    description: "Três veados-campeiros atravessam o jardim entre bromélias vermelhas — e, acima de tudo, um par de asas brancas abertas paira sobre a cena.\n\nAs asas, em chapa branca, têm cada pena recortada e sobreposta: leveza construída em material pesado.\n\nA cena mistura documento e sonho — os veados são os que habitam o cerrado ao redor de Tiradentes; as asas são o desejo de proteção sobre eles." },
  // CIRCO & FORMA
  { slug: "dalmata", title: "Dálmata", category: C.CIRCO, technique: "Pintura sobre fundo xadrez óptico", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-dalmata.jpg", sortOrder: 12,
    description: "Um dálmata em pose alerta, língua de fora, sobre um fundo xadrez que ondula e engana os olhos — o padrão entorta atrás do cachorro como se a parede respirasse.\n\nO xadrez é pintado com precisão matemática e depois distorcido de propósito: a ilusão de movimento numa superfície parada.\n\nRigor geométrico quebrado pela vida. O ateliê aceita retratos de pets sob encomenda com a mesma técnica." },
  { slug: "tenis-xadrez", title: "Tênis Xadrez", category: C.CIRCO, technique: "Pintura, ilusão de ótica", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-tenis.jpg", sortOrder: 13,
    description: "Um tênis de cadarços soltos flutua sobre uma grade xadrez que se curva e se abre — pop art e ilusão de ótica num mesmo quadro.\n\nA obra mostra o outro lado de Detomi: o artista de formação técnica rigorosa, interessado pela percepção visual.\n\nO mesmo olhar que observa a natureza com precisão é o que deconstrói uma grade xadrez." },
  { slug: "arlequins", title: "Arlequins", category: C.CIRCO, technique: "Pintura emoldurada, série circo", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-arlequins.jpg", sortOrder: 14,
    description: "Palhaços e arlequins equilibristas emoldurados, entre bandeirinhas de festa e céus de algodão — o artista como performer, como equilibrista sobre a bola vermelha.\n\nA série é uma reflexão sobre o próprio ofício: criar é sempre um número de circo, feito sem rede.\n\nConjuntos de molduras podem ser compostos sob encomenda." },
  // RECORTES
  { slug: "lobo-guara", title: "Lobo-Guará", category: C.RECORTES, technique: "Recorte em chapas de metal de reúso", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-lobo.jpg", sortOrder: 15,
    description: "O lobo-guará atravessa o jardim em passo largo: pelagem vermelho-alaranjada pintada fio a fio, gola clara, pernas negras como meias.\n\nRecorte em chapa de metal de reúso: desenho em escala real, corte, dobra sutil para dar volume, e pintura com pincel fino seguindo a direção real da pelagem.\n\nO maior canídeo da América do Sul, símbolo do cerrado mineiro — arte que une emoção e defesa ambiental." },
  { slug: "onca", title: "Onça", category: C.RECORTES, technique: "Metal recortado e pintado", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-onca.jpg", sortOrder: 16,
    description: "A onça-pintada avança em direção a quem olha, corpo baixo e mandíbula aberta — dezenas de rosetas desenhadas uma a uma, nenhuma igual à outra.\n\nPrimeiro o dourado-ocre do fundo, depois as rosetas, por último focinho, olhos esverdeados e garras: o trabalho mais minucioso do repertório.\n\nOnde a onça está, o ecossistema inteiro está de pé. A postura do animal diz tudo, sem legenda." },
  { slug: "seriemas", title: "Seriemas", category: C.RECORTES, technique: "Metal recortado, conjunto de aves", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/real-seriemas.jpg", sortOrder: 17,
    description: "Seriemas de asas entreabertas e um bando de filhotes escuros bicando o capim entre flores amarelas — uma cena de vida, não uma fileira de objetos.\n\nAs penas das asas e da cauda são desenhadas em relevo e pintadas na paleta exata da ave: castanho, palha e pernas vermelhas.\n\nA ave-símbolo do cerrado mineiro, cujo canto atravessa os campos de Tiradentes ao amanhecer." },
  // ARTE AMBIENTAL
  { slug: "guardioes-da-encosta", title: "Guardiões da Encosta", category: C.AMBIENTAL, technique: "Papel machê monumental in situ", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/ceu-1.jpg", sortOrder: 18,
    description: "Três rostos monumentais emergem da encosta entre samambaias e troncos, vigiados por uma onça recortada no alto do barranco.\n\nA obra só existe plenamente em relação ao lugar: a terra, a vegetação e a luz de Tiradentes são parte da composição.\n\nArte ambiental é a face mais radical do ateliê — a paisagem como moldura e como matéria." },
  { slug: "vigia", title: "Vigia", category: C.AMBIENTAL, technique: "Papel machê e metal de reúso", status: "unavailable", year: "2026", price: "Sob consulta", image: "/images/ceu-2.jpg", sortOrder: 19,
    description: "Entre agaves azul-esverdeadas, uma máscara de grafismos negros observa o jardim enquanto uma seriema em metal caminha diante dela.\n\nO encontro que define o trabalho de Detomi: os povos originários e a fauna do cerrado no mesmo quadro.\n\nA máscara vigia, a ave patrulha — narrativa silenciosa que transforma cantos de jardim em galeria viva." },
  { slug: "tucano", title: "Tucano", category: C.RECORTES, technique: "Recorte em chapa, pintura à mão", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-tucano.jpg", sortOrder: 20,
    description: "Um tucano-toco em tamanho monumental ocupa a parede: bico alaranjado pintado em degradê, olho azul-elétrico e plumagem negra recortada em chapa.\n\nNo bico, uma surpresa: a sequência da evolução humana gravada em silhueta — o passado caminhando sobre o símbolo da fauna brasileira.\n\nPeça de parede de grande impacto, feita para áreas internas ou varandas protegidas. O ateliê produz outras espécies sob encomenda." },
  { slug: "dalmata-xadrez", title: "Dálmata no Xadrez", category: C.CIRCO, technique: "Painel pintado, xadrez óptico", status: "available", year: "2026", price: "Sob consulta", image: "/images/real-dalmata-xadrez.jpg", sortOrder: 21,
    description: "O dálmata em corpo inteiro sobre o xadrez que ondula — a versão em painel da série de ilusão de ótica do ateliê.\n\nCada mancha é pintada individualmente e o fundo xadrez é calculado para entortar atrás do cachorro, criando a sensação de parede viva.\n\nRetratos de pets sob encomenda com a mesma técnica: o ateliê trabalha a partir de fotos do animal." },
];

const texts: { key: string; label: string; value: string }[] = [
  { key: "hero_title", label: "Início — Título principal", value: "ATELIER DANIEL DETOMI" },
  { key: "hero_subtitle", label: "Início — Subtítulo", value: "Arte e Natureza em Tiradentes — Minas Gerais" },
  { key: "hero_text", label: "Início — Texto de abertura", value: "Um artista que não se limita a uma técnica, mas a um território criativo — onde a pintura de cavalete, a escultura, a instalação ambiental e o desenho gráfico coexistem como manifestações de uma mesma visão.\n\nAqui, a arte não fica atrás de vidro: ela cresce unavailable, emerge da encosta e caminha entre as árvores. Visite o ateliê em Tiradentes e encontre as obras entre a vegetação — como deve ser." },
  { key: "home_painting_title", label: "Início — Título bloco Pintura", value: "A Pintura — o mundo lírico e o mundo gráfico" },
  { key: "home_painting_text", label: "Início — Texto bloco Pintura", value: "De um lado, paisagens densas, fauna e flora brasileiras em cores vibrantes — tucanos, ipês, cenas tropicais. É o Brasil imaginário de Detomi.\n\nDo outro, o dálmata, o tênis xadrez, os arlequins — um universo de ilusão de ótica, pop art e circo, que revela formação técnica rigorosa e interesse pela percepção visual.\n\nDuas faces do mesmo olhar: observar a natureza com a mesma precisão com que se deconstrói uma grade xadrez." },
  { key: "home_sculpture_title", label: "Início — Título bloco Escultura", value: "A Escultura e o Recorte — o corpo na paisagem" },
  { key: "home_sculpture_text", label: "Início — Texto bloco Escultura", value: "Araras, veados, capivaras e as grandes faces na encosta são obras que só existem plenamente em relação ao lugar.\n\nunavailable, na luz de Tiradentes, entre as plantas — cada visita ao ateliê é uma experiência de lugar, não apenas de obra." },
  { key: "home_alterego_title", label: "Início — Título bloco Alter-egos", value: "O Indígena e o Palhaço — os alter-egos" },
  { key: "home_alterego_text", label: "Início — Texto bloco Alter-egos", value: "A cabeça indígena com o cocar é um autorretrato simbólico. Os palhaços equilibristas são uma reflexão sobre o artista como performer.\n\nDetomi não é apenas um pintor de natureza: é um pensador visual." },
  { key: "artist_bio", label: "O Artista — Biografia completa", value: "Daniel Detomi é mineiro, nascido em São João del-Rei. Desenvolveu seu trabalho criativo na cidade histórica de Tiradentes — MG, no início dos anos 90, junto a renomados artistas como Fernando Pita e Toti (Oficina de Agosto), dentre outros.\n\nNesta cidade histórica, fez parte de um conjunto de artistas que iniciaram um movimento artístico que se desenvolve até os dias de hoje — moldando a arte mineira, valorizando a cultura, promovendo a inclusão social e a conscientização ambiental.\n\nSuas obras, de temáticas variadas, têm como foco o reúso das mais diversas matérias-primas: papel machê em homenagem aos povos originários, a fauna brasileira em recortes de chapas de metal de reúso e painéis de madeira de demolição que retratam as paisagens e belezas de um Brasil tão rico e diverso.\n\nNo Atelier Daniel Detomi — Arte e Natureza, o visitante caminha entre esculturas monumentais no jardim e pinturas nas paredes. O ateliê é um lugar físico que se visita — e este site é um convite." },
  { key: "artist_quote", label: "O Artista — Frase de destaque", value: "Do descarte nasce a obra. Da terra, a memória. Do olhar, a forma." },
  { key: "expo_title", label: "Exposições — Título da página", value: "Exposições" },
  { key: "expo_recortes_title", label: "Exposições — Banner 1 título", value: "RECORTES DO CERRADO" },
  { key: "expo_recortes_text", label: "Exposições — Banner 1 texto", value: "A fauna do cerrado mineiro recortada em metal de reúso: lobos-guará, onças, seriemas, capivaras e veados ocupam o espaço como quem retoma o próprio território.\n\nUma exposição que é também um alerta — preservar o cerrado é preservar tudo o que vive nele." },
  { key: "expo_terra_title", label: "Exposições — Banner 2 título", value: "TERRA BRASILIS" },
  { key: "expo_terra_text", label: "Exposições — Banner 2 texto", value: "Papel machê em homenagem aos povos originários, a fauna brasileira em recortes de chapas de metal de reúso e painéis de madeira de demolição retratando as paisagens e belezas do Brasil.\n\nUma mostra que valoriza a cultura, promove a inclusão social e a conscientização ambiental." },
  { key: "tiradentes_title", label: "Tiradentes — Título da página", value: "Tiradentes — Minas Gerais" },
  { key: "tiradentes_text", label: "Tiradentes — Texto principal", value: "Fundada no início do século XVIII, Tiradentes é uma das cidades históricas mais bem preservadas do Brasil. Ruas de pedra, casario colonial, igrejas barrocas e a Serra de São José emoldurando o horizonte — a cidade inteira é um cenário que inspirou gerações de artistas.\n\nFoi aqui, no início dos anos 90, que um grupo de artistas — entre eles Daniel Detomi, Fernando Pita e Toti, da Oficina de Agosto — iniciou um movimento que transformou Tiradentes, Bichinho e adjacências em um pólo de arte reconhecido em todo o país.\n\nHoje, ateliês, galerias e oficinas dividem espaço com a gastronomia mineira e os festivais culturais. O Atelier Daniel Detomi — Arte e Natureza faz parte dessa história: um lugar onde a arte cresce unavailable e recebe visitantes de portas abertas.\n\nPara visitar, chame no WhatsApp +55 32 98452-7407 e agende. A placa na estrada indica o caminho — siga a seta vermelha." },
  { key: "footer_tagline", label: "Rodapé — Frase", value: "Arte e Natureza — Tiradentes, Minas Gerais" },
];

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  let insertedWorks = 0;
  let skippedWorks = 0;
  for (const work of works) {
    const existing = await db
      .select({ id: schema.works.id })
      .from(schema.works)
      .where(eq(schema.works.slug, work.slug))
      .limit(1);

    if (existing.length > 0) {
      skippedWorks++;
      console.log(`SKIP work: ${work.slug}`);
      continue;
    }

    await db.insert(schema.works).values(work);
    insertedWorks++;
    console.log(`INSERT work: ${work.slug}`);
  }
  console.log(`Works inserted: ${insertedWorks}; skipped: ${skippedWorks}.`);

  for (const t of texts) {
    await db
      .insert(schema.siteTexts)
      .values(t)
      .onConflictDoUpdate({
        target: schema.siteTexts.key,
        set: { label: t.label },
      });
  }
  console.log(`Upserted ${texts.length} site texts.`);

  console.log("Done.");
}

seed()
  .then(async () => {
    await closeDb();
    process.exit(0);
  })
  .catch(async (error) => {
    await closeDb();
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
