"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useGame } from "@/components/GameProvider";

const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_ALREADY_EXISTS: "Já existe uma conta com esse e-mail. Entre nela ou use outro e-mail.",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
  INVALID_EMAIL: "Esse e-mail não parece válido.",
};

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const { user } = useGame();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Quando a sessão aparece (depois do login ou registro), vai para o início.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setBusy(true);
    setError(null);
    const res = isLogin
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name: String(form.get("name")) });

    if (res.error) {
      setBusy(false);

      alert(res.error);
      setError(messages[res.error.code ?? ""] ?? res.error.message ?? "Algo deu errado. Tente de novo.");
    }
  }

  return (
    <main className="auth">
      <div>
        <div className="motif" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <h1>Game Hub</h1>
        <p className="lead">Crie uma sala, chame o grupo e jogue junto, cada um no seu aparelho.</p>
      </div>

      <form className="panel chalk" onSubmit={onSubmit}>
        <h2>{isLogin ? "Entrar na conta" : "Criar conta"}</h2>

        {!isLogin && (
          <label className="field">
            Nome que aparece nas salas
            <input name="name" autoComplete="name" required />
          </label>
        )}
        <label className="field">
          E-mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          Senha
          <input
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? undefined : 8}
            required
          />
        </label>

        {error && (
          <p role="alert" className="alert">
            {error}
          </p>
        )}

        <button className="btn btn-cobalt" disabled={busy}>
          {busy ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
        </button>

        <p className="switch">
          {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
          <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Criar conta" : "Entrar"}</Link>
        </p>
      </form>
    </main>
  );
}
