import { Link, useParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useSettings } from "@/hooks/useTheme";
import { useLang } from "@/lib/i18n";
import { WHATSAPP_URL } from "@/config";
import { statusTranslationKey } from "@contracts/status";

const READING_SITE = "https://www.leituradaborradecafe.com";

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

function formatBRL(value: string) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 7000;
  return `R$ ${safeAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ObraDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: work, isLoading } = trpc.content.workBySlug.useQuery(slug ?? "", {
    enabled: !!slug,
  });
  const { visible, s } = useSettings();
  const { t } = useLang();
  const showShipping = visible("shipping.enabled");
  const showShippingNote = s("shipping.note", "1") === "1";
  const showIntl = s("shipping.international", "0") === "1";
  const couponOn = s("coupon.enabled", "0") === "1";
  const couponName = s("coupon.name", "Cupom");
  const couponPct = s("coupon.percent", "");
  const showCoupon = couponOn && !!work?.couponEnabled && isCurrentDateInRange(s("coupon.start", ""), s("coupon.end", ""));
  const promoRead = s("prize.reading", "0") === "1";
  const promoWork = s("prize.work", "0") === "1";
  const readingLink = s("prize.reading.link", "0") === "1";
  const promotionMinimum = formatBRL(s("promotion.minimumAmount", "7000"));

  const waLink = work
    ? `${WHATSAPP_URL}?text=${encodeURIComponent(`Olá! Tenho interesse na obra "${work.title}" (${work.category}).`)}`
    : WHATSAPP_URL;

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
              <img src={work.image} alt={work.title} className="relative w-full object-cover" />
            </div>
            <div>
              <span className="eyebrow text-[var(--c-primary)]">{work.category}</span>
              <h1 className="mt-3 font-display text-5xl font-semibold">{work.title}</h1>
              <dl className="mt-6 space-y-2 border-t border-[var(--c-ink)]/10 pt-5 text-sm text-[var(--c-ink)]/70">
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.artista")}</dt><dd>Daniel Detomi</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.tecnica")}</dt><dd>{work.technique}</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.ano")}</dt><dd>{work.year}</dd></div>
                <div className="flex gap-2"><dt className="w-24 font-bold text-[var(--c-ink)]">{t("od.situacao")}</dt><dd>{t(statusTranslationKey(work.status))}</dd></div>
              </dl>
              <div className="mt-7 border-l-2 border-[var(--c-primary)] pl-5">
                <div className="eyebrow text-[var(--c-ink)]/50" style={{ fontSize: "0.55rem" }}>{t("od.preco")}</div>
                <div className="mt-1 font-display text-3xl font-semibold text-[var(--c-primary)]">{work.price}</div>
              </div>
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
              {(promoRead || promoWork) && (
                <div className="mt-4 rounded-lg border border-[var(--c-accent)]/50 bg-[#fff8ec] px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--c-ink)]">
                    {t("od.promo_title_prefix")} {promotionMinimum} {t("od.promo_title_suffix")}
                  </div>
                  <ul className="mt-1.5 space-y-1 text-sm text-[var(--c-ink)]/75">
                    {promoRead && <li>{t("od.prize_reading")}</li>}
                    {promoWork && <li>{t("od.prize_work")}</li>}
                  </ul>
                  {promoRead && readingLink && (
                    <a
                      href={READING_SITE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 block text-[11px] font-semibold text-[var(--c-primary)] underline underline-offset-2 hover:opacity-80"
                    >
                      {t("od.reading_site")}
                    </a>
                  )}
                  <span className="mt-1.5 block text-[11px] text-[var(--c-ink)]/55">
                    {t("od.promo_hint")}
                  </span>
                </div>
              )}
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
                href={waLink}
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
