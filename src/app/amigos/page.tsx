"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Friends from "@/components/Friends";
import { useGame } from "@/components/GameProvider";
import TopBar from "@/components/TopBar";
import { ui } from "@/lib/ui";

export default function AmigosPage() {
  const router = useRouter();
  const { user, authPending } = useGame();

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  if (authPending || !user) return <main className={ui.center}>Carregando…</main>;

  return (
    <main className={ui.shell}>
      <TopBar />
      <h1 className={ui.h1}>Amigos</h1>
      <p className={ui.lead}>Envie convites, responda aos que recebeu e veja quem já é seu amigo.</p>

      <div className="mt-10">
        <Friends meId={user.id} />
      </div>
    </main>
  );
}