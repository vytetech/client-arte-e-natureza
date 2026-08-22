import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { applyTheme, FONT_OPTIONS } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { canonicalStatus, WORK_STATUSES } from "@contracts/status";
import { useLang, type Lang, type LangCtx } from "@/lib/i18n";
import { formatLanguageLabel } from "@/lib/languages";
import { categoryLabel } from "@/lib/categoryLabels";
import { formatWhatsAppNumber, normalizeWhatsAppNumber } from "@contracts/whatsapp";

const CATEGORIES = [
  "Pinturas",
  "Esculturas",
  "Galeria a Céu Aberto",
  "Circo & Forma",
  "Recortes",
  "Arte Ambiental",
];

const SECTIONS = [
  { key: "section.manifesto", labelKey: "admin.sections.manifesto" },
  { key: "section.linguagens", labelKey: "admin.sections.languages" },
  { key: "section.video", labelKey: "admin.sections.video" },
  { key: "section.destino", labelKey: "admin.sections.destination" },
  { key: "section.imagens", labelKey: "admin.sections.images" },
  { key: "section.ceuaberto", labelKey: "admin.sections.open_air" },
  { key: "section.mapa", labelKey: "admin.sections.map" },
];

const COLOR_FIELDS = [
  { key: "design.primary", labelKey: "admin.design.color_primary", def: "#8f1d22" },
  { key: "design.bg", labelKey: "admin.design.color_bg", def: "#f6f0e4" },
  { key: "design.ink", labelKey: "admin.design.color_ink", def: "#1a1712" },
  { key: "design.accent", labelKey: "admin.design.color_accent", def: "#d4a24e" },
  { key: "design.dark", labelKey: "admin.design.color_dark", def: "#14100c" },
  { key: "design.sand", labelKey: "admin.design.color_sand", def: "#efe6d2" },
];

type Tab =
  | "obras"
  | "imagens"
  | "textos"
  | "design"
  | "secoes"
  | "cupom"
  | "promocoes"
  | "entrega"
  | "contato"
  | "idiomas"
  | "cafe"
  | "usuarios";

const TABS: { id: Tab; labelKey: string }[] = [
  { id: "obras", labelKey: "admin.tab.works" },
  { id: "imagens", labelKey: "admin.tab.images" },
  { id: "textos", labelKey: "admin.tab.texts" },
  { id: "design", labelKey: "admin.tab.design" },
  { id: "secoes", labelKey: "admin.tab.sections" },
  { id: "cupom", labelKey: "admin.tab.coupon" },
  { id: "promocoes", labelKey: "admin.tab.promotions" },
  { id: "entrega", labelKey: "admin.tab.shipping" },
  { id: "contato", labelKey: "admin.tab.contact" },
  { id: "idiomas", labelKey: "admin.tab.languages" },
  { id: "cafe", labelKey: "admin.tab.cafe" },
  { id: "usuarios", labelKey: "admin.tab.users" },
];

type WorkForm = {
  slug: string;
  title: string;
  category: string;
  technique: string;
  status: string;
  year: string;
  price: string;
  isUniquePiece: boolean;
  editionNumber: number | null;
  editionTotal: number | null;
  editionLabel: string;
  image: string;
  description: string;
  sortOrder: number;
};

type WorkTranslationForm = Pick<WorkForm, "title" | "category" | "technique" | "description">;
type VariantTranslationForm = {
  name: string;
  description: string;
  dimensions: string;
};
type WorkVariantForm = {
  id?: number;
  name: string;
  description: string;
  dimensions: string;
  price: number;
  active: boolean;
  status: string;
  sortOrder: number;
  translations: Record<Lang, VariantTranslationForm>;
};

const LANGS: Lang[] = ["pt", "en", "es", "ar"];

const emptyWork: WorkForm = {
  slug: "",
  title: "",
  category: CATEGORIES[0],
  technique: "",
  status: "available",
  year: "2026",
  price: "Sob consulta",
  isUniquePiece: false,
  editionNumber: null,
  editionTotal: null,
  editionLabel: "",
  image: "",
  description: "",
  sortOrder: 99,
};

function emptyVariant(sortOrder: number): WorkVariantForm {
  const emptyTranslation = { name: "", description: "", dimensions: "" };
  return {
    name: "",
    description: "",
    dimensions: "",
    price: 0,
    active: true,
    status: "available",
    sortOrder,
    translations: {
      pt: emptyTranslation,
      en: emptyTranslation,
      es: emptyTranslation,
      ar: emptyTranslation,
    },
  };
}

/** "R$ 12.500,50" → 12500.5 ; null se não houver número */
function parseBRL(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function text(t: LangCtx["t"], key: string, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    t(key),
  );
}

export default function Admin() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("obras");

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">{t("admin.loading")}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--c-bg)]">
        <p>{t("admin.restricted")}</p>
        <Link to="/login">
          <Button>{t("admin.login_link")}</Button>
        </Link>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--c-bg)]">
        <p>{t("admin.forbidden")}</p>
        <Button variant="outline" onClick={logout}>{t("admin.logout")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-black">{t("admin.title")}</h1>
            <p className="text-xs text-[var(--c-ink)]/60">{text(t, "admin.greeting", { name: user?.name ?? "admin" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline">{t("admin.view_site")}</Button>
            </Link>
            <Button variant="outline" onClick={logout}>{t("admin.logout")}</Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-3">
          {TABS.map((item) => (
            <Button
              key={item.id}
              variant={tab === item.id ? "default" : "outline"}
              onClick={() => setTab(item.id)}
            >
              {t(item.labelKey)}
            </Button>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "obras" && <WorksTab />}
        {tab === "imagens" && <ImagesTab />}
        {tab === "textos" && <TextsTab />}
        {tab === "design" && <DesignTab />}
        {tab === "secoes" && <SectionsTab />}
        {tab === "cupom" && <CouponTab />}
        {tab === "promocoes" && <PromocoesTab />}
        {tab === "entrega" && <EntregaTab />}
        {tab === "contato" && <ContactTab />}
        {tab === "idiomas" && <IdiomasTab />}
        {tab === "cafe" && <CafeTab />}
        {tab === "usuarios" && <UsersTab />}
      </main>
    </div>
  );
}

/* ============================= USUÁRIOS ============================= */

type UserForm = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: "admin";
  isActive: boolean;
};

const emptyUserForm: UserForm = {
  name: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "admin",
  isActive: true,
};

function formatDate(value: Date | string | null | undefined, lang: string, t: LangCtx["t"]) {
  if (!value) return t("admin.never");
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return t("admin.never");
  const locale = lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : lang === "ar" ? "ar" : "es";
  return date.toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function UsersTab() {
  const utils = trpc.useUtils();
  const { lang, t } = useLang();
  const { data: users, isLoading } = trpc.admin.listUsers.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyUserForm);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [notice, setNotice] = useState("");

  const invalidate = () => utils.admin.listUsers.invalidate();
  const onError = () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`);

  const createMut = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      invalidate();
      setForm(emptyUserForm);
      setEditingId(null);
      setNotice(t("admin.users.created"));
    },
    onError,
  });
  const updateMut = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      invalidate();
      setForm(emptyUserForm);
      setEditingId(null);
      setNotice(t("admin.users.updated"));
    },
    onError,
  });
  const resetMut = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      setResetUserId(null);
      setNewPassword("");
      setConfirmNewPassword("");
      setNotice(t("admin.users.password_updated"));
    },
    onError,
  });
  const deleteMut = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      invalidate();
      setNotice(t("admin.users.deleted"));
    },
    onError,
  });

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyUserForm);
    setNotice("");
  };

  const startEdit = (user: NonNullable<typeof users>[number]) => {
    setEditingId(user.id);
    setForm({
      name: user.name ?? "",
      username: user.username ?? "",
      password: "",
      confirmPassword: "",
      role: "admin",
      isActive: user.isActive,
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveUser = () => {
    setNotice("");
    if (editingId === null && form.password !== form.confirmPassword) {
      setNotice(t("admin.users.password_mismatch"));
      return;
    }

    if (editingId === null) {
      createMut.mutate({
        name: form.name,
        username: form.username,
        password: form.password,
        role: form.role,
      });
      return;
    }

    updateMut.mutate({
      id: editingId,
      name: form.name,
      username: form.username,
      isActive: form.isActive,
    });
  };

  const resetPassword = (id: number) => {
    setNotice("");
    if (newPassword !== confirmNewPassword) {
      setNotice(t("admin.users.password_mismatch"));
      return;
    }
    resetMut.mutate({ id, password: newPassword });
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="rounded-lg border border-[var(--c-ink)]/15 bg-white px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-bold">
            {editingId === null ? t("admin.users.new_title") : t("admin.users.edit_title")}
          </h2>
          {editingId !== null && (
            <Button variant="outline" size="sm" onClick={startCreate}>
              {t("admin.users.new")}
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase">{t("admin.users.name")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase">{t("admin.users.username")}</label>
            <Input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              placeholder="admin"
            />
          </div>
          {editingId === null && (
            <>
              <div>
                <label className="text-xs font-bold uppercase">{t("admin.users.initial_password")}</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">{t("admin.users.confirm_password")}</label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-bold uppercase">{t("admin.users.role")}</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "admin" })}
            >
              <option value="admin">{t("admin.users.admin_role")}</option>
            </select>
          </div>
          {editingId !== null && (
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              {t("admin.users.active")}
            </label>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={saveUser} disabled={createMut.isPending || updateMut.isPending}>
            {editingId === null ? t("admin.users.create") : t("admin.users.save")}
          </Button>
          {editingId !== null && (
            <Button variant="outline" onClick={startCreate}>
              {t("admin.cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-[var(--c-ink)]/60">{t("admin.users.loading")}</p>}
        {users?.map((user) => (
          <div key={user.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-bold">{user.name ?? t("admin.no_name")}</div>
                <div className="text-sm text-[var(--c-ink)]/60">@{user.username}</div>
                <div className="mt-1 text-xs text-[var(--c-ink)]/45">
                  {user.isActive ? t("admin.active") : t("admin.inactive")} · {user.role} · {t("admin.last_access")}:{" "}
                  {formatDate(user.lastSignInAt, lang, t)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                  {t("admin.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setResetUserId(resetUserId === user.id ? null : user.id);
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                >
                  {t("admin.users.reset")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(text(t, "admin.users.delete_confirm", { username: user.username }))) {
                      deleteMut.mutate({ id: user.id });
                    }
                  }}
                >
                  {t("admin.delete")}
                </Button>
              </div>
            </div>

            {resetUserId === user.id && (
              <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="text-xs font-bold uppercase">{t("admin.users.new_password")}</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">{t("admin.users.confirm_new_password")}</label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => resetPassword(user.id)}
                    disabled={resetMut.isPending}
                  >
                    {t("admin.users.save_password")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================= OBRAS ============================= */

function WorksTab() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: works } = trpc.admin.listWorks.useQuery();
  const { data: images } = trpc.admin.listImages.useQuery();
  const { data: mediaList } = trpc.admin.listMedia.useQuery();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<WorkForm>(emptyWork);
  const [editLang, setEditLang] = useState<Lang>("pt");
  const [translations, setTranslations] = useState<Record<Lang, WorkTranslationForm>>({
    pt: emptyWork,
    en: emptyWork,
    es: emptyWork,
    ar: emptyWork,
  });
  const [variants, setVariants] = useState<WorkVariantForm[]>([]);
  const [priceInput, setPriceInput] = useState("");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const dragId = useRef<number | null>(null);

  useEffect(() => {
    if (works) setOrder(works.map((w) => w.id));
  }, [works]);

  const orderedWorks = order
    .map((id) => works?.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => !!w);

  const invalidate = () => {
    utils.admin.listWorks.invalidate();
    utils.content.works.invalidate();
  };
  const createMut = trpc.admin.createWork.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setNotice(t("admin.works.created")); },
  });
  const updateMut = trpc.admin.updateWork.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setNotice(t("admin.works.updated")); },
  });
  const updateTranslationMut = trpc.admin.updateWorkTranslation.useMutation();
  const deleteMut = trpc.admin.deleteWork.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.works.deleted")); },
  });
  const reorderMut = trpc.admin.reorderWorks.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.works.reordered")); },
  });
  const createVariantMut = trpc.admin.createWorkVariant.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.variants.created")); },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });
  const updateVariantMut = trpc.admin.updateWorkVariant.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.variants.saved")); },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });
  const deleteVariantMut = trpc.admin.deleteWorkVariant.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.variants.deleted")); },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });

  const startEdit = (id: number) => {
    const w = works?.find((x) => x.id === id);
    if (!w) return;
    const n = parseBRL(w.price);
    setPriceInput(n === null ? "" : formatBRL(n));
    setForm({
      slug: w.slug,
      title: w.title,
      category: w.category,
      technique: w.technique,
      status: canonicalStatus(w.status, "available"),
      year: w.year,
      price: w.price,
      isUniquePiece: w.isUniquePiece,
      editionNumber: w.editionNumber,
      editionTotal: w.editionTotal,
      editionLabel: w.editionLabel,
      image: w.image,
      description: w.description ?? "",
      sortOrder: w.sortOrder,
    });
    const baseTranslation = {
      title: w.title,
      category: w.category,
      technique: w.technique,
      description: w.description ?? "",
    };
    setTranslations({
      pt: w.translations?.pt ?? baseTranslation,
      en: w.translations?.en ?? { ...baseTranslation, title: "", technique: "", description: "" },
      es: w.translations?.es ?? { ...baseTranslation, title: "", technique: "", description: "" },
      ar: w.translations?.ar ?? { ...baseTranslation, title: "", technique: "", description: "" },
    });
    setVariants((w.variants ?? []).map((variant) => {
      const baseVariant = {
        name: variant.name,
        description: variant.description,
        dimensions: variant.dimensions,
      };
      return {
        id: variant.id,
        name: variant.name,
        description: variant.description,
        dimensions: variant.dimensions,
        price: Number(variant.price),
        active: variant.active,
        status: canonicalStatus(variant.status, "available"),
        sortOrder: variant.sortOrder,
        translations: {
          pt: variant.translations?.pt ?? baseVariant,
          en: variant.translations?.en ?? { name: "", description: "", dimensions: "" },
          es: variant.translations?.es ?? { name: "", description: "", dimensions: "" },
          ar: variant.translations?.ar ?? { name: "", description: "", dimensions: "" },
        },
      };
    }));
    setEditLang("pt");
    setEditing(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const commitPrice = () => {
    const n = parseBRL(priceInput);
    const price = n === null ? t("admin.works.price_placeholder") : `R$ ${formatBRL(n)}`;
    setPriceInput(n === null ? "" : formatBRL(n));
    setForm((f) => ({ ...f, price }));
  };

  const save = () => {
    const n = parseBRL(priceInput);
    const price = n === null ? t("admin.works.price_placeholder") : `R$ ${formatBRL(n)}`;
    if (!form.title || !form.slug || !form.image) {
      setNotice(t("admin.works.required"));
      return;
    }
    if (!form.isUniquePiece && form.editionNumber !== null && form.editionTotal !== null && form.editionNumber > form.editionTotal) {
      setNotice(t("admin.works.edition_help"));
      return;
    }
    const data = {
      ...form,
      price,
      status: canonicalStatus(form.status, "available"),
      editionNumber: form.isUniquePiece ? null : form.editionNumber,
      editionTotal: form.isUniquePiece ? null : form.editionTotal,
    };
    if (editing === "new") createMut.mutate(data);
    else if (typeof editing === "number") {
      updateMut.mutate({ id: editing, data }, {
        onSuccess: async () => {
          for (const locale of LANGS) {
            const translation = translations[locale];
            if (locale !== "pt" && !translation.title.trim() && !translation.description.trim() && !translation.technique.trim()) continue;
            await updateTranslationMut.mutateAsync({
              id: editing,
              locale,
              data: {
                title: translation.title || form.title,
                category: form.category,
                technique: translation.technique,
                description: translation.description,
              },
            });
          }
        },
      });
    }
  };

  const activeTranslation = translations[editLang] ?? translations.pt;
  const setTranslation = (patch: Partial<WorkTranslationForm>) => {
    setTranslations((current) => ({
      ...current,
      [editLang]: { ...current[editLang], ...patch },
    }));
    if (editLang === "pt") {
      setForm((current) => ({ ...current, ...patch }));
    }
  };

  const addVariant = () => setVariants((current) => [...current, emptyVariant(current.length + 1)]);
  const updateVariant = (index: number, patch: Partial<WorkVariantForm>) => {
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  };
  const updateVariantTranslation = (index: number, patch: Partial<VariantTranslationForm>) => {
    setVariants((current) => current.map((variant, i) => {
      if (i !== index) return variant;
      const translations = {
        ...variant.translations,
        [editLang]: { ...variant.translations[editLang], ...patch },
      };
      const basePatch = editLang === "pt" ? patch : {};
      return { ...variant, ...basePatch, translations };
    }));
  };
  const saveVariant = (variant: WorkVariantForm) => {
    if (typeof editing !== "number") {
      setNotice(t("admin.works.save"));
      return;
    }
    if (!variant.name.trim() || !Number.isFinite(variant.price) || variant.price < 0) {
      setNotice(t("admin.variants.required"));
      return;
    }
    const data = {
      workId: editing,
      name: variant.name.trim(),
      description: variant.description.trim(),
      dimensions: variant.dimensions.trim(),
      price: Number(variant.price),
      active: variant.active,
      status: canonicalStatus(variant.status, "available"),
      sortOrder: Number.isInteger(variant.sortOrder) ? variant.sortOrder : 0,
      translations: {
        ...variant.translations,
        pt: { name: variant.name.trim(), description: variant.description.trim(), dimensions: variant.dimensions.trim() },
      },
    };
    if (variant.id) {
      updateVariantMut.mutate({ id: variant.id, data });
    } else {
      createVariantMut.mutate(data);
    }
  };
  const removeVariant = (index: number, variant: WorkVariantForm) => {
    if (!confirm(t("admin.variants.delete_confirm"))) return;
    if (variant.id) {
      deleteVariantMut.mutate({ id: variant.id });
      return;
    }
    setVariants((current) => current.filter((_, i) => i !== index));
  };

  const onDrop = (targetId: number) => {
    const from = dragId.current;
    if (from === null || from === targetId) return;
    const next = [...order];
    const fromIdx = next.indexOf(from);
    const toIdx = next.indexOf(targetId);
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, from);
    setOrder(next);
    dragId.current = null;
    reorderMut.mutate({ orderedIds: next });
  };

  const imageOptions = [
    ...(mediaList ?? []).map((m) => ({ url: m.url, label: `${isVideo(m.mime) ? "🎬" : "⬆"} ${m.name}` })),
    ...(images ?? []).map((i) => ({ url: i, label: i })),
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[var(--c-ink)]/70">
          {text(t, "admin.works.count", { count: works?.length ?? 0 })}
        </p>
        <Button onClick={() => { setForm(emptyWork); setVariants([]); setPriceInput(""); setEditing("new"); }}>{t("admin.works.new")}</Button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">
          {notice}
        </div>
      )}

      {editing !== null && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 font-bold">{editing === "new" ? t("admin.works.new_title") : t("admin.works.edit_title")}</h2>
          {editing !== "new" && (
            <div className="mb-5 flex flex-wrap gap-2">
              {LANGS.map((locale) => (
                <Button
                  key={locale}
                  type="button"
                  size="sm"
                  variant={editLang === locale ? "default" : "outline"}
                  onClick={() => setEditLang(locale)}
                >
                  {formatLanguageLabel(locale)}
                </Button>
              ))}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.works.title")}</label>
              <Input
                value={editing === "new" ? form.title : activeTranslation.title}
                onChange={(e) => editing === "new" ? setForm({ ...form, title: e.target.value }) : setTranslation({ title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.works.slug")}</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.works.category")}</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c, t)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.works.price")}</label>
              <div className="flex items-center rounded-md border bg-white px-3 focus-within:border-[var(--c-primary)]">
                <span className="text-sm font-semibold text-[var(--c-ink)]/50">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value.replace(/[^\d.,]/g, ""))}
                  onBlur={commitPrice}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitPrice();
                    }
                  }}
                  placeholder={t("admin.works.price_placeholder")}
                  className="w-full bg-transparent px-2 py-2 text-sm font-semibold outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--c-ink)]/45">
                {t("admin.works.price_help")}
              </p>
            </div>
            <div className="md:col-span-2 rounded-lg border border-[var(--c-ink)]/10 bg-[var(--c-sand)]/45 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold">{t("admin.works.edition")}</h3>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.isUniquePiece}
                    onChange={(e) => setForm({
                      ...form,
                      isUniquePiece: e.target.checked,
                      editionNumber: e.target.checked ? null : form.editionNumber,
                      editionTotal: e.target.checked ? null : form.editionTotal,
                    })}
                  />
                  {t("admin.works.unique_piece")}
                </label>
              </div>
              {!form.isUniquePiece && (
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold uppercase">{t("admin.works.edition_number")}</label>
                    <Input
                      type="number"
                      min={1}
                      value={form.editionNumber ?? ""}
                      onChange={(e) => setForm({ ...form, editionNumber: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase">{t("admin.works.edition_total")}</label>
                    <Input
                      type="number"
                      min={1}
                      value={form.editionTotal ?? ""}
                      onChange={(e) => setForm({ ...form, editionTotal: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase">{t("admin.works.edition_label")}</label>
                    <Input
                      value={form.editionLabel}
                      onChange={(e) => setForm({ ...form, editionLabel: e.target.value })}
                      placeholder="03/10"
                    />
                  </div>
                </div>
              )}
              <p className="mt-2 text-[11px] text-[var(--c-ink)]/50">{t("admin.works.edition_help")}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.works.technique")}</label>
              <Input
                value={editing === "new" ? form.technique : activeTranslation.technique}
                onChange={(e) => editing === "new" ? setForm({ ...form, technique: e.target.value }) : setTranslation({ technique: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold uppercase">{t("admin.works.year")}</label>
                <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">{t("admin.works.order")}</label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.works.status")}</label>
              <div className="mt-1 flex gap-2">
                {WORK_STATUSES.map((s) => {
                  const active = canonicalStatus(form.status, "available") === s;
                  const isSold = s === "sold";
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                        active
                          ? isSold
                            ? "border-[var(--c-primary)] bg-[var(--c-primary)] text-white"
                            : "border-[var(--c-dark)] bg-[var(--c-dark)] text-[var(--c-bg)]"
                          : "border-[var(--c-ink)]/20 text-[var(--c-ink)]/55 hover:border-[var(--c-dark)]"
                      }`}
                    >
                      {t(`status.${s}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase">{t("admin.works.image")}</label>
              <DeviceImagePicker
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
              <div className="mt-3 flex items-center gap-3">
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                >
                  <option value="">{t("admin.works.library_option")}</option>
                  {form.image && !imageOptions.some((o) => o.url === form.image) && (
                    <option value={form.image}>{form.image}</option>
                  )}
                  {imageOptions.map((o) => (
                    <option key={o.url} value={o.url}>{o.label}</option>
                  ))}
                </select>
                {form.image && !isVideo(form.image) && (
                  <img src={form.image} alt="" className="h-14 w-20 rounded object-cover" />
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase">{t("admin.works.description")}</label>
              <Textarea
                rows={6}
                value={editing === "new" ? form.description : activeTranslation.description}
                onChange={(e) => editing === "new" ? setForm({ ...form, description: e.target.value }) : setTranslation({ description: e.target.value })}
              />
            </div>
          </div>
          {editing !== "new" && (
            <div className="mt-6 rounded-xl border border-[var(--c-ink)]/10 bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">{t("admin.variants.title")}</h3>
                  <p className="mt-1 text-xs text-[var(--c-ink)]/55">{t("admin.variants.empty")}</p>
                </div>
                <Button type="button" variant="outline" onClick={addVariant}>{t("admin.variants.add")}</Button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => {
                  const activeVariantTranslation = variant.translations[editLang] ?? variant.translations.pt;
                  return (
                    <div key={variant.id ?? `new-${index}`} className="rounded-lg border border-[var(--c-ink)]/12 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="font-bold">{variant.name || t("admin.variants.name")}</div>
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={variant.active}
                            onChange={(e) => updateVariant(index, { active: e.target.checked })}
                          />
                          {t("admin.variants.active")}
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-bold uppercase">{t("admin.variants.name")}</label>
                          <Input
                            value={editLang === "pt" ? variant.name : activeVariantTranslation.name}
                            onChange={(e) => updateVariantTranslation(index, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase">{t("admin.variants.description")}</label>
                          <Input
                            value={editLang === "pt" ? variant.description : activeVariantTranslation.description}
                            onChange={(e) => updateVariantTranslation(index, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase">{t("admin.variants.dimensions")}</label>
                          <Input
                            value={editLang === "pt" ? variant.dimensions : activeVariantTranslation.dimensions}
                            onChange={(e) => updateVariantTranslation(index, { dimensions: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-bold uppercase">{t("admin.variants.price")}</label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase">{t("admin.variants.order")}</label>
                            <Input
                              type="number"
                              value={variant.sortOrder}
                              onChange={(e) => updateVariant(index, { sortOrder: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase">{t("admin.variants.status")}</label>
                          <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={canonicalStatus(variant.status, "available")}
                            onChange={(e) => updateVariant(index, { status: e.target.value })}
                          >
                            {WORK_STATUSES.map((status) => (
                              <option key={status} value={status}>{t(`status.${status}`)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveVariant(variant)}
                          disabled={createVariantMut.isPending || updateVariantMut.isPending}
                        >
                          {t("admin.variants.save")}
                        </Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => removeVariant(index, variant)}>
                          {t("admin.delete")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={createMut.isPending || updateMut.isPending}>{t("admin.works.save")}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t("admin.cancel")}</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {orderedWorks.map((w) => (
          <div
            key={w.id}
            draggable
            onDragStart={() => { dragId.current = w.id; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(w.id)}
            className="flex cursor-grab items-center gap-4 rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing"
            title={t("admin.works.drag")}
          >
            <span className="text-lg text-[var(--c-ink)]/30">⠿</span>
            <img src={w.image} alt="" className="h-16 w-24 rounded object-cover" />
            <div className="flex-1">
              <div className="font-bold">{w.title}</div>
              <div className="text-xs text-[var(--c-ink)]/60">
                {categoryLabel(w.category, t)} · {w.year} · <span className="font-bold text-[var(--c-primary)]">{w.price}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => startEdit(w.id)}>{t("admin.edit")}</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm(text(t, "admin.works.delete_confirm", { title: w.title }))) deleteMut.mutate({ id: w.id });
              }}
            >
              {t("admin.delete")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SELETOR DE IMAGEM POR DISPOSITIVO ================= */

function isMobileDevice(): boolean {
  const ua = navigator.userAgent || "";
  const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  // iPadOS recente se apresenta como Mac, mas tem tela de toque
  const touchMac = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  const narrowScreen = window.matchMedia?.("(max-width: 768px)").matches ?? false;
  return uaMobile || touchMac || (narrowScreen && navigator.maxTouchPoints > 0);
}

function DeviceImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mobile = useMemo(() => isMobileDevice(), []);

  const upload = trpc.admin.uploadMedia.useMutation({
    onSuccess: (res) => {
      onChange(res.url);
      utils.admin.listMedia.invalidate();
      setBusy(false);
    },
    onError: () => {
      setError(t("admin.generic_error"));
      setBusy(false);
    },
  });

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\//i.test(f.type)) {
      setError(t("admin.upload.image_file_error"));
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError(t("admin.upload.image_size_error"));
      return;
    }
    setError("");
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      upload.mutate({
        name: f.name,
        mime: f.type,
        dataBase64: dataUrl.split(",")[1] ?? "",
      });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--c-ink)]/25 bg-white px-4 py-5 text-sm font-medium transition hover:border-[var(--c-primary)] disabled:opacity-60"
      >
        <span className="text-lg">{mobile ? "🖼️" : "📁"}</span>
        {busy
          ? t("admin.upload.uploading_image")
          : mobile
            ? t("admin.upload.mobile_pick")
            : t("admin.upload.desktop_pick")}
      </button>
      <p className="mt-1 text-[11px] text-[var(--c-ink)]/45">
        {mobile
          ? t("admin.upload.mobile_help")
          : t("admin.upload.desktop_help")}
      </p>
      {error && <p className="mt-1 text-xs text-[var(--c-primary)]">{error}</p>}
      {value && (
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-[var(--c-sand)] p-2">
          {isVideo(value) ? (
            <video src={value} className="h-14 w-20 rounded object-cover" />
          ) : (
            <img src={value} alt="" className="h-14 w-20 rounded object-cover" />
          )}
          <span className="truncate font-mono text-[11px] text-[var(--c-ink)]/60">{value}</span>
        </div>
      )}
    </div>
  );
}

/* ============================= IMAGENS ============================= */

const MEDIA_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/avif,image/bmp,image/x-icon,video/mp4,video/webm,video/ogg,video/quicktime";
const MEDIA_REGEX = /^(image\/(jpeg|jpg|png|gif|webp|svg\+xml|avif|bmp|x-icon|vnd\.microsoft\.icon)|video\/(mp4|webm|ogg|quicktime))$/i;

function isVideo(mime: string) {
  return /^video\//i.test(mime);
}

function formatFileSize(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

function ImagesTab() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: mediaList } = trpc.admin.listMedia.useQuery();
  const [preview, setPreview] = useState<{ name: string; url: string; mime: string; size: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [renaming, setRenaming] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  const invalidate = () => utils.admin.listMedia.invalidate();

  const uploadMut = trpc.admin.uploadMedia.useMutation({
    onSuccess: () => {
      invalidate();
      setPreview(null);
      setFile(null);
      setNotice(t("admin.media.sent"));
    },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });
  const deleteMut = trpc.admin.deleteMedia.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.media.deleted")); },
  });
  const renameMut = trpc.admin.renameMedia.useMutation({
    onSuccess: () => { invalidate(); setRenaming(null); setNotice(t("admin.media.renamed")); },
  });

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!MEDIA_REGEX.test(f.type)) {
      setNotice(t("admin.media.unsupported"));
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setNotice(t("admin.media.too_large"));
      return;
    }
    setFile(f);
    setNotice("");
    const reader = new FileReader();
    reader.onload = () => setPreview({ name: f.name, url: String(reader.result), mime: f.type, size: f.size });
    reader.readAsDataURL(f);
  };

  const upload = () => {
    if (!file || !preview) return;
    const base64 = preview.url.split(",")[1] ?? "";
    uploadMut.mutate({ name: file.name, mime: file.type, dataBase64: base64 });
  };

  return (
    <div className="space-y-8">
      {notice && (
        <div className="rounded-lg border border-[var(--c-ink)]/15 bg-white px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-bold">{t("admin.media.title")}</h2>
        <p className="mb-4 text-xs text-[var(--c-ink)]/55">
          {t("admin.media.help")}
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--c-ink)]/20 px-6 py-10 text-center transition hover:border-[var(--c-primary)]">
          <input
            type="file"
            accept={MEDIA_ACCEPT}
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <span className="text-sm font-medium">{t("admin.media.pick")}</span>
          <span className="mt-1 text-xs text-[var(--c-ink)]/45">
            JPG · PNG · GIF · WebP · SVG · AVIF · MP4 · WebM · MOV
          </span>
        </label>

        {preview && (
          <div className="mt-5 flex flex-wrap items-center gap-5 rounded-lg bg-[var(--c-sand)] p-4">
            {isVideo(preview.mime) ? (
              <video src={preview.url} controls className="max-h-40 rounded" />
            ) : (
              <img src={preview.url} alt={t("admin.media.preview_alt")} className="max-h-40 rounded object-contain" />
            )}
            <div className="flex-1 text-sm">
              <div className="font-bold">{preview.name}</div>
              <div className="text-xs text-[var(--c-ink)]/55">
                {preview.mime} · {formatFileSize(preview.size)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={upload} disabled={uploadMut.isPending}>
                {uploadMut.isPending ? t("admin.media.uploading") : t("admin.media.confirm")}
              </Button>
              <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>
                {t("admin.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 font-bold">{text(t, "admin.media.sent_list", { count: mediaList?.length ?? 0 })}</h2>
        {(!mediaList || mediaList.length === 0) && (
          <p className="text-sm text-[var(--c-ink)]/55">{t("admin.media.empty")}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mediaList?.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              {isVideo(m.mime) ? (
                <video src={m.url} controls preload="metadata" className="h-44 w-full bg-black object-cover" />
              ) : (
                <img src={m.url} alt={m.name} className="h-44 w-full bg-[var(--c-sand2)] object-cover" />
              )}
              <div className="p-3">
                {renaming === m.id ? (
                  <div className="flex gap-2">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Button size="sm" onClick={() => renameMut.mutate({ id: m.id, name: newName })}>
                      OK
                    </Button>
                  </div>
                ) : (
                  <div className="truncate text-sm font-bold" title={m.name}>{m.name}</div>
                )}
                <div className="mt-0.5 text-xs text-[var(--c-ink)]/50">
                  {m.mime} · {formatFileSize(m.size)}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${m.url}`);
                      setNotice(t("admin.media.copied"));
                    }}
                  >
                    {t("admin.media.copy_url")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRenaming(m.id); setNewName(m.name); }}
                  >
                    {t("admin.media.rename")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(text(t, "admin.media.delete_confirm", { name: m.name }))) deleteMut.mutate({ id: m.id });
                    }}
                  >
                    {t("admin.delete")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================= TEXTOS ============================= */

function TextsTab() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: texts } = trpc.admin.listTexts.useQuery();
  const update = trpc.admin.updateTextTranslation.useMutation({
    onSuccess: () => {
      utils.admin.listTexts.invalidate();
      utils.content.texts.invalidate();
    },
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [editLang, setEditLang] = useState<Lang>("pt");
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    if (texts) {
      const v: Record<string, string> = {};
      for (const item of texts) v[item.key] = item.translations?.[editLang] ?? (editLang === "pt" ? item.value : "");
      setValues(v);
    }
  }, [texts, editLang]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--c-ink)]/65">
        {t("admin.texts.help")}
      </p>
      <div className="flex flex-wrap gap-2">
        {LANGS.map((locale) => (
          <Button
            key={locale}
            type="button"
            size="sm"
            variant={editLang === locale ? "default" : "outline"}
            onClick={() => setEditLang(locale)}
          >
            {formatLanguageLabel(locale)}
          </Button>
        ))}
      </div>
      {texts?.map((item) => (
        <div key={item.key} className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-bold">{item.label}</label>
          <Textarea
            rows={item.value.length > 200 ? 6 : 2}
            value={values[item.key] ?? ""}
            onChange={(e) => setValues({ ...values, [item.key]: e.target.value })}
          />
          <div className="mt-2 flex items-center gap-3">
            <Button
              size="sm"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { key: item.key, locale: editLang, value: values[item.key] ?? "" },
                  { onSuccess: () => setSavedKey(item.key) },
                )
              }
            >
              {t("admin.texts.save")}
            </Button>
            {savedKey === item.key && <span className="text-xs text-green-700">{t("admin.saved")}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================= DESIGN ============================= */

function DesignTab() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: settingsList } = trpc.admin.listSettings.useQuery();
  const save = trpc.admin.updateSetting.useMutation();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (settingsList) {
      const v: Record<string, string> = {};
      for (const s of settingsList) v[s.key] = s.value;
      setVals(v);
    }
  }, [settingsList]);

  // Live preview: apply as you change
  useEffect(() => {
    applyTheme(vals);
  }, [vals]);

  const set = (key: string, value: string) => setVals((v) => ({ ...v, [key]: value }));

  const saveAll = async () => {
    for (const [key, value] of Object.entries(vals)) {
      await save.mutateAsync({ key, value });
    }
    utils.admin.listSettings.invalidate();
    utils.content.settings.invalidate();
    setNotice(t("admin.design.saved"));
  };

  const baseSize = Number(vals["design.baseSize"] ?? "100");

  return (
    <div className="space-y-8">
      {notice && (
        <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">
          {notice}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold">{t("admin.design.fonts")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase">{t("admin.design.title_font")}</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={vals["design.fontDisplay"] ?? "Cormorant Garamond"}
              onChange={(e) => set("design.fontDisplay", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">{t("admin.design.body_font")}</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={vals["design.fontBody"] ?? "Inter"}
              onChange={(e) => set("design.fontBody", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">
              {text(t, "admin.design.base_size", { value: baseSize })}
            </label>
            <input
              type="range"
              min={85}
              max={120}
              step={1}
              value={baseSize}
              onChange={(e) => set("design.baseSize", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap items-end gap-5 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(vals["design.headingsBold"] ?? "1") !== "0"}
                onChange={(e) => set("design.headingsBold", e.target.checked ? "1" : "0")}
              />
              <span>{t("admin.design.headings_bold")}</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(vals["design.headingsItalic"] ?? "0") === "1"}
                onChange={(e) => set("design.headingsItalic", e.target.checked ? "1" : "0")}
              />
              <span>{t("admin.design.headings_italic")}</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(vals["design.bodyBold"] ?? "0") === "1"}
                onChange={(e) => set("design.bodyBold", e.target.checked ? "1" : "0")}
              />
              <span>{t("admin.design.body_bold")}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold">{t("admin.design.colors")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_FIELDS.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <input
                type="color"
                value={vals[c.key] ?? c.def}
                onChange={(e) => set(c.key, e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <div>
                <div className="text-sm font-medium">{t(c.labelKey)}</div>
                <div className="font-mono text-xs text-[var(--c-ink)]/50">
                  {vals[c.key] ?? c.def}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--c-primary)]/30 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold">{t("admin.design.preview")}</h2>
        <div className="rounded-lg bg-[var(--c-bg)] p-6">
          <div className="eyebrow text-[var(--c-primary)]">{t("admin.design.preview_label")}</div>
          <h3 className="mt-2 text-3xl">{t("admin.design.preview_title")}</h3>
          <p className="mt-2 leading-relaxed">
            {t("admin.design.preview_text")}
          </p>
          <span className="mt-3 inline-block bg-[var(--c-primary)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
            {t("admin.design.preview_button")}
          </span>
        </div>
      </div>

      <Button size="lg" onClick={saveAll} disabled={save.isPending}>
        {save.isPending ? t("admin.saving") : t("admin.design.save")}
      </Button>
    </div>
  );
}

/* ============================= SEÇÕES ============================= */

function SectionsTab() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: settingsList } = trpc.admin.listSettings.useQuery();
  const save = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      utils.admin.listSettings.invalidate();
      utils.content.settings.invalidate();
    },
  });
  const [savedKey, setSavedKey] = useState("");

  const value = (key: string) =>
    settingsList?.find((s) => s.key === key)?.value ?? "1";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--c-ink)]/65">
        {t("admin.sections.help")}
      </p>
      {SECTIONS.map((s) => {
        const on = value(s.key) !== "0";
        return (
          <div key={s.key} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <div className="font-bold">{t(s.labelKey)}</div>
              <div className="text-xs text-[var(--c-ink)]/50">{on ? t("admin.visible") : t("admin.hidden")}</div>
            </div>
            <div className="flex items-center gap-3">
              {savedKey === s.key && <span className="text-xs text-green-700">{t("admin.saved")}</span>}
              <Button
                size="sm"
                variant={on ? "destructive" : "default"}
                disabled={save.isPending}
                onClick={() =>
                  save.mutate(
                    { key: s.key, value: on ? "0" : "1" },
                    { onSuccess: () => setSavedKey(s.key) },
                  )
                }
              >
                {on ? t("admin.hide") : t("admin.show")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ========================= CUPOM / PROMOÇÕES ========================= */

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-16 shrink-0 rounded-full transition ${
        on ? "bg-[var(--c-accent)]" : "bg-[var(--c-ink)]/25"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
          on ? "left-9" : "left-1"
        }`}
      />
    </button>
  );
}

function useSettingsState() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: settingsList } = trpc.admin.listSettings.useQuery();
  const save = trpc.admin.updateSettings.useMutation();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (settingsList) {
      const next: Record<string, string> = {};
      for (const setting of settingsList) next[setting.key] = setting.value;
      setVals(next);
    }
  }, [settingsList]);

  const set = (key: string, value: string) => setVals((current) => ({ ...current, [key]: value }));

  const saveKeys = async (keys: string[], message: string, overrides: Record<string, string> = {}) => {
    try {
      const values = Object.fromEntries(keys.map((key) => [key, overrides[key] ?? vals[key] ?? ""]));
      await save.mutateAsync({ values });
      utils.admin.listSettings.invalidate();
      utils.content.settings.invalidate();
      setNotice(message);
      window.setTimeout(() => setNotice(""), 2500);
    } catch (error) {
      setNotice(`${t("admin.error")}: ${t("admin.settings.save_error")}`);
      window.setTimeout(() => setNotice(""), 4000);
      throw error;
    }
  };

  return { vals, set, saveKeys, notice, saving: save.isPending };
}

function CouponTab() {
  const { vals, set, saveKeys, notice, saving } = useSettingsState();
  const { t } = useLang();
  const utils = trpc.useUtils();
  const { data: works } = trpc.admin.listWorks.useQuery();
  const couponMut = trpc.admin.setWorkCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listWorks.invalidate();
      utils.content.works.invalidate();
      utils.content.workBySlug.invalidate();
    },
  });

  const enabled = (vals["coupon.enabled"] ?? "0") === "1";
  const noticeIsError = notice.startsWith(`${t("admin.error")}:`);

  const handleSaveCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveKeys(
      ["coupon.enabled", "coupon.name", "coupon.percent", "coupon.start", "coupon.end"],
      t("admin.coupon.saved"),
    ).catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveCoupon} className="rounded-xl border-2 border-[var(--c-accent)]/60 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-bold">{t("admin.coupon.title")}</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
              {t("admin.coupon.help")}
            </p>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-[var(--c-ink)]/10 px-3 py-2 text-sm font-semibold">
            <Toggle on={enabled} onChange={(value) => set("coupon.enabled", value ? "1" : "0")} />
            {t("admin.coupon.enable")}
          </label>
        </div>

        <div className="mt-5 space-y-4 border-t border-[var(--c-ink)]/10 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.coupon.name")}</label>
              <Input
                value={vals["coupon.name"] ?? ""}
                onChange={(event) => set("coupon.name", event.target.value)}
                placeholder={t("admin.coupon.name_placeholder")}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.coupon.percent")}</label>
              <div className="flex items-center rounded-md border bg-white px-3 focus-within:border-[var(--c-primary)]">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={vals["coupon.percent"] ?? ""}
                  onChange={(event) => set("coupon.percent", event.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="10"
                  className="border-0 px-0 focus-visible:ring-0"
                />
                <span className="text-sm font-bold text-[var(--c-ink)]/55">%</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.coupon.start")}</label>
              <input
                type="date"
                value={vals["coupon.start"] ?? ""}
                onChange={(event) => set("coupon.start", event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.coupon.end")}</label>
              <input
                type="date"
                value={vals["coupon.end"] ?? ""}
                onChange={(event) => set("coupon.end", event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--c-accent)]/50 p-3 text-xs text-[var(--c-ink)]/65">
            🎟️ <strong>{t("admin.coupon.preview")}</strong> {enabled ? vals["coupon.name"] || t("admin.coupon.default") : t("admin.coupon.disabled")}
            {enabled && vals["coupon.percent"] ? ` — ${text(t, "admin.coupon.discount", { percent: vals["coupon.percent"] })}` : ""}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" type="submit" disabled={saving}>
            {saving ? t("admin.saving") : t("admin.coupon.save")}
          </Button>
          {notice && <span className={`text-xs ${noticeIsError ? "text-red-700" : "text-green-700"}`}>{notice}</span>}
        </div>
      </form>

      {enabled && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--c-ink)]/65">
            {t("admin.coupon.choose_works")}
          </p>
          <div className="grid gap-3">
            {works?.map((work) => {
              const active = !!work.couponEnabled;
              return (
                <div key={work.id} className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm">
                  <img src={work.image} alt="" className="h-14 w-20 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{work.title}</div>
                    <div className="text-xs text-[var(--c-ink)]/55">
                      {categoryLabel(work.category, t)} · <span className="font-semibold text-[var(--c-primary)]">{work.price}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-green-700" : "text-[var(--c-ink)]/40"}`}>
                    {active ? t("admin.coupon.visible") : t("admin.coupon.hidden")}
                  </span>
                  <Button
                    size="sm"
                    variant={active ? "destructive" : "default"}
                    disabled={couponMut.isPending}
                    onClick={() => couponMut.mutate({ id: work.id, enabled: !active })}
                  >
                    {active ? t("admin.hide") : t("admin.show")}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PromocoesTab() {
  const { vals, set, saveKeys, notice, saving } = useSettingsState();
  const { t } = useLang();
  const readingOn = (vals["prize.reading"] ?? "0") === "1";
  const workOn = (vals["prize.work"] ?? "0") === "1";
  const linkOn = (vals["prize.reading.link"] ?? "0") === "1";
  const [minimumInput, setMinimumInput] = useState("");
  const noticeIsError = notice.startsWith(`${t("admin.error")}:`);

  useEffect(() => {
    const amount = Number(vals["promotion.minimumAmount"] ?? "7000");
    if (Number.isFinite(amount) && amount > 0) {
      setMinimumInput(`R$ ${formatBRL(amount)}`);
    }
  }, [vals["promotion.minimumAmount"]]);

  const handleSavePromotions = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseBRL(minimumInput);
    if (amount === null || amount <= 0) {
      await saveKeys(
        ["promotion.minimumAmount", "prize.reading", "prize.work", "prize.reading.link"],
        t("admin.promotions.saved"),
        { "promotion.minimumAmount": "0" },
      ).catch(() => undefined);
      return;
    }
    const normalizedAmount = String(amount);
    set("promotion.minimumAmount", normalizedAmount);
    await saveKeys(
      ["promotion.minimumAmount", "prize.reading", "prize.work", "prize.reading.link"],
      t("admin.promotions.saved"),
      { "promotion.minimumAmount": normalizedAmount },
    ).catch(() => undefined);
    setMinimumInput(`R$ ${formatBRL(amount)}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSavePromotions} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">{t("admin.promotions.title")}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
          {t("admin.promotions.help_prefix")} <strong>{minimumInput || "R$ 7.000,00"}</strong>, {t("admin.promotions.help_suffix")}
        </p>

        <div className="mt-5 max-w-xs">
          <label className="text-xs font-bold uppercase">{t("admin.promotions.minimum")}</label>
          <Input
            inputMode="decimal"
            value={minimumInput}
            onChange={(event) => setMinimumInput(event.target.value)}
            onBlur={() => {
              const amount = parseBRL(minimumInput);
              if (amount !== null) setMinimumInput(`R$ ${formatBRL(amount)}`);
            }}
            placeholder="R$ 7.000,00"
          />
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-lg border border-[var(--c-ink)]/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">{t("admin.promotions.reading")}</div>
                <div className="text-xs text-[var(--c-ink)]/55">
                  {readingOn ? t("admin.promotions.active") : t("admin.promotions.inactive")}
                </div>
              </div>
              <Toggle on={readingOn} onChange={(value) => set("prize.reading", value ? "1" : "0")} />
            </div>
            {readingOn && (
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-[var(--c-ink)]/10 pt-3">
                <div>
                  <div className="text-xs font-semibold">{t("admin.promotions.reading_link")}</div>
                  <div className="text-[11px] text-[var(--c-ink)]/55">
                    {linkOn
                      ? t("admin.promotions.link_visible")
                      : t("admin.promotions.link_hidden")}
                  </div>
                </div>
                <Toggle on={linkOn} onChange={(value) => set("prize.reading.link", value ? "1" : "0")} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--c-ink)]/10 p-4">
            <div>
              <div className="text-sm font-semibold">{t("admin.promotions.work")}</div>
              <div className="text-xs text-[var(--c-ink)]/55">
                {workOn ? t("admin.promotions.active") : t("admin.promotions.inactive")}
              </div>
            </div>
            <Toggle on={workOn} onChange={(value) => set("prize.work", value ? "1" : "0")} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" type="submit" disabled={saving}>
            {saving ? t("admin.saving") : t("admin.promotions.save")}
          </Button>
          {notice && <span className={`text-xs ${noticeIsError ? "text-red-700" : "text-green-700"}`}>{notice}</span>}
        </div>
      </form>
    </div>
  );
}

function EntregaTab() {
  const { vals, set, saveKeys, notice, saving } = useSettingsState();
  const { t } = useLang();
  const enabled = (vals["shipping.enabled"] ?? "1") === "1";
  const noteOn = (vals["shipping.note"] ?? "1") === "1";
  const intlOn = (vals["shipping.international"] ?? "0") === "1";

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">{t("admin.shipping.title")}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
          {t("admin.shipping.help")}
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--c-ink)]/10 p-4">
            <div>
              <div className="text-sm font-semibold">{t("admin.shipping.brazil")}</div>
              <div className="text-xs text-[var(--c-ink)]/55">
                {enabled ? t("admin.shipping.active") : t("admin.shipping.hidden")}
              </div>
            </div>
            <Toggle on={enabled} onChange={(value) => set("shipping.enabled", value ? "1" : "0")} />
          </div>

          {enabled && (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--c-ink)]/10 p-4">
              <div>
                <div className="text-sm font-semibold">{t("admin.shipping.buyer_pays")}</div>
                <div className="text-xs text-[var(--c-ink)]/55">
                  <em>{t("admin.shipping.note")}</em>
                </div>
              </div>
              <Toggle on={noteOn} onChange={(value) => set("shipping.note", value ? "1" : "0")} />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--c-ink)]/10 p-4">
            <div>
              <div className="text-sm font-semibold">{t("admin.shipping.international")}</div>
              <div className="text-xs text-[var(--c-ink)]/55">
                {intlOn ? t("admin.shipping.international_visible") : t("admin.shipping.international_hidden")}
              </div>
            </div>
            <Toggle on={intlOn} onChange={(value) => set("shipping.international", value ? "1" : "0")} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            size="sm"
            disabled={saving}
            onClick={() => saveKeys(["shipping.enabled", "shipping.note", "shipping.international"], t("admin.shipping.saved"))}
          >
            {saving ? t("admin.saving") : t("admin.shipping.save")}
          </Button>
          {notice && <span className="text-xs text-green-700">{notice}</span>}
        </div>
      </div>
    </div>
  );
}

function ContactTab() {
  const { vals, set, saveKeys, notice, saving } = useSettingsState();
  const { t } = useLang();
  const [whatsappInput, setWhatsAppInput] = useState("");
  const noticeIsError = notice.startsWith(`${t("admin.error")}:`);

  useEffect(() => {
    setWhatsAppInput(formatWhatsAppNumber(vals["contact.whatsapp"] ?? ""));
  }, [vals["contact.whatsapp"]]);

  const handleSaveContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeWhatsAppNumber(whatsappInput);
    set("contact.whatsapp", normalized);
    await saveKeys(["contact.whatsapp"], t("admin.contact.saved"), { "contact.whatsapp": normalized })
      .then(() => setWhatsAppInput(formatWhatsAppNumber(normalized)))
      .catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveContact} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">{t("admin.contact.title")}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
          {t("admin.contact.help")}
        </p>

        <div className="mt-5 max-w-sm">
          <label className="text-xs font-bold uppercase">{t("admin.contact.whatsapp")}</label>
          <Input
            inputMode="tel"
            autoComplete="tel"
            value={whatsappInput}
            onChange={(event) => setWhatsAppInput(event.target.value)}
            onBlur={() => setWhatsAppInput(formatWhatsAppNumber(whatsappInput))}
            placeholder={t("admin.contact.whatsapp_placeholder")}
          />
          <p className="mt-2 text-xs text-[var(--c-ink)]/50">
            {t("admin.contact.format_help")}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" type="submit" disabled={saving}>
            {saving ? t("admin.saving") : t("admin.contact.save")}
          </Button>
          {notice && <span className={`text-xs ${noticeIsError ? "text-red-700" : "text-green-700"}`}>{notice}</span>}
        </div>
      </form>
    </div>
  );
}

function IdiomasTab() {
  const { vals, set, saveKeys, notice, saving } = useSettingsState();
  const { t } = useLang();
  const languages = [
    { key: "lang.en", lang: "en" as Lang, descKey: "admin.languages.en_desc" },
    { key: "lang.es", lang: "es" as Lang, descKey: "admin.languages.es_desc" },
    { key: "lang.ar", lang: "ar" as Lang, descKey: "admin.languages.ar_desc" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">{t("admin.languages.title")}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
          {t("admin.languages.help")}
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--c-primary)]/30 bg-[var(--c-sand)]/60 p-4">
            <div>
              <div className="text-sm font-semibold">{t("admin.languages.pt")}</div>
              <div className="text-xs text-[var(--c-ink)]/55">{t("admin.languages.pt_desc")}</div>
            </div>
            <span className="rounded-full bg-[var(--c-primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              {t("admin.status_fixed")}
            </span>
          </div>

          {languages.map((language) => {
            const on = (vals[language.key] ?? "1") === "1";
            return (
              <div key={language.key} className="flex items-center justify-between gap-4 rounded-lg border border-[var(--c-ink)]/10 p-4">
                <div>
                  <div className="text-sm font-semibold">
                    {formatLanguageLabel(language.lang)}
                  </div>
                  <div className="text-xs text-[var(--c-ink)]/55">
                    {on ? t(language.descKey) : t("admin.languages.hidden")}
                  </div>
                </div>
                <Toggle on={on} onChange={(value) => set(language.key, value ? "1" : "0")} />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            size="sm"
            disabled={saving}
            onClick={() => saveKeys(languages.map((language) => language.key), t("admin.languages.saved"))}
          >
            {saving ? t("admin.saving") : t("admin.languages.save")}
          </Button>
          {notice && <span className="text-xs text-green-700">{notice}</span>}
        </div>
      </div>
    </div>
  );
}

/* ============================= ESPAÇO DE CAFÉ ============================= */

const DRAFT_TYPES = [
  { id: "text", labelKey: "admin.cafe.text", icon: "✏️" },
  { id: "image", labelKey: "admin.cafe.photo", icon: "🖼️" },
  { id: "video", labelKey: "admin.cafe.video", icon: "🎬" },
] as const;

type DraftType = (typeof DRAFT_TYPES)[number]["id"];

function CafeTab() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: status } = trpc.cafe.status.useQuery();
  const enabled = status?.enabled ?? false;

  const toggleMut = trpc.cafe.toggle.useMutation({
    onSuccess: () => {
      utils.cafe.status.invalidate();
      utils.cafe.list.invalidate();
      utils.cafe.public.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      {/* Toggle de ativação */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 p-5 shadow-sm transition ${
          enabled ? "border-[var(--c-accent)] bg-[#fff8ec]" : "border-[var(--c-ink)]/15 bg-white"
        }`}
      >
        <div>
          <h2 className="font-bold">
            {text(t, "admin.cafe.title", { status: enabled ? t("admin.cafe.enabled") : t("admin.cafe.disabled") })}
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
            {t("admin.cafe.help")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={toggleMut.isPending}
          onClick={() => toggleMut.mutate({ enabled: !enabled })}
          className={`relative h-8 w-16 shrink-0 rounded-full transition ${
            enabled ? "bg-[var(--c-accent)]" : "bg-[var(--c-ink)]/25"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
              enabled ? "left-9" : "left-1"
            }`}
          />
        </button>
      </div>

      {!enabled ? (
        <div className="rounded-xl border border-dashed border-[var(--c-ink)]/25 bg-white/60 p-14 text-center">
          <div className="text-4xl">🔒</div>
          <h3 className="mt-3 font-display text-xl font-semibold">{t("admin.cafe.closed")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--c-ink)]/55">
            {t("admin.cafe.closed_help")}
          </p>
        </div>
      ) : (
        <CafeContent />
      )}
    </div>
  );
}

function CafeContent() {
  const utils = trpc.useUtils();
  const { t } = useLang();
  const { data: drafts, error } = trpc.cafe.list.useQuery();
  const { data: mediaList } = trpc.admin.listMedia.useQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [type, setType] = useState<DraftType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; mime: string; size: number } | null>(null);
  const [editLang, setEditLang] = useState<Lang>("pt");
  const [draftTranslations, setDraftTranslations] = useState<Record<Lang, { title: string; content: string; description: string }>>({
    pt: { title: "", content: "", description: "" },
    en: { title: "", content: "", description: "" },
    es: { title: "", content: "", description: "" },
    ar: { title: "", content: "", description: "" },
  });

  const invalidate = () => {
    utils.cafe.list.invalidate();
    utils.cafe.public.invalidate();
  };
  const invalidateMedia = () => utils.admin.listMedia.invalidate();
  const uploadMut = trpc.admin.uploadMedia.useMutation({
    onSuccess: (res) => {
      setContent(res.url);
      invalidateMedia();
      setNotice(t("admin.cafe.uploaded"));
    },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.cafe.upload_failed")}`),
  });
  const createMut = trpc.cafe.create.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setUploadedFile(null); setNotice(t("admin.cafe.created")); },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });
  const updateMut = trpc.cafe.update.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setUploadedFile(null); setNotice(t("admin.cafe.updated")); },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });
  const removeMut = trpc.cafe.remove.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.cafe.deleted")); },
  });
  const publishMut = trpc.cafe.setPublished.useMutation({
    onSuccess: () => { invalidate(); setNotice(t("admin.cafe.publish_saved")); },
    onError: () => setNotice(`${t("admin.error")}: ${t("admin.generic_error")}`),
  });

  const startNew = (t: DraftType) => {
    setType(t);
    setTitle("");
    setContent("");
    setDescription("");
    setNote("");
    setUploadedFile(null);
    setEditLang("pt");
    setDraftTranslations({
      pt: { title: "", content: "", description: "" },
      en: { title: "", content: "", description: "" },
      es: { title: "", content: "", description: "" },
      ar: { title: "", content: "", description: "" },
    });
    setEditing("new");
  };

  const startEdit = (id: number) => {
    const d = drafts?.find((x) => x.id === id);
    if (!d) return;
    setType(d.type as DraftType);
    setTitle(d.title);
    setContent(d.content);
    setDescription(d.description ?? "");
    setNote(d.note ?? "");
    setUploadedFile(null);
    setEditLang("pt");
    setDraftTranslations({
      pt: d.translations?.pt ?? { title: d.title, content: d.content, description: d.description ?? "" },
      en: d.translations?.en ?? { title: "", content: "", description: "" },
      es: d.translations?.es ?? { title: "", content: "", description: "" },
      ar: d.translations?.ar ?? { title: "", content: "", description: "" },
    });
    setEditing(id);
  };

  const save = () => {
    if (uploadMut.isPending) {
      setNotice(t("admin.cafe.wait_upload"));
      return;
    }
    if (!content.trim()) {
      setNotice(t("admin.cafe.required"));
      return;
    }
    const translations = {
      ...draftTranslations,
      pt: { title: title.trim(), content: content.trim(), description: description.trim() },
    };
    const data = {
      type,
      title: title.trim(),
      content: content.trim(),
      description: description.trim(),
      note: note.trim(),
      translations,
    };
    if (editing === "new") createMut.mutate(data);
    else if (typeof editing === "number") updateMut.mutate({ id: editing, data });
  };

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-[var(--c-primary)] shadow-sm">
        {t("admin.generic_error")}
      </div>
    );
  }

  const typeLabel = (type: string) => {
    const draftType = DRAFT_TYPES.find((x) => x.id === type);
    return draftType ? t(draftType.labelKey) : type;
  };
  const typeIcon = (type: string) => DRAFT_TYPES.find((x) => x.id === type)?.icon ?? "📄";
  const pickCafeFile = (file: File | undefined) => {
    if (!file) return;
    if (!MEDIA_REGEX.test(file.type)) {
      setNotice(`${t("admin.error")}: ${t("admin.media.unsupported")}`);
      return;
    }
    if (type === "image" && !/^image\//i.test(file.type)) {
      setNotice(`${t("admin.error")}: ${t("admin.cafe.image_only")}`);
      return;
    }
    if (type === "video" && !/^video\//i.test(file.type)) {
      setNotice(`${t("admin.error")}: ${t("admin.cafe.video_only")}`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setNotice(`${t("admin.error")}: ${t("admin.media.too_large")}`);
      return;
    }

    setNotice(t("admin.cafe.uploading"));
    setUploadedFile({ name: file.name, mime: file.type, size: file.size });
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      uploadMut.mutate({
        name: file.name,
        mime: file.type,
        dataBase64: dataUrl.split(",")[1] ?? "",
      });
    };
    reader.onerror = () => {
      setUploadedFile(null);
      setNotice(`${t("admin.error")}: ${t("admin.cafe.upload_failed")}`);
    };
    reader.readAsDataURL(file);
  };
  const clearMedia = () => {
    setContent("");
    setUploadedFile(null);
  };
  const localizedTitle = editLang === "pt" ? title : draftTranslations[editLang].title;
  const localizedContent = editLang === "pt" ? content : draftTranslations[editLang].content;
  const localizedDescription = editLang === "pt" ? description : draftTranslations[editLang].description;
  const setLocalizedTitle = (value: string) => {
    if (editLang === "pt") {
      setTitle(value);
      return;
    }
    setDraftTranslations((current) => ({
      ...current,
      [editLang]: { ...current[editLang], title: value },
    }));
  };
  const setLocalizedContent = (value: string) => {
    if (editLang === "pt") {
      setContent(value);
      return;
    }
    setDraftTranslations((current) => ({
      ...current,
      [editLang]: { ...current[editLang], content: value },
    }));
  };
  const setLocalizedDescription = (value: string) => {
    if (editLang === "pt") {
      setDescription(value);
      return;
    }
    setDraftTranslations((current) => ({
      ...current,
      [editLang]: { ...current[editLang], description: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--c-accent)]/40 bg-[#fff8ec] px-4 py-2 text-xs text-[var(--c-ink)]/70">
        {t("admin.cafe.mode")}
      </div>

      {notice && (
        <div className="rounded-lg border border-[var(--c-ink)]/15 bg-white px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      {/* Novo rascunho */}
      <div className="flex flex-wrap gap-2">
        {DRAFT_TYPES.map((draftType) => (
          <Button key={draftType.id} variant="outline" onClick={() => startNew(draftType.id)}>
            {draftType.icon} {text(t, "admin.cafe.new_type", { type: typeLabel(draftType.id).toLowerCase() })}
          </Button>
        ))}
      </div>

      {editing !== null && (
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-4 font-bold">
            {editing === "new" ? t("admin.cafe.new_draft") : t("admin.cafe.edit_draft")} — {typeLabel(type)}
          </h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {LANGS.map((locale) => (
                <Button
                  key={locale}
                  type="button"
                  size="sm"
                  variant={editLang === locale ? "default" : "outline"}
                  onClick={() => setEditLang(locale)}
                >
                  {formatLanguageLabel(locale)}
                </Button>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.cafe.title_label")}</label>
              <Input value={localizedTitle} onChange={(e) => setLocalizedTitle(e.target.value)} placeholder={t("admin.cafe.title_placeholder")} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.cafe.description_label")}</label>
              <Textarea rows={3} value={localizedDescription} onChange={(e) => setLocalizedDescription(e.target.value)} placeholder={t("admin.cafe.description_placeholder")} />
            </div>
            {type === "text" ? (
              <div>
                <label className="text-xs font-bold uppercase">{t("admin.cafe.text_label")}</label>
                <Textarea rows={6} value={localizedContent} onChange={(e) => setLocalizedContent(e.target.value)} placeholder={t("admin.cafe.text_placeholder")} />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase">
                  {text(t, "admin.cafe.media_label", { type: typeLabel(type) })}
                </label>
                <div className="mt-2 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-lg border border-[var(--c-ink)]/10 p-4">
                    <div className="text-xs font-bold uppercase text-[var(--c-ink)]/55">
                      {t("admin.cafe.upload_from_computer")}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={type === "video" ? "video/*" : "image/*"}
                      className="hidden"
                      onChange={(e) => {
                        pickCafeFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 w-full"
                      disabled={uploadMut.isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadMut.isPending ? t("admin.cafe.uploading") : t("admin.cafe.choose_file")}
                    </Button>
                    <p className="mt-2 text-[11px] leading-relaxed text-[var(--c-ink)]/50">
                      {t("admin.cafe.upload_help")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--c-ink)]/10 p-4">
                    <div className="text-xs font-bold uppercase text-[var(--c-ink)]/55">
                      {t("admin.cafe.existing_media")}
                    </div>
                    <select
                      className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setUploadedFile(null);
                      }}
                    >
                      <option value="">{t("admin.cafe.choose_media")}</option>
                      {(mediaList ?? [])
                        .filter((m) => (type === "video" ? isVideo(m.mime) : !isVideo(m.mime)))
                        .map((m) => (
                          <option key={m.id} value={m.url}>{m.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="rounded-lg border border-[var(--c-ink)]/10 p-4">
                    <div className="text-xs font-bold uppercase text-[var(--c-ink)]/55">
                      {t("admin.cafe.manual_url")}
                    </div>
                    <Input
                      className="mt-3"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setUploadedFile(null);
                      }}
                      placeholder={t("admin.cafe.paste_url")}
                    />
                  </div>
                </div>
                {content && (
                  <div className="mt-4 rounded-lg bg-[var(--c-sand)] p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      {type === "video" ? (
                        <video src={content} controls preload="metadata" className="max-h-48 rounded bg-black" />
                      ) : (
                        <img src={content} alt="" className="max-h-48 rounded object-contain" />
                      )}
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="font-bold">{uploadedFile?.name ?? t("admin.cafe.selected_media")}</div>
                        {uploadedFile && (
                          <div className="mt-1 text-xs text-[var(--c-ink)]/55">
                            {uploadedFile.mime} · {formatFileSize(uploadedFile.size)}
                          </div>
                        )}
                        <div className="mt-1 break-all font-mono text-[11px] text-[var(--c-ink)]/50">
                          {content}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            {t("admin.cafe.change_file")}
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={clearMedia}>
                            {t("admin.cafe.remove_media")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase">{t("admin.cafe.note")}</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.cafe.note_placeholder")} />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={createMut.isPending || updateMut.isPending || uploadMut.isPending}>
                {uploadMut.isPending ? t("admin.cafe.uploading") : t("admin.cafe.save")}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>{t("admin.cancel")}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de rascunhos */}
      <div className="grid gap-3">
        {(!drafts || drafts.length === 0) && (
          <p className="text-sm text-[var(--c-ink)]/55">
            {t("admin.cafe.empty")}
          </p>
        )}
        {drafts?.map((d) => (
          <div key={d.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <span className="text-xl">{typeIcon(d.type)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">
                {d.title || <span className="text-[var(--c-ink)]/40">{t("admin.cafe.untitled")}</span>}
              </div>
              <div className="truncate text-xs text-[var(--c-ink)]/55">
                {typeLabel(d.type)} · {d.type === "text" ? d.content.slice(0, 80) : d.content}
                {d.note ? ` · 📝 ${d.note}` : ""}
              </div>
              <div className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${d.published ? "text-green-700" : "text-[var(--c-ink)]/40"}`}>
                {d.published ? t("admin.cafe.published") : t("admin.cafe.draft")}
              </div>
            </div>
            <Button
              size="sm"
              variant={d.published ? "outline" : "default"}
              disabled={publishMut.isPending}
              onClick={() => publishMut.mutate({ id: d.id, published: !d.published })}
            >
              {d.published ? t("admin.cafe.unpublish") : t("admin.cafe.publish")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => startEdit(d.id)}>{t("admin.edit")}</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm(t("admin.cafe.delete_confirm"))) removeMut.mutate({ id: d.id });
              }}
            >
              {t("admin.delete")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
