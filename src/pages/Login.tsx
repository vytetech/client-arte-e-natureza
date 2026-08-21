import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
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
    loginMut.mutate({ username: email, password });
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
                E-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@exemplo.com"
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
        </CardContent>
      </Card>
    </div>
  );
}
