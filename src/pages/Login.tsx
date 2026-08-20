import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMut = trpc.auth.loginPassword.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/admin");
    },
    onError: (e) => setError(e.message || "Usuário ou senha incorretos."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMut.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Área do Administrador</CardTitle>
          <p className="text-xs text-[var(--c-ink)]/55">Atelier Daniel Detomi — Arte e Natureza</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                Usuário
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Usuário"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Senha"
              />
            </div>
            {error && <p className="text-sm font-medium text-[var(--c-primary)]">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loginMut.isPending}>
              {loginMut.isPending ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-[var(--c-ink)]/40">
            <span className="h-px flex-1 bg-[var(--c-ink)]/15" />
            ou
            <span className="h-px flex-1 bg-[var(--c-ink)]/15" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            Entrar com Kimi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
