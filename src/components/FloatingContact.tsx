import { WHATSAPP_URL, INSTAGRAM_URL } from "@/config"
import { useLang } from "@/lib/i18n"

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
      <path d="M16.04 3C9.02 3 3.3 8.72 3.3 15.74c0 2.24.59 4.43 1.7 6.36L3.2 28.8l6.86-1.8a12.68 12.68 0 0 0 5.98 1.52h.01c7.02 0 12.74-5.72 12.74-12.74A12.66 12.66 0 0 0 16.04 3zm0 23.27c-1.9 0-3.77-.51-5.4-1.48l-.39-.23-4.07 1.07 1.09-3.97-.25-.41a10.53 10.53 0 0 1-1.62-5.63c0-5.83 4.75-10.58 10.59-10.58a10.52 10.52 0 0 1 10.57 10.6c0 5.83-4.75 10.63-10.52 10.63zm5.81-7.92c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.46.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function FloatingContact() {
  const { t } = useLang()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("social.instagram")}
        title="Instagram @danieldetomiartenatureza"
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1 hover:scale-110"
        style={{
          background:
            "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
        }}
      >
        <InstagramIcon />
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("social.whatsapp")}
        title="WhatsApp +55 32 98452-7407"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_28px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:-translate-y-1 hover:scale-110"
      >
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 font-mono text-xs text-white group-hover:block">
          +55 32 98452-7407
        </span>
        <WhatsAppIcon />
      </a>
    </div>
  )
}
