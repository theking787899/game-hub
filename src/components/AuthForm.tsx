"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useGame } from "@/components/GameProvider";
import { ui } from "@/lib/ui";

const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_ALREADY_EXISTS: "Já existe uma conta com esse e-mail. Entre nela ou use outro e-mail.",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
  INVALID_EMAIL: "Esse e-mail não parece válido.",
};

const dots = ["bg-punch", "bg-sun", "bg-mint", "bg-sky", "bg-lilac"];

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
    <main className="mx-auto grid min-h-dvh w-full max-w-[1080px] items-center gap-7 px-5 py-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
      <div>
        <div className="flex" aria-hidden="true">
          {dots.map((color) => (
            <span
              key={color}
              className={`-ml-3.5 size-14 rounded-full border-4 border-cobalt first:ml-0 ${color}`}
            />
          ))}
        </div>
        <h1 className={`${ui.h1} mt-5`}>Game Hub</h1>
        <p className={ui.lead}>
          Crie uma sala, chame o grupo e jogue junto, cada um no seu aparelho.
        </p>
      </div>

      <form className={`${ui.panel} items-start bg-chalk p-9`} onSubmit={onSubmit}>
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
          <p role="alert" className={`${ui.alert} w-full`}>
            {error}
          </p>
        )}

        <button className={ui.btnCobalt} disabled={busy}>
          {busy ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
        </button>

        <p className="text-[0.95rem]">
          {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
          <Link href={isLogin ? "/register" : "/login"} className="font-bold text-cobalt">
            {isLogin ? "Criar conta" : "Entrar"}
          </Link>
        </p>
      </form>
    </main>
  );
}