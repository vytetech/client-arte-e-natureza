import { trpc } from "@/providers/trpc";

export function useTexts() {
  const { data, isLoading } = trpc.content.texts.useQuery(undefined, {
    staleTime: 1000 * 30,
  });
  const t = (key: string, fallback = "") =>
    (data && data[key]) || fallback;
  return { t, isLoading };
}
