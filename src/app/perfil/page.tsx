"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import TopBar from "@/components/TopBar";
import { ui } from "@/lib/ui";

// Rota do servidor (o Next encaminha para o Express, ver next.config.mjs).
const USER_URL = `${process.env.NEXT_PUBLIC_SOCKET_URL}/user`;

type Profile = { id: string; name: string; image?: string | null };

export default function PerfilPage() {
  const router = useRouter();
  const { user, authPending } = useGame();
  const userId = user?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const res = await fetch(USER_URL, { credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setProfile(data.user ?? data);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    if (userId) load();
  }, [userId, load]);

  async function copyId() {
    if (!profile) return;
    await navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authPending || !user) return <main className={ui.center}>Carregando…</main>;

  return (
    <main className={ui.shell}>
      <TopBar />
      <h1 className={ui.h1}>Seu perfil</h1>

      {failed ? (
        <section className="mt-10 flex flex-col items-start gap-5 rounded-[32px] bg-chalk p-9 text-ink">
          <p role="alert">Não foi possível carregar seus dados.</p>
          <button className={ui.btnCobalt} onClick={load}>
            Tentar de novo
          </button>
        </section>
      ) : !profile ? (
        <p className="mt-7">Carregando seus dados…</p>
      ) : (
        <section className="mt-10 flex flex-wrap items-center gap-8 rounded-[32px] bg-chalk p-9 text-ink">
          <div className="grid size-[140px] flex-none place-items-center overflow-hidden rounded-full border-[6px] border-sun bg-punch font-display text-[4rem] font-extrabold">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.image} alt="" className="size-full object-cover" />
            ) : (
              profile.name.trim().charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-5">
            <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.05] tracking-tight [overflow-wrap:anywhere]">
              {profile.name}
            </h2>
            <div>
              <p className="mb-2 text-[0.95rem] font-semibold">Seu ID de jogador</p>
              <div className="flex flex-wrap items-center gap-3">
                <code className="break-all rounded-xl bg-[#ebe8ff] px-3 py-2 text-[0.95rem]">
                  {profile.id}
                </code>
                <button className={ui.btnCobalt} onClick={copyId}>
                  {copied ? "ID copiado" : "Copiar ID"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <p className="mt-7">
        <Link href="/" className="underline">
          Voltar ao início
        </Link>
      </p>
    </main>
  );
}