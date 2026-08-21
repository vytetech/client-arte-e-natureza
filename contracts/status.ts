export const WORK_STATUSES = ["available", "sold", "reserved", "unavailable"] as const;

export type WorkStatus = (typeof WORK_STATUSES)[number];

export const WORK_STATUS_LABELS_PT: Record<WorkStatus, string> = {
  available: "Disponível",
  sold: "Vendido",
  reserved: "Reservado",
  unavailable: "Indisponível",
};

const LEGACY_STATUS_MAP: Record<string, WorkStatus> = {
  available: "available",
  disponivel: "available",
  sold: "sold",
  vendido: "sold",
  vendida: "sold",
  reserved: "reserved",
  reservado: "reserved",
  reservada: "reserved",
  unavailable: "unavailable",
  indisponivel: "unavailable",
  "no jardim": "unavailable",
};

function normalizeLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeStatus(value: unknown): WorkStatus | null {
  if (typeof value !== "string") return null;
  return LEGACY_STATUS_MAP[normalizeLookup(value)] ?? null;
}

export function canonicalStatus(value: unknown, fallback: WorkStatus = "unavailable"): WorkStatus {
  return normalizeStatus(value) ?? fallback;
}

export function statusTranslationKey(value: unknown) {
  const status = normalizeStatus(value);
  return status ? `status.${status}` : "status.unknown";
}
