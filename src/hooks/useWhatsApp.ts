import { getWhatsAppUrl, formatWhatsAppNumber } from "@contracts/whatsapp";
import { useSettings } from "@/hooks/useTheme";

export function useWhatsApp(message?: string) {
  const { s } = useSettings();
  const number = s("contact.whatsapp", "");
  const display = formatWhatsAppNumber(number);
  const url = getWhatsAppUrl(number, message);

  return {
    number,
    display,
    url,
    href: url || "#",
    isConfigured: !!url,
  };
}
