import { Link, NavLink, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import FloatingContact from "./FloatingContact";
import AmbientAudio from "./AmbientAudio";
import { useTheme } from "@/hooks/useTheme";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useLang, type Lang } from "@/lib/i18n";
import { LANGUAGE_META } from "@/lib/languages";
import { INSTAGRAM_URL } from "@/config";
import { trpc } from "@/providers/trpc";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/artista", key: "nav.artista" },
  { to: "/obras", key: "nav.obras" },
  { to: "/galeria", key: "nav.galeria" },
  { to: "/exposicoes", key: "nav.exposicoes" },
  { to: "/tiradentes", key: "nav.tiradentes" },
];

function LogoMark({ className = "h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 260" className={className} aria-hidden="true">
      <circle cx="50" cy="222" r="34" fill="var(--c-primary)" />
      <path
        d="M50 8 C60 40 42 70 52 100 C62 128 30 132 36 158 C40 178 56 168 52 150"
        fill="none"
        stroke="var(--c-ink)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="36" cy="158" r="6" fill="var(--c-primary)" />
      <line x1="50" y1="150" x2="50" y2="190" stroke="var(--c-ink)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function LanguageSwitcher() {
  const { lang, setLang, enabled, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t("lang.selector")}
        title={t("lang.selector")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-lg text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
      >
        🌐
      </button>
      {open && (
        <div className="absolute end-0 top-11 z-50 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--c-ink)]/10 bg-white p-2 text-[var(--c-ink)] shadow-[0_18px_45px_rgba(20,16,12,0.16)]">
          {enabled.map((l: Lang) => (
            <button
              key={l}
              dir="ltr"
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-[#f8ecef] ${
                l === lang ? "bg-[#f8ecef] font-semibold text-[var(--c-primary)]" : "text-[var(--c-ink)]/75"
              }`}
            >
              <span dir="auto" className="min-w-0 flex-1 truncate">
                {LANGUAGE_META[l].label}
              </span>
              <span className="ms-auto w-4 shrink-0 text-right text-sm font-bold text-[var(--c-primary)]">
                {l === lang ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useTheme();
  const { t, lang } = useLang();
  const whatsapp = useWhatsApp();
  const { data: cafe } = trpc.cafe.public.useQuery(lang, { staleTime: 60_000, retry: false });
  const nav = cafe?.enabled && cafe.items.length > 0
    ? [...NAV, { to: "/cafe", key: "nav.cafe" }]
    : NAV;

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogoClick = () => {
    setOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(10,8,6,0.72)] shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link
            to="/"
            aria-label={t("nav.logo_home")}
            onClick={handleLogoClick}
            className="flex cursor-pointer items-center gap-3"
          >
            <LogoMark />
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold tracking-wide text-[#F5F2ED]">
                Atelier Daniel Detomi
              </div>
              <div className="eyebrow text-[rgba(245,242,237,0.55)]" style={{ fontSize: "0.55rem" }}>
                Arte e Natureza
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-7 md:flex">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `font-display text-[15px] tracking-wide transition-colors ${
                      isActive
                        ? "border-b border-[var(--c-primary)] pb-1 font-semibold text-[var(--c-primary)]"
                        : "text-white/70 hover:text-white"
                    }`
                  }
                >
                  {t(n.key)}
                </NavLink>
              ))}
            </nav>
            <LanguageSwitcher />
            <button
              className="text-2xl leading-none text-[#F5F2ED] transition hover:text-white md:hidden"
              onClick={() => setOpen(!open)}
              aria-label={t("nav.menu")}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-white/10 px-5 py-3 md:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2.5 font-display text-lg ${
                    isActive ? "font-semibold text-[var(--c-primary)]" : "text-white/70 hover:text-white"
                  }`
                }
              >
                {t(n.key)}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-[var(--c-dark)] text-[var(--c-bg)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-10" />
              <div>
                <div className="font-display text-xl font-semibold">Atelier Daniel Detomi</div>
                <div className="eyebrow text-[var(--c-accent)]" style={{ fontSize: "0.55rem" }}>
                  Arte e Natureza
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              {t("footer.address")}
              <br />
              {t("footer.city")}
              <br />
              {t("footer.visit")}
            </p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=-21.0955636,-44.1325055"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-accent)] transition hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
              </svg>
              {t("footer.maps")}
            </a>
          </div>
          <div>
            <div className="eyebrow mb-4 text-white/35">{t("footer.nav")}</div>
            <div className="flex flex-col gap-2.5">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="font-display text-[15px] text-white/65 transition hover:text-white"
                >
                  {t(n.key)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-4 text-white/35">{t("footer.contact")}</div>
            <div className="flex flex-col gap-2.5 text-sm">
              {whatsapp.isConfigured && (
                <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="text-[#4ee38a] hover:underline">
                  WhatsApp{whatsapp.display ? ` ${whatsapp.display}` : ""}
                </a>
              )}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[#e08bb5] hover:underline">
                Instagram @danieldetomiartenatureza
              </a>
              <Link to="/admin" className="mt-3 text-xs text-white/25 hover:text-white/50">
                {t("footer.admin")}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs tracking-wide text-white/35">
          {t("footer.copy")} · {t("footer.developed_by")}{" "}
          <a
            href="https://www.vytetech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/55 transition hover:text-white/80"
          >
            VyteTech
          </a>
        </div>
      </footer>

      <FloatingContact />
      <AmbientAudio />
    </div>
  );
}
