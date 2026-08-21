import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { useLang } from "@/lib/i18n";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { t } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMut = trpc.auth.loginPassword.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/admin");
    },
    onError: () => setError(t("login.error")),
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
          <CardTitle className="font-display text-2xl">{t("login.title")}</CardTitle>
          <p className="text-xs text-[var(--c-ink)]/55">{t("login.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                {t("login.username")}
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder={t("login.username_placeholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                {t("login.password")}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder={t("login.password_placeholder")}
              />
            </div>
            {error && <p className="text-sm font-medium text-[var(--c-primary)]">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loginMut.isPending}>
              {loginMut.isPending ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
