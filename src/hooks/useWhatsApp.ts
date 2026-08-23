import { buildWhatsAppUrl, type WhatsAppPurpose } from "@contracts/whatsapp";
import { useLang } from "@/lib/i18n";
import { trpc } from "@/providers/trpc";

type UseWhatsAppOptions = {
  message?: string;
  purpose?: WhatsAppPurpose;
};

export function useWhatsApp(messageOrOptions?: string | UseWhatsAppOptions) {
  const { lang } = useLang();
  const options = typeof messageOrOptions === "string" ? { message: messageOrOptions } : messageOrOptions ?? {};
  const { data: contacts = [] } = trpc.content.whatsappContacts.useQuery(lang, {
    staleTime: 30_000,
    retry: false,
  });
  const exact = options.purpose ? contacts.find((contact) => contact.purpose === options.purpose) : undefined;
  const general = contacts.find((contact) => contact.purpose === "general");
  const contact = exact ?? general ?? contacts[0];
  const url = contact ? buildWhatsAppUrl(contact.number, options.message) : "";

  return {
    contacts,
    contact,
    number: contact?.number ?? "",
    display: contact?.displayNumber ?? "",
    url,
    href: url || "#",
    isConfigured: !!url,
    hasMultipleContacts: contacts.length > 1,
    buildUrl: (number: string) => buildWhatsAppUrl(number, options.message),
  };
}
