import { trpc } from "@/providers/trpc";
import { useLang } from "@/lib/i18n";

export function useTexts() {
  const { lang } = useLang();
  const { data, isLoading } = trpc.content.texts.useQuery(lang, {
    staleTime: 1000 * 30,
  });
  const t = (key: string, fallback = "") =>
    (data && data[key]) || fallback;
  return { t, isLoading };
}
