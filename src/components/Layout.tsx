import { Link, NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import FloatingContact from "./FloatingContact";
import AmbientAudio from "./AmbientAudio";
import { useTheme } from "@/hooks/useTheme";
import { WHATSAPP_URL, INSTAGRAM_URL } from "@/config";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/artista", label: "O Artista" },
  { to: "/obras", label: "Obras" },
  { to: "/galeria", label: "Galeria" },
  { to: "/exposicoes", label: "Exposições" },
  { to: "/tiradentes", label: "Tiradentes" },
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--c-ink)]/10 bg-[var(--c-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold tracking-wide">
                Atelier Daniel Detomi
              </div>
              <div className="eyebrow text-[var(--c-primary)]" style={{ fontSize: "0.55rem" }}>
                Arte e Natureza
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `font-display text-[15px] tracking-wide transition-colors ${
                    isActive
                      ? "border-b border-[var(--c-primary)] pb-1 font-semibold text-[var(--c-primary)]"
                      : "text-[var(--c-ink)]/60 hover:text-[var(--c-primary)]"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="text-2xl leading-none md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
        {open && (
          <nav className="border-t border-[var(--c-ink)]/10 px-5 py-3 md:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2.5 font-display text-lg ${
                    isActive ? "font-semibold text-[var(--c-primary)]" : "text-[var(--c-ink)]/70"
                  }`
                }
              >
                {n.label}
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
              Estrada de Tiradentes, perto do Museu do Automóvel da Estrada Real
              <br />
              Tiradentes — Minas Gerais — Brasil.
              <br />
              Ateliê aberto a visitas mediante agendamento.
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
              Ver no Google Maps
            </a>
          </div>
          <div>
            <div className="eyebrow mb-4 text-white/35">Navegação</div>
            <div className="flex flex-col gap-2.5">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="font-display text-[15px] text-white/65 transition hover:text-white"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-4 text-white/35">Contato</div>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-[#4ee38a] hover:underline">
                WhatsApp +55 32 98452-7407
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[#e08bb5] hover:underline">
                Instagram @danieldetomiartenatureza
              </a>
              <Link to="/admin" className="mt-3 text-xs text-white/25 hover:text-white/50">
                Área do administrador
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs tracking-wide text-white/35">
          © 2026 Atelier Daniel Detomi — Feito com reúso, luz e gesto · Desenvolvido por{" "}
          <a
            href="https://www.vytetech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 transition hover:text-[var(--c-accent)]"
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
