"use client";

import { useCallback, useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { ui } from "@/lib/ui";

// Rota do servidor (o Next encaminha para o Express, ver next.config.mjs).
const RANKING_URL = `${process.env.NEXT_PUBLIC_SOCKET_URL}/ranking`;

export type RankingEntry = {
  id: string;
  name: string;
  image: string | null;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  position: number;
};

const numberFormat = new Intl.NumberFormat("pt-BR");

function plural(n: number, one: string, many: string) {
  return `${numberFormat.format(n)} ${n === 1 ? one : many}`;
}

export default function Ranking({ meId }: { meId?: string }) {
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const res = await fetch(RANKING_URL, { credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      const data: { success?: boolean; ranking?: RankingEntry[] } = await res.json();
      if (data.success === false || !Array.isArray(data.ranking)) throw new Error("resposta inválida");
      setEntries([...data.ranking].sort((a, b) => a.position - b.position));
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (failed) {
    return (
      <section className={`${ui.card} flex flex-col items-start gap-5 p-7`}>
        <p role="alert">Não foi possível carregar o ranking.</p>
        <button className={ui.btnSecondary} onClick={load}>
          Tentar de novo
        </button>
      </section>
    );
  }

  if (!entries) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando o ranking">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-[76px] rounded-2xl border border-line bg-surface motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <section className={`${ui.card} p-7`}>
        <h2 className={ui.h2}>Ainda não tem ninguém aqui</h2>
        <p className="mt-3 max-w-[44ch] text-muted">
          Jogue um quiz até o fim para entrar no ranking.
        </p>
      </section>
    );
  }

  return (
    <ol aria-label="Ranking geral" className="flex flex-col gap-3">
      {entries.map((e) => {
        const leader = e.position === 1;
        const mine = e.id === meId;
        const rate = e.gamesPlayed > 0 ? Math.round((e.gamesWon / e.gamesPlayed) * 100) : 0;

        return (
          <li
            key={e.id}
            className={`flex items-center gap-4 rounded-2xl border p-4 motion-safe:animate-rise ${
              leader ? "border-accent/50 bg-accent/10" : "border-line bg-surface"
            }`}
          >
            <span
              className={`grid size-10 flex-none place-items-center rounded-lg font-mono text-lg tabular-nums ${
                leader ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"
              }`}
              aria-label={`${e.position}º lugar`}
            >
              {e.position}
            </span>

            <Avatar player={{ id: e.id, name: e.name, avatar: e.image }} size="md" />

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-medium">
                <span className="[overflow-wrap:anywhere]">{e.name}</span>
                {mine && <span className={ui.tagAccent}>Você</span>}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {plural(e.gamesWon, "vitória", "vitórias")} em{" "}
                {plural(e.gamesPlayed, "partida", "partidas")}
              </p>
            </div>

            <span className={`${ui.tag} hidden sm:inline-flex`}>{rate}% de vitórias</span>

            <div className="text-right">
              <p className="font-mono text-2xl tabular-nums">{numberFormat.format(e.totalPoints)}</p>
              <p className="text-xs text-muted">pontos</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}