import { Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/categoryLabels";

const CATEGORIES = [
  { name: "Pinturas", image: "/images/pintura-tropical.jpg", di: 0 },
  { name: "Esculturas", image: "/images/work-1.jpg", di: 1 },
  { name: "Galeria a Céu Aberto", image: "/images/real-ancionais.jpg", di: 2 },
  { name: "Circo & Forma", image: "/images/circo-tenis.jpg", di: 3 },
  { name: "Recortes", image: "/images/work-7.jpg", di: 4 },
  { name: "Arte Ambiental", image: "/images/ambiental-mascaras.jpg", di: 5 },
];

export default function Obras() {
  const { data: works } = trpc.content.works.useQuery();
  const { t } = useLang();

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="eyebrow text-[var(--c-primary)]">{t("obras.eyebrow")}</div>
        <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">{t("obras.title")}</h1>
        <p className="mt-5 max-w-2xl font-display text-xl italic leading-relaxed text-[var(--c-ink)]/70">
          {t("obras.intro")}
        </p>

        <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const count = works?.filter((w) => w.category === c.name).length ?? 0;
            return (
              <Link key={c.name} to={`/galeria?cat=${encodeURIComponent(c.name)}`} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={c.image}
                    alt={categoryLabel(c.name, t)}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-0 top-5 bg-[var(--c-dark)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--c-bg)]">
                    {String(i + 1).padStart(2, "0")} — {count} {count === 1 ? t("obras.obra") : t("obras.obras")}
                  </span>
                </div>
                <div className="mt-5 h-px w-10 bg-[var(--c-primary)] transition-all duration-500 group-hover:w-20" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-[var(--c-ink)] transition group-hover:text-[var(--c-primary)]">
                  {categoryLabel(c.name, t)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--c-ink)]/65">{t(`obras.cat${c.di}_desc`)}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
