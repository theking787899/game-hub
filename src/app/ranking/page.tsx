"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import Ranking from "@/components/Ranking";
import TopBar from "@/components/TopBar";
import { ui } from "@/lib/ui";

export default function RankingPage() {
  const router = useRouter();
  const { user, authPending } = useGame();

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  if (authPending || !user) return <main className={ui.center}>Carregando…</main>;

  return (
    <main className={ui.shell}>
      <TopBar />
      <h1 className={ui.h1}>Ranking</h1>
      <p className={ui.lead}>Os jogadores com mais pontos acumulados nos quizzes.</p>

      <div className="mt-10">
        <Ranking meId={user.id} />
      </div>
    </main>
  );
}