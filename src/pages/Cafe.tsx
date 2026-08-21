import { Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useLang } from "@/lib/i18n";

function typeLabel(type: string, t: (key: string) => string) {
  if (type === "image") return t("cafe.photo");
  if (type === "video") return t("cafe.video");
  return t("cafe.text");
}

export default function Cafe() {
  const { t, lang } = useLang();
  const { data, isLoading } = trpc.cafe.public.useQuery(lang, {
    staleTime: 60_000,
    retry: false,
  });
  const items = data?.enabled ? data.items : [];

  return (
    <Layout>
      <section className="bg-[var(--c-dark)] py-20 text-[var(--c-bg)]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="eyebrow text-[var(--c-accent)]">{t("cafe.eyebrow")}</div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold md:text-6xl">
            {t("cafe.title")}
          </h1>
          <p className="mt-5 max-w-2xl font-display text-lg italic leading-relaxed text-white/65">
            {t("cafe.intro")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        {isLoading && <p className="text-sm text-[var(--c-ink)]/60">{t("od.loading")}</p>}

        {!isLoading && items.length === 0 && (
          <div className="rounded-xl border border-[var(--c-ink)]/10 bg-white p-10 text-center shadow-sm">
            <p className="text-[var(--c-ink)]/65">{t("cafe.empty")}</p>
            <Link
              to="/"
              className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-primary)] transition hover:opacity-75"
            >
              {t("cafe.back")}
            </Link>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              {item.type === "image" && (
                <img src={item.content} alt={item.title} className="h-80 w-full bg-[var(--c-sand2)] object-cover" />
              )}
              {item.type === "video" && (
                <video src={item.content} controls preload="metadata" className="h-80 w-full bg-black object-cover" />
              )}
              <div className="p-6">
                <div className="eyebrow text-[var(--c-primary)]" style={{ fontSize: "0.55rem" }}>
                  {typeLabel(item.type, t)}
                </div>
                {item.title && (
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    {item.title}
                  </h2>
                )}
                {item.type === "text" && (
                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--c-ink)]/80">
                    {item.content.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
