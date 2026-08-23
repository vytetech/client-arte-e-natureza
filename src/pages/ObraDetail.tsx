import { Link, useParams } from "react-router";
import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import PromotionSection from "@/components/PromotionSection";
import { trpc } from "@/providers/trpc";
import { useSettings } from "@/hooks/useTheme";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useLang } from "@/lib/i18n";
import { statusTranslationKey } from "@contracts/status";
import { categoryLabel } from "@/lib/categoryLabels";

function parseDateOnly(value: string, endOfDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
}

function isCurrentDateInRange(start: string, end: string) {
  const now = new Date();
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end, true);
  return (!startDate || now >= startDate) && (!endDate || now <= endDate);
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function interpolate(message: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, value),
    message,
  );
}

type PublicVariant = {
  id: number;
  name: string;
  description: string;
  dimensions: string;
  price: number;
  status: string;
};
type PublicWorkImage = {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
};

function formatDimension(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return "";
  return numberValue.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export default function ObraDetail() {
  const { visible, s } = useSettings();
  const { t, lang } = useLang();
  const { slug } = useParams<{ slug: string }>();
  const { data: work, isLoading } = trpc.content.workBySlug.useQuery({ slug: slug ?? "", locale: lang }, {
    enabled: !!slug,
  });
  const workWithVariants = work as (typeof work & { variants?: PublicVariant[] }) | undefined;
  const activeVariants = useMemo(() => workWithVariants?.variants ?? [], [workWithVariants?.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? activeVariants[0];
  const gallery = useMemo<PublicWorkImage[]>(() => {
    if (!work) return [];
    const images = ((work as typeof work & { images?: PublicWorkImage[] }).images ?? [])
      .filter((image) => !!image.url)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return images.length > 0
      ? images
      : [{ url: work.image, alt: work.title, isPrimary: true, sortOrder: 1 }];
  }, [work]);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const selectedImage = gallery.find((image) => image.url === selectedImageUrl)
    ?? gallery.find((image) => image.isPrimary)
    ?? gallery[0];
  const dimensions = work
    ? [
      formatDimension(work.widthCm),
      formatDimension(work.heightCm),
      formatDimension(work.thicknessCm),
    ].filter(Boolean)
    : [];
  const showShipping = visible("shipping.enabled");
  const showShippingNote = s("shipping.note", "1") === "1";
  const showIntl = s("shipping.international", "0") === "1";
  const couponOn = s("coupon.enabled", "0") === "1";
  const couponName = s("coupon.name", t("od.coupon_default"));
  const couponPct = s("coupon.percent", "");
  const showCoupon = couponOn && !!work?.couponEnabled && isCurrentDateInRange(s("coupon.start", ""), s("coupon.end", ""));
  const variantPrice = selectedVariant ? formatBRL(selectedVariant.price) : "";
  const whatsapp = useWhatsApp({
    purpose: "sales",
    message: work
      ? selectedVariant
        ? interpolate(t("od.variant_whatsapp_message"), {
          title: work.title,
          variant: selectedVariant.name,
          price: variantPrice,
        })
        : `${t("od.whatsapp_message")} "${work.title}" (${categoryLabel(work.category, t)}).`
      : undefined,
  });
  const editionLabel = work
    ? work.isUniquePiece
      ? t("od.unique_piece")
      : work.editionLabel?.trim()
        ? work.editionLabel.trim()
        : work.editionNumber && work.editionTotal
          ? `${String(work.editionNumber).padStart(2, "0")}/${work.editionTotal}`
          : ""
    : "";

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Link to="/galeria" className="eyebrow text-[var(--c-primary)] hover:underline">
          {t("od.back")}
        </Link>

        {isLoading && <p className="mt-14 text-[var(--c-ink)]/60">{t("od.loading")}</p>}

        {!isLoading && !work && (
          <div className="mt-14">
            <h1 className="font-display text-3xl font-semibold">{t("od.notfound")}</h1>
            <Link to="/galeria" className="mt-3 inline-block text-[var(--c-primary)] hover:underline">
              {t("od.back2")}
            </Link>
          </div>
        )}

        {work && (
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--c-primary)]/25" />
              <img src={selectedImage?.url ?? work.image} alt={selectedImage?.alt || work.title} className="relative w-full object-cover" />
              {gallery.length > 1 && (
                <div className="relative mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {gallery.map((image) => {
                    const active = (selectedImage?.url ?? work.image) === image.url;
                    return (
                      <button
                        key={image.url}
                        type="button"
                        onClick={() => setSelectedImageUrl(image.url)}
                        className={`overflow-hidden border transition ${
                          active ? "border-[var(--c-primary)]" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        aria-label={image.alt || work.title}
                      >
                        <img src={image.url} alt="" className="h-20 w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <span className="eyebrow text-[var(--c-primary)]">{categoryLabel(work.category, t)}</span>
              <h1 className="mt-3 font-display text-5xl font-semibold">{work.title}</h1>
              <dl className="mt-6 space-y-2 border-t border-[var(--c-ink)]/10 pt-5 text-sm text-[var(--c-ink)]/70">
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.artista")}</dt><dd>Daniel Detomi</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.tecnica")}</dt><dd>{work.technique}</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.ano")}</dt><dd>{work.year}</dd></div>
                {editionLabel && (
                  <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.edition")}</dt><dd>{editionLabel}</dd></div>
                )}
                {dimensions.length > 0 && (
                  <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.dimensions")}</dt><dd>{dimensions.join(" x ")} cm</dd></div>
                )}
                {activeVariants.length === 0 && (
                  <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.situacao")}</dt><dd>{t(statusTranslationKey(work.status))}</dd></div>
                )}
              </dl>
              {activeVariants.length === 0 ? (
                <div className="mt-7 border-l-2 border-[var(--c-primary)] pl-5">
                  <div className="eyebrow text-[var(--c-ink)]/50" style={{ fontSize: "0.55rem" }}>{t("od.preco")}</div>
                  <div className="mt-1 font-display text-3xl font-semibold text-[var(--c-primary)]">{work.price}</div>
                </div>
              ) : (
                <div className="mt-7">
                  <h2 className="font-display text-2xl font-semibold">{t("od.variants_title")}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {activeVariants.map((variant) => {
                      const selected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`text-left transition ${
                            selected
                              ? "border-[var(--c-primary)] bg-[var(--c-primary)]/5"
                              : "border-[var(--c-ink)]/15 bg-white hover:border-[var(--c-primary)]/60"
                          } border p-4`}
                          aria-pressed={selected}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-display text-xl font-semibold">{variant.name}</div>
                              {variant.description && (
                                <p className="mt-1 text-sm leading-relaxed text-[var(--c-ink)]/65">{variant.description}</p>
                              )}
                            </div>
                            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] ${
                              variant.status === "available" ? "text-green-700" : "text-[var(--c-primary)]"
                            }`}>
                              {t(statusTranslationKey(variant.status))}
                            </span>
                          </div>
                          {variant.dimensions && (
                            <div className="mt-3 text-xs text-[var(--c-ink)]/55">
                              {t("od.dimensions")}: {variant.dimensions}
                            </div>
                          )}
                          <div className="mt-3 font-display text-2xl font-semibold text-[var(--c-primary)]">
                            {formatBRL(variant.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedVariant && (
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--c-ink)]/50">
                      {t("od.selected_variant")}: {selectedVariant.name} — {variantPrice}
                    </div>
                  )}
                </div>
              )}
              {showCoupon && (
                <div className="mt-4 rounded-lg border border-[var(--c-accent)]/50 bg-[#fff8ec] px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--c-ink)]">
                    🎟️ {couponName}{couponPct ? ` — ${couponPct}%` : ""}
                  </div>
                  <span className="mt-1 block text-[11px] text-[var(--c-ink)]/55">
                    {t("od.coupon_hint")}
                  </span>
                </div>
              )}
              <PromotionSection variant="compact" />
              {showShipping && (
                <div className="mt-4 text-sm font-medium text-[var(--c-ink)]/80">
                  {t("od.shipping")}
                  {showShippingNote && (
                    <span className="mt-0.5 block text-[11px] font-normal text-[var(--c-ink)]/50">
                      {t("od.shipping_note")}
                    </span>
                  )}
                  {showIntl && (
                    <span className="mt-0.5 block text-[11px] font-normal text-[var(--c-ink)]/50">
                      {t("od.shipping_intl")}
                    </span>
                  )}
                </div>
              )}
              <a
                href={whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block border border-[#25D366] bg-[#25D366] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[#1a7a3c]"
              >
                {t("od.whatsapp")}
              </a>
              <div className="mt-10 border-t border-[var(--c-ink)]/10 pt-8">
                {(work.description ?? "").split("\n\n").map((p, i) => (
                  <p
                    key={i}
                    className={`mb-5 leading-relaxed text-[var(--c-ink)]/85 ${
                      i === 0 ? "font-display text-xl italic" : "text-[15px]"
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
