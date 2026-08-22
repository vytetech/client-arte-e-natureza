import { Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useLang } from "@/lib/i18n";
import { useTexts } from "@/hooks/useTexts";

type CafeItem = {
  id: number;
  type: "text" | "image" | "video";
  title: string;
  content: string;
  description: string;
};

function Paragraphs({ text, className = "text-base leading-8 text-[var(--c-ink)]/75 md:text-[17px]" }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) return null;

  return (
    <div className={`space-y-5 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

function CafeArticle({ item, index, imageAlt }: { item: CafeItem; index: number; imageAlt: string }) {
  const title = item.title.trim();
  const content = item.content.trim();
  const description = item.description.trim();
  const mediaFirst = index % 2 === 0;

  if (item.type === "text") {
    return (
      <article className="mx-auto max-w-3xl border-y border-[var(--c-primary)]/20 py-10 md:py-14">
        {title && <h2 className="font-display text-3xl font-semibold leading-tight text-[var(--c-ink)] md:text-5xl">{title}</h2>}
        <div className={title ? "mt-6" : ""}>
          <Paragraphs text={content} />
        </div>
        {description && (
          <div className="mt-7 max-w-2xl font-display">
            <Paragraphs text={description} className="text-lg italic leading-8 text-[var(--c-ink)]/55" />
          </div>
        )}
      </article>
    );
  }

  const media = item.type === "image"
    ? (
        <img
          src={content}
          alt={title || imageAlt}
          loading="lazy"
          className="aspect-[4/3] w-full bg-[var(--c-sand2)] object-cover"
        />
      )
    : (
        <video
          src={content}
          controls
          preload="metadata"
          className="aspect-video w-full bg-black object-contain"
          aria-label={title || imageAlt}
        />
      );

  const copy = (
    <div className="flex flex-col justify-center">
      {title && <h2 className="font-display text-3xl font-semibold leading-tight text-[var(--c-ink)] md:text-5xl">{title}</h2>}
      {title && <div className="mt-5 h-px w-16 bg-[var(--c-primary)]/55" />}
      {description && (
        <div className="mt-6 max-w-md font-display">
          <Paragraphs text={description} className="text-lg italic leading-8 text-[var(--c-ink)]/60" />
        </div>
      )}
    </div>
  );

  return (
    <article className="grid items-center gap-7 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
      <figure className={mediaFirst ? "" : "md:order-2"}>
        <div className="overflow-hidden rounded-sm shadow-[0_18px_45px_rgba(20,16,12,0.12)]">{media}</div>
      </figure>
      {copy}
    </article>
  );
}

export default function Cafe() {
  const { t, lang } = useLang();
  const { t: siteText } = useTexts();
  const { data, isLoading } = trpc.cafe.public.useQuery(lang, {
    staleTime: 60_000,
    retry: false,
  });
  const items = data?.enabled ? data.items : [];
  const showPublicPage = Boolean(data?.enabled && items.length > 0);

  const heroEyebrow = siteText("cafe.hero.eyebrow", t("cafe.hero.eyebrow"));
  const heroTitle = siteText("cafe.hero.title", t("cafe.hero.title"));
  const heroDescription = siteText("cafe.hero.description", t("cafe.hero.description"));

  return (
    <Layout>
      {isLoading && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-sm text-[var(--c-ink)]/60">{t("od.loading")}</p>
        </section>
      )}

      {!isLoading && !showPublicPage && (
        <section className="mx-auto max-w-3xl px-5 py-24 text-center">
          <p className="font-display text-2xl text-[var(--c-ink)]/75">{t("cafe.empty")}</p>
          <Link
            to="/"
            className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-primary)] transition hover:opacity-75"
          >
            {t("cafe.back")}
          </Link>
        </section>
      )}

      {showPublicPage && (
        <section className="relative overflow-hidden bg-[var(--c-bg)] py-20 text-[var(--c-ink)] md:py-28">
          <div className="absolute inset-x-0 top-0 h-px bg-[var(--c-primary)]/20" />
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.85fr_1.15fr] md:items-end">
            <div>
              <div className="eyebrow text-[var(--c-primary)]">{heroEyebrow}</div>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-none md:text-7xl">
                {heroTitle}
              </h1>
            </div>
            <p className="max-w-xl font-display text-xl italic leading-9 text-[var(--c-ink)]/65 md:justify-self-end">
              {heroDescription}
            </p>
          </div>
          <div className="mx-auto mt-14 max-w-6xl px-5">
            <div className="h-px w-full bg-[var(--c-primary)]/25" />
          </div>
        </section>
      )}

      {showPublicPage && (
        <section className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
          <div className="space-y-16 md:space-y-24">
            {items.map((item, index) => (
              <CafeArticle key={item.id} item={item as CafeItem} index={index} imageAlt={t("cafe.media_alt")} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
