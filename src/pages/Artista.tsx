import Layout from "@/components/Layout";
import { useTexts } from "@/hooks/useTexts";

const PHOTOS = [
  { src: "/images/artist-real-1.jpg", caption: "Com o alter-ego Guardião — papel machê e cocar de varetas pintadas" },
  { src: "/images/artist-real-2.jpg", caption: "Na abertura da exposição, ao lado do painel biográfico" },
  { src: "/images/artist-real-3.jpg", caption: "Com o dálmata da série xadrez, no ateliê" },
  { src: "/images/artist-real-4.jpg", caption: "Pintando os recortes de maritacas, fio a fio" },
];

export default function Artista() {
  const { t } = useTexts();

  return (
    <Layout>
      <section className="bg-[var(--c-dark)] py-20 text-[var(--c-bg)]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-accent)]">O Artista</div>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Daniel Detomi</h1>
          <p className="mt-5 max-w-2xl font-display text-xl italic leading-relaxed text-white/70 md:text-2xl">
            “{t("artist_quote", "Do descarte nasce a obra.")}”
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
            <img src="/images/atelier-interior-real.jpg" alt="Interior do ateliê" className="w-full object-cover" />
            <figcaption className="mt-3 border-l-2 border-[var(--c-primary)] pl-4 text-sm italic text-[var(--c-ink)]/60">
              O interior do ateliê em Tiradentes: pinturas, esculturas e recortes dividem as paredes.
            </figcaption>
          </figure>
        </div>
        <div className="grid grid-cols-2 content-start gap-5 md:col-span-2">
          {PHOTOS.map((p) => (
            <figure key={p.src} className="group">
              <div className="overflow-hidden">
                <img
                  src={p.src}
                  alt={p.caption}
                  className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="mt-2 text-xs leading-snug text-[var(--c-ink)]/60">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Layout>
  );
}
