"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useGame } from "@/components/GameProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { ui } from "@/lib/ui";

const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_ALREADY_EXISTS: "Já existe uma conta com esse e-mail. Entre nela ou use outro e-mail.",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
  INVALID_EMAIL: "Esse e-mail não parece válido.",
};

const dots = ["bg-p1", "bg-p2", "bg-p3", "bg-p4", "bg-p5"];

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
      setError(messages[res.error.code ?? ""] ?? res.error.message ?? "Algo deu errado. Tente de novo.");
    }
  }

  return (
    <main className="relative mx-auto grid min-h-dvh w-full max-w-[1080px] items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:gap-16">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div>
        <p className="font-display text-2xl tracking-tight">
          Game Hub<span className="text-accent">.</span>
        </p>
        <h1 className="mt-8 font-display text-[clamp(2.6rem,5.5vw,4rem)] font-normal leading-[1.02] tracking-tight">
          Jogue com o grupo, cada um no seu aparelho.
        </h1>
        <p className={ui.lead}>Crie uma sala, mande o link e comece o quiz em poucos segundos.</p>
        <div className="mt-8 flex" aria-hidden="true">
          {dots.map((tone) => (
            <span key={tone} className={`-ml-2.5 size-10 rounded-full border-2 border-bg first:ml-0 ${tone}`} />
          ))}
        </div>
      </div>

      <form className={`${ui.card} flex flex-col gap-4 p-7 sm:p-8`} onSubmit={onSubmit}>
        <h2 className={ui.h2}>{isLogin ? "Entrar na conta" : "Criar conta"}</h2>

        {!isLogin && (
          <label className={ui.label}>
            Nome que aparece nas salas
            <input name="name" autoComplete="name" required className={ui.input} />
          </label>
        )}
        <label className={ui.label}>
          E-mail
          <input name="email" type="email" autoComplete="email" required className={ui.input} />
        </label>
        <label className={ui.label}>
          Senha
          <input
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? undefined : 8}
            required
            className={ui.input}
          />
        </label>

        {error && (
          <p role="alert" className={ui.alert}>
            {error}
          </p>
        )}

        <button className={`${ui.btnPrimary} mt-1`} disabled={busy}>
          {busy ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
        </button>

        <p className="text-sm text-muted">
          {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-medium text-fg underline underline-offset-4"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </Link>
        </p>
      </form>
    </main>
  );
}