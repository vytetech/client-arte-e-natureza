import Layout from "@/components/Layout";
import { useTexts } from "@/hooks/useTexts";
import { useLang } from "@/lib/i18n";
import { SITE_URL, usePageSeo } from "@/lib/seo";

const PHOTOS = [
  { src: "/images/artist-real-1.jpg", key: "artista.photo0" },
  { src: "/images/artist-real-2.jpg", key: "artista.photo1" },
  { src: "/images/artist-real-3.jpg", key: "artista.photo2" },
  { src: "/images/artist-real-4.jpg", key: "artista.photo3" },
];

export default function Artista() {
  const { t } = useTexts();
  const { t: tr } = useLang();
  usePageSeo({
    title: "Daniel Detomi - Artista plastico em Tiradentes MG",
    description:
      "Conheca Daniel Detomi, artista mineiro em Tiradentes. Seu trabalho une arte brasileira, pintura, escultura, papel mache, reuso de materiais e natureza.",
    path: "/artista",
    image: "/images/artist-real-1.jpg",
    type: "profile",
    keywords: [
      "Daniel Detomi",
      "Artista brasileiro",
      "Artista plastico em Tiradentes",
      "Artistas de Minas Gerais",
      "Arte e povos originarios",
      "Arte em papel mache",
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_URL}/artista#daniel-detomi`,
      name: "Daniel Detomi",
      jobTitle: "Artista plastico",
      url: `${SITE_URL}/artista`,
      image: `${SITE_URL}/images/artist-real-1.jpg`,
      worksFor: {
        "@type": "ArtGallery",
        name: "Atelier Daniel Detomi",
        url: SITE_URL,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tiradentes",
        addressRegion: "MG",
        addressCountry: "BR",
      },
    },
  });

  return (
    <Layout>
      <section className="bg-[var(--c-dark)] py-20 text-[var(--c-bg)]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-accent)]">{tr("artista.eyebrow")}</div>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Daniel Detomi</h1>
          <p className="mt-5 max-w-2xl font-display text-xl italic leading-relaxed text-white/70 md:text-2xl">
            “{t("artist_quote", tr("artista.quote_fallback"))}”
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-5">
        <div className="md:col-span-3">
          {t("artist_bio")
            .split("\n\n")
            .map((p, i) => (
              <p
                key={i}
                className={`mb-6 leading-relaxed text-[var(--c-ink)]/85 ${
                  i === 0 ? "font-display text-xl md:text-2xl" : "text-[17px]"
                }`}
              >
                {p}
              </p>
            ))}
          <figure className="mt-10">
            <img src="/images/atelier-interior-real.jpg" alt={tr("artista.interior_alt")} className="w-full object-cover" />
            <figcaption className="mt-3 border-l-2 border-[var(--c-primary)] pl-4 text-sm italic text-[var(--c-ink)]/60">
              {tr("artista.cap_interior")}
            </figcaption>
          </figure>
        </div>
        <div className="grid grid-cols-2 content-start gap-5 md:col-span-2">
          {PHOTOS.map((p) => (
            <figure key={p.src} className="group">
              <div className="overflow-hidden">
                <img
                  src={p.src}
                  alt={tr(p.key)}
                  className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{tr(p.key)}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Layout>
  );
}
