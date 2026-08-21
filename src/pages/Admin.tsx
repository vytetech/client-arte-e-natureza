import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { applyTheme, FONT_OPTIONS } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "Pinturas",
  "Esculturas",
  "Galeria a Céu Aberto",
  "Circo & Forma",
  "Recortes",
  "Arte Ambiental",
];

const SECTIONS = [
  { key: "section.manifesto", label: "Manifesto (texto de abertura)" },
  { key: "section.linguagens", label: "Três linguagens, um só olhar" },
  { key: "section.video", label: "Vídeo — o ateliê em movimento" },
  { key: "section.destino", label: "O ateliê é um destino" },
  { key: "section.imagens", label: "O ateliê em imagens" },
  { key: "section.ceuaberto", label: "Galeria de arte ecológica ao ar livre" },
  { key: "section.mapa", label: "Mapa — como chegar" },
];

const COLOR_FIELDS = [
  { key: "design.primary", label: "Cor principal (vermelho)", def: "#8f1d22" },
  { key: "design.bg", label: "Fundo do site", def: "#f6f0e4" },
  { key: "design.ink", label: "Texto principal", def: "#1a1712" },
  { key: "design.accent", label: "Destaque (dourado)", def: "#d4a24e" },
  { key: "design.dark", label: "Seções escuras", def: "#14100c" },
  { key: "design.sand", label: "Blocos claros", def: "#efe6d2" },
];

type Tab = "obras" | "imagens" | "textos" | "design" | "secoes" | "cafe" | "usuarios";

const TABS: { id: Tab; label: string }[] = [
  { id: "obras", label: "Obras e preços" },
  { id: "imagens", label: "Imagens" },
  { id: "textos", label: "Textos do site" },
  { id: "design", label: "Design e fontes" },
  { id: "secoes", label: "Seções da página" },
  { id: "cafe", label: "☕ Espaço de Café" },
  { id: "usuarios", label: "Usuários" },
];

type WorkForm = {
  slug: string;
  title: string;
  category: string;
  technique: string;
  status: string;
  year: string;
  price: string;
  image: string;
  description: string;
  sortOrder: number;
};

const emptyWork: WorkForm = {
  slug: "",
  title: "",
  category: CATEGORIES[0],
  technique: "",
  status: "Disponível",
  year: "2026",
  price: "Sob consulta",
  image: "",
  description: "",
  sortOrder: 99,
};

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

export default function Admin() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("obras");

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--c-bg)]">
        <p>Área restrita. Entre com sua conta para continuar.</p>
        <Link to="/login">
          <Button>Ir para o login</Button>
        </Link>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--c-bg)]">
        <p>Esta conta não tem permissão de administrador.</p>
        <Button variant="outline" onClick={logout}>Sair</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-black">Administração — Atelier Daniel Detomi</h1>
            <p className="text-xs text-[var(--c-ink)]/60">Olá, {user?.name ?? "admin"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline">Ver o site</Button>
            </Link>
            <Button variant="outline" onClick={logout}>Sair</Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-3">
          {TABS.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "default" : "outline"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
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
        {tab === "cafe" && <CafeTab />}
        {tab === "usuarios" && <UsersTab />}
      </main>
    </div>
  );
}

/* ============================= USUÁRIOS ============================= */

type UserForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin";
  isActive: boolean;
};

const emptyUserForm: UserForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "admin",
  isActive: true,
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Nunca";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Nunca";
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function UsersTab() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.listUsers.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyUserForm);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [notice, setNotice] = useState("");

  const invalidate = () => utils.admin.listUsers.invalidate();
  const onError = (error: { message: string }) => setNotice(`Erro: ${error.message}`);

  const createMut = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      invalidate();
      setForm(emptyUserForm);
      setEditingId(null);
      setNotice("Usuário criado ✓");
    },
    onError,
  });
  const updateMut = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      invalidate();
      setForm(emptyUserForm);
      setEditingId(null);
      setNotice("Usuário salvo ✓");
    },
    onError,
  });
  const resetMut = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      setResetUserId(null);
      setNewPassword("");
      setConfirmNewPassword("");
      setNotice("Senha redefinida ✓");
    },
    onError,
  });
  const deleteMut = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      invalidate();
      setNotice("Usuário excluído ✓");
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
      email: user.email ?? "",
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
      setNotice("Erro: as senhas não conferem.");
      return;
    }

    if (editingId === null) {
      createMut.mutate({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      return;
    }

    updateMut.mutate({
      id: editingId,
      name: form.name,
      email: form.email,
      isActive: form.isActive,
    });
  };

  const resetPassword = (id: number) => {
    setNotice("");
    if (newPassword !== confirmNewPassword) {
      setNotice("Erro: as senhas não conferem.");
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
            {editingId === null ? "Novo usuário administrativo" : "Editar usuário"}
          </h2>
          {editingId !== null && (
            <Button variant="outline" size="sm" onClick={startCreate}>
              Novo usuário
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase">Nome</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase">E-mail</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {editingId === null && (
            <>
              <div>
                <label className="text-xs font-bold uppercase">Senha inicial</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Confirmar senha</label>
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
            <label className="text-xs font-bold uppercase">Perfil</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "admin" })}
            >
              <option value="admin">Administrador</option>
            </select>
          </div>
          {editingId !== null && (
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Usuário ativo
            </label>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={saveUser} disabled={createMut.isPending || updateMut.isPending}>
            {editingId === null ? "Criar usuário" : "Salvar usuário"}
          </Button>
          {editingId !== null && (
            <Button variant="outline" onClick={startCreate}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-[var(--c-ink)]/60">Carregando usuários…</p>}
        {users?.map((user) => (
          <div key={user.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-bold">{user.name ?? "Sem nome"}</div>
                <div className="text-sm text-[var(--c-ink)]/60">{user.email}</div>
                <div className="mt-1 text-xs text-[var(--c-ink)]/45">
                  {user.isActive ? "Ativo" : "Inativo"} · {user.role} · Último acesso:{" "}
                  {formatDate(user.lastSignInAt)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                  Editar
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
                  Redefinir senha
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Excluir o usuário "${user.email}"?`)) {
                      deleteMut.mutate({ id: user.id });
                    }
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>

            {resetUserId === user.id && (
              <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="text-xs font-bold uppercase">Nova senha</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Confirmar nova senha</label>
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
                    Salvar senha
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
  const { data: works } = trpc.admin.listWorks.useQuery();
  const { data: images } = trpc.admin.listImages.useQuery();
  const { data: mediaList } = trpc.admin.listMedia.useQuery();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<WorkForm>(emptyWork);
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
    onSuccess: () => { invalidate(); setEditing(null); setNotice("Obra criada ✓"); },
  });
  const updateMut = trpc.admin.updateWork.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setNotice("Obra salva ✓"); },
  });
  const deleteMut = trpc.admin.deleteWork.useMutation({
    onSuccess: () => { invalidate(); setNotice("Obra excluída ✓"); },
  });
  const reorderMut = trpc.admin.reorderWorks.useMutation({
    onSuccess: () => { invalidate(); setNotice("Nova ordem salva ✓"); },
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
      status: w.status,
      year: w.year,
      price: w.price,
      image: w.image,
      description: w.description ?? "",
      sortOrder: w.sortOrder,
    });
    setEditing(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const commitPrice = () => {
    const n = parseBRL(priceInput);
    const price = n === null ? "Sob consulta" : `R$ ${formatBRL(n)}`;
    setPriceInput(n === null ? "" : formatBRL(n));
    setForm((f) => ({ ...f, price }));
  };

  const save = () => {
    const n = parseBRL(priceInput);
    const price = n === null ? "Sob consulta" : `R$ ${formatBRL(n)}`;
    if (!form.title || !form.slug || !form.image) {
      setNotice("Preencha título, slug e imagem.");
      return;
    }
    const data = { ...form, price };
    if (editing === "new") createMut.mutate(data);
    else if (typeof editing === "number") updateMut.mutate({ id: editing, data });
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
          {works?.length ?? 0} obras cadastradas. Arraste os cartões para reordenar — a ordem é salva
          automaticamente.
        </p>
        <Button onClick={() => { setForm(emptyWork); setPriceInput(""); setEditing("new"); }}>+ Nova obra</Button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">
          {notice}
        </div>
      )}

      {editing !== null && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 font-bold">{editing === "new" ? "Nova obra" : "Editar obra"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase">Título</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Slug (URL)</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Categoria</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Preço</label>
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
                  placeholder="Sob consulta"
                  className="w-full bg-transparent px-2 py-2 text-sm font-semibold outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--c-ink)]/45">
                Formato brasileiro: 12.500,00 · vazio = “Sob consulta”
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Técnica</label>
              <Input value={form.technique} onChange={(e) => setForm({ ...form, technique: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold uppercase">Ano de produção</label>
                <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Ordem</label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Status</label>
              <div className="mt-1 flex gap-2">
                {(["Disponível", "Vendido"] as const).map((s) => {
                  const active = form.status.toLowerCase() === s.toLowerCase();
                  const isSold = s === "Vendido";
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
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase">Imagem</label>
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
                  <option value="">— ou escolher da biblioteca —</option>
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
              <label className="text-xs font-bold uppercase">Descrição (parágrafos separados por linha em branco)</label>
              <Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={createMut.isPending || updateMut.isPending}>Salvar obra</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
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
            title="Arraste para reordenar"
          >
            <span className="text-lg text-[var(--c-ink)]/30">⠿</span>
            <img src={w.image} alt="" className="h-16 w-24 rounded object-cover" />
            <div className="flex-1">
              <div className="font-bold">{w.title}</div>
              <div className="text-xs text-[var(--c-ink)]/60">
                {w.category} · {w.year} · <span className="font-bold text-[var(--c-primary)]">{w.price}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => startEdit(w.id)}>Editar</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm(`Excluir a obra "${w.title}"?`)) deleteMut.mutate({ id: w.id });
              }}
            >
              Excluir
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
    onError: (e) => {
      setError(e.message);
      setBusy(false);
    },
  });

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\//i.test(f.type)) {
      setError("Escolha um arquivo de imagem (JPG, PNG, GIF, WebP…).");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError("Imagem muito grande (máx. 25 MB).");
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
          ? "Enviando imagem…"
          : mobile
            ? "Tocar para escolher da galeria de fotos"
            : "Clique para escolher no explorador de arquivos"}
      </button>
      <p className="mt-1 text-[11px] text-[var(--c-ink)]/45">
        {mobile
          ? "Abre a galeria do celular (rolo da câmera)."
          : "Abre o gerenciador de arquivos do computador — navegue até a pasta das fotos."}
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

function ImagesTab() {
  const utils = trpc.useUtils();
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
      setNotice("Imagem enviada ✓");
    },
    onError: (e) => setNotice(`Erro: ${e.message}`),
  });
  const deleteMut = trpc.admin.deleteMedia.useMutation({
    onSuccess: () => { invalidate(); setNotice("Imagem excluída ✓"); },
  });
  const renameMut = trpc.admin.renameMedia.useMutation({
    onSuccess: () => { invalidate(); setRenaming(null); setNotice("Nome atualizado ✓"); },
  });

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!MEDIA_REGEX.test(f.type)) {
      setNotice("Formato não suportado. Use JPG, PNG, GIF, WebP, SVG ou vídeos MP4/WebM.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setNotice("Arquivo muito grande (máx. 50 MB).");
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

  const fmtSize = (n: number) =>
    n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;

  return (
    <div className="space-y-8">
      {notice && (
        <div className="rounded-lg border border-[var(--c-ink)]/15 bg-white px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-bold">Enviar nova imagem ou vídeo</h2>
        <p className="mb-4 text-xs text-[var(--c-ink)]/55">
          Imagens: JPG, JPEG, PNG, GIF, WebP, SVG, AVIF e BMP — sem limite de resolução. Vídeos:
          MP4, WebM, OGG e MOV. Máximo de 50 MB por arquivo. Depois do envio, a mídia fica
          disponível para qualquer obra na aba "Obras".
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--c-ink)]/20 px-6 py-10 text-center transition hover:border-[var(--c-primary)]">
          <input
            type="file"
            accept={MEDIA_ACCEPT}
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <span className="text-sm font-medium">Clique para escolher uma imagem ou vídeo</span>
          <span className="mt-1 text-xs text-[var(--c-ink)]/45">
            JPG · PNG · GIF · WebP · SVG · AVIF · MP4 · WebM · MOV
          </span>
        </label>

        {preview && (
          <div className="mt-5 flex flex-wrap items-center gap-5 rounded-lg bg-[var(--c-sand)] p-4">
            {isVideo(preview.mime) ? (
              <video src={preview.url} controls className="max-h-40 rounded" />
            ) : (
              <img src={preview.url} alt="Pré-visualização" className="max-h-40 rounded object-contain" />
            )}
            <div className="flex-1 text-sm">
              <div className="font-bold">{preview.name}</div>
              <div className="text-xs text-[var(--c-ink)]/55">
                {preview.mime} · {fmtSize(preview.size)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={upload} disabled={uploadMut.isPending}>
                {uploadMut.isPending ? "Enviando…" : "Confirmar envio"}
              </Button>
              <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 font-bold">Mídias enviadas ({mediaList?.length ?? 0})</h2>
        {(!mediaList || mediaList.length === 0) && (
          <p className="text-sm text-[var(--c-ink)]/55">Nenhuma mídia enviada ainda.</p>
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
                  {m.mime} · {fmtSize(m.size)}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${m.url}`);
                      setNotice("URL copiada ✓");
                    }}
                  >
                    Copiar URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRenaming(m.id); setNewName(m.name); }}
                  >
                    Renomear
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Excluir "${m.name}"?`)) deleteMut.mutate({ id: m.id });
                    }}
                  >
                    Excluir
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
  const { data: texts } = trpc.admin.listTexts.useQuery();
  const update = trpc.admin.updateText.useMutation({
    onSuccess: () => {
      utils.admin.listTexts.invalidate();
      utils.content.texts.invalidate();
    },
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    if (texts) {
      const v: Record<string, string> = {};
      for (const t of texts) v[t.key] = t.value;
      setValues(v);
    }
  }, [texts]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--c-ink)]/65">
        Todos os textos do site. Você pode escrever em qualquer idioma, incluindo árabe — o site
        aceita múltiplos idiomas. Separe parágrafos com uma linha em branco.
      </p>
      {texts?.map((t) => (
        <div key={t.key} className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-bold">{t.label}</label>
          <Textarea
            rows={t.value.length > 200 ? 6 : 2}
            value={values[t.key] ?? ""}
            onChange={(e) => setValues({ ...values, [t.key]: e.target.value })}
          />
          <div className="mt-2 flex items-center gap-3">
            <Button
              size="sm"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { key: t.key, value: values[t.key] ?? "" },
                  { onSuccess: () => setSavedKey(t.key) },
                )
              }
            >
              Salvar
            </Button>
            {savedKey === t.key && <span className="text-xs text-green-700">Salvo ✓</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================= DESIGN ============================= */

function DesignTab() {
  const utils = trpc.useUtils();
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
    setNotice("Design salvo e aplicado ao site ✓");
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
        <h2 className="mb-4 font-bold">Fontes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase">Fonte dos títulos</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={vals["design.fontDisplay"] ?? "Cormorant Garamond"}
              onChange={(e) => set("design.fontDisplay", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Fonte do texto</label>
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
              Tamanho base do texto — {baseSize}%
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
              Títulos em <b>negrito</b>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(vals["design.headingsItalic"] ?? "0") === "1"}
                onChange={(e) => set("design.headingsItalic", e.target.checked ? "1" : "0")}
              />
              Títulos em <i>itálico</i>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(vals["design.bodyBold"] ?? "0") === "1"}
                onChange={(e) => set("design.bodyBold", e.target.checked ? "1" : "0")}
              />
              Texto em <b>negrito</b>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold">Cores do site</h2>
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
                <div className="text-sm font-medium">{c.label}</div>
                <div className="font-mono text-xs text-[var(--c-ink)]/50">
                  {vals[c.key] ?? c.def}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--c-primary)]/30 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold">Pré-visualização ao vivo</h2>
        <div className="rounded-lg bg-[var(--c-bg)] p-6">
          <div className="eyebrow text-[var(--c-primary)]">Exemplo de etiqueta</div>
          <h3 className="mt-2 text-3xl">Título de exemplo do site</h3>
          <p className="mt-2 leading-relaxed">
            Este é um parágrafo de exemplo com a fonte e o tamanho escolhidos. As mudanças aparecem
            aqui — e em todo o site — imediatamente, antes mesmo de salvar.
          </p>
          <span className="mt-3 inline-block bg-[var(--c-primary)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
            Botão de exemplo
          </span>
        </div>
      </div>

      <Button size="lg" onClick={saveAll} disabled={save.isPending}>
        {save.isPending ? "Salvando…" : "Salvar design"}
      </Button>
    </div>
  );
}

/* ============================= SEÇÕES ============================= */

function SectionsTab() {
  const utils = trpc.useUtils();
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
        Ative ou desative as seções da página inicial. A mudança aparece no site imediatamente após
        salvar.
      </p>
      {SECTIONS.map((s) => {
        const on = value(s.key) !== "0";
        return (
          <div key={s.key} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <div className="font-bold">{s.label}</div>
              <div className="text-xs text-[var(--c-ink)]/50">{on ? "Visível no site" : "Oculta"}</div>
            </div>
            <div className="flex items-center gap-3">
              {savedKey === s.key && <span className="text-xs text-green-700">Salvo ✓</span>}
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
                {on ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================= ESPAÇO DE CAFÉ ============================= */

const DRAFT_TYPES = [
  { id: "text", label: "Texto", icon: "✏️" },
  { id: "image", label: "Foto", icon: "🖼️" },
  { id: "video", label: "Vídeo", icon: "🎬" },
] as const;

type DraftType = (typeof DRAFT_TYPES)[number]["id"];

function CafeTab() {
  const utils = trpc.useUtils();
  const { data: status } = trpc.cafe.status.useQuery();
  const enabled = status?.enabled ?? false;

  const toggleMut = trpc.cafe.toggle.useMutation({
    onSuccess: () => {
      utils.cafe.status.invalidate();
      utils.cafe.list.invalidate();
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
            ☕ Espaço de Café — {enabled ? "ativado" : "desativado"}
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--c-ink)]/60">
            Área de rascunho: textos, fotos e vídeos em preparação que{" "}
            <strong>nunca aparecem no site público</strong>. Desativado, o espaço fica
            completamente inacessível.
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
          <h3 className="mt-3 font-display text-xl font-semibold">Espaço de Café fechado</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--c-ink)]/55">
            Os rascunhos estão guardados em segurança. Ative o espaço acima para voltar a
            editá-los.
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
  const { data: drafts, error } = trpc.cafe.list.useQuery();
  const { data: mediaList } = trpc.admin.listMedia.useQuery();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [type, setType] = useState<DraftType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");

  const invalidate = () => utils.cafe.list.invalidate();
  const createMut = trpc.cafe.create.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setNotice("Rascunho criado ✓"); },
    onError: (e) => setNotice(`Erro: ${e.message}`),
  });
  const updateMut = trpc.cafe.update.useMutation({
    onSuccess: () => { invalidate(); setEditing(null); setNotice("Rascunho salvo ✓"); },
    onError: (e) => setNotice(`Erro: ${e.message}`),
  });
  const removeMut = trpc.cafe.remove.useMutation({
    onSuccess: () => { invalidate(); setNotice("Rascunho excluído ✓"); },
  });

  const startNew = (t: DraftType) => {
    setType(t);
    setTitle("");
    setContent("");
    setNote("");
    setEditing("new");
  };

  const startEdit = (id: number) => {
    const d = drafts?.find((x) => x.id === id);
    if (!d) return;
    setType(d.type as DraftType);
    setTitle(d.title);
    setContent(d.content);
    setNote(d.note ?? "");
    setEditing(id);
  };

  const save = () => {
    if (!content.trim()) {
      setNotice("Preencha o conteúdo do rascunho.");
      return;
    }
    const data = { type, title: title.trim(), content: content.trim(), note: note.trim() };
    if (editing === "new") createMut.mutate(data);
    else if (typeof editing === "number") updateMut.mutate({ id: editing, data });
  };

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-[var(--c-primary)] shadow-sm">
        {error.message}
      </div>
    );
  }

  const typeLabel = (t: string) => DRAFT_TYPES.find((x) => x.id === t)?.label ?? t;
  const typeIcon = (t: string) => DRAFT_TYPES.find((x) => x.id === t)?.icon ?? "📄";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--c-accent)]/40 bg-[#fff8ec] px-4 py-2 text-xs text-[var(--c-ink)]/70">
        Modo rascunho ativo — nada daqui aparece no site público.
      </div>

      {notice && (
        <div className="rounded-lg border border-[var(--c-ink)]/15 bg-white px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      {/* Novo rascunho */}
      <div className="flex flex-wrap gap-2">
        {DRAFT_TYPES.map((t) => (
          <Button key={t.id} variant="outline" onClick={() => startNew(t.id)}>
            {t.icon} Novo {t.label.toLowerCase()}
          </Button>
        ))}
      </div>

      {editing !== null && (
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-4 font-bold">
            {editing === "new" ? "Novo rascunho" : "Editar rascunho"} — {typeLabel(type)}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome interno do rascunho" />
            </div>
            {type === "text" ? (
              <div>
                <label className="text-xs font-bold uppercase">Texto</label>
                <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva o texto em preparação…" />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase">
                  {type === "image" ? "Foto" : "Vídeo"} (da aba Imagens)
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                >
                  <option value="">— escolher mídia enviada —</option>
                  {(mediaList ?? [])
                    .filter((m) => (type === "video" ? isVideo(m.mime) : !isVideo(m.mime)))
                    .map((m) => (
                      <option key={m.id} value={m.url}>{m.name}</option>
                    ))}
                </select>
                <Input
                  className="mt-2"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ou cole a URL da mídia"
                />
                {content && (
                  <div className="mt-3">
                    {type === "video" ? (
                      <video src={content} controls className="max-h-48 rounded" />
                    ) : (
                      <img src={content} alt="" className="max-h-48 rounded object-contain" />
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase">Anotação interna (opcional)</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: publicar na próxima exposição" />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={createMut.isPending || updateMut.isPending}>
                Salvar rascunho
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de rascunhos */}
      <div className="grid gap-3">
        {(!drafts || drafts.length === 0) && (
          <p className="text-sm text-[var(--c-ink)]/55">
            Nenhum rascunho ainda. Comece com um texto, foto ou vídeo em preparação.
          </p>
        )}
        {drafts?.map((d) => (
          <div key={d.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <span className="text-xl">{typeIcon(d.type)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">
                {d.title || <span className="text-[var(--c-ink)]/40">(sem título)</span>}
              </div>
              <div className="truncate text-xs text-[var(--c-ink)]/55">
                {typeLabel(d.type)} · {d.type === "text" ? d.content.slice(0, 80) : d.content}
                {d.note ? ` · 📝 ${d.note}` : ""}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => startEdit(d.id)}>Editar</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("Excluir este rascunho?")) removeMut.mutate({ id: d.id });
              }}
            >
              Excluir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
