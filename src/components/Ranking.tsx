"use client";

import { useCallback, useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { ui } from "@/lib/ui";

// Rota do servidor (o Next encaminha para o Express, ver next.config.mjs).
const RANKING_URL = "/api/ranking";

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
      <section className={`${ui.card} flex flex-col items-start gap-5 p-6 sm:p-7`}>
        <p role="alert">Não foi possível carregar o ranking.</p>
        <button className={ui.btnSecondary} onClick={load}>
          Tentar de novo
        </button>
      </section>
    );
  }

  if (!entries) {
    return (
      <div className="flex flex-col gap-2.5 sm:gap-3" aria-busy="true" aria-label="Carregando o ranking">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-[68px] rounded-sm border border-line bg-surface motion-safe:animate-pulse sm:h-[76px]"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <section className={`${ui.card} p-6 sm:p-7`}>
        <h2 className={ui.h2}>Ainda não tem ninguém aqui</h2>
        <p className="mt-3 max-w-[44ch] text-muted">
          Jogue um quiz até o fim para entrar no ranking.
        </p>
      </section>
    );
  }

  return (
    <ol aria-label="Ranking geral" className="flex flex-col gap-2.5 sm:gap-3">
      {entries.map((e) => {
        const leader = e.position === 1;
        const mine = e.id === meId;
        const rate = e.gamesPlayed > 0 ? Math.round((e.gamesWon / e.gamesPlayed) * 100) : 0;
        const avatar = { id: e.id, name: e.name, avatar: e.image };

        return (
          <li
            key={e.id}
            className={`flex items-center gap-3 rounded-sm border p-3 motion-safe:animate-rise sm:gap-4 sm:p-4 ${
              leader ? "border-accent/50 bg-accent/10" : "border-line bg-surface"
            }`}
          >
            <span
              className={`grid size-9 flex-none place-items-center rounded-sm font-mono text-base tabular-nums sm:size-10 sm:text-lg ${
                leader ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"
              }`}
              aria-label={`${e.position}º lugar`}
            >
              {e.position}
            </span>

            {/* Foto menor no celular, maior a partir de sm. */}
            <span className="flex-none sm:hidden">
              <Avatar player={avatar} size="sm" />
            </span>
            <span className="hidden flex-none sm:block">
              <Avatar player={avatar} size="md" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-medium sm:text-lg">
                <span className="min-w-0 [overflow-wrap:anywhere]">{e.name}</span>
                {mine && <span className={ui.tagAccent}>Você</span>}
              </p>
              <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted">
                <span>{plural(e.gamesWon, "vitória", "vitórias")}</span>
                <span>{plural(e.gamesPlayed, "partida", "partidas")}</span>
                <span className="sm:hidden">{rate}%</span>
              </p>
            </div>

            <span className={`${ui.tag} hidden flex-none sm:inline-flex`}>{rate}% de vitórias</span>

            <div className="flex-none text-right">
              <p className="font-mono text-xl tabular-nums sm:text-2xl">
                {numberFormat.format(e.totalPoints)}
              </p>
              <p className="text-xs text-muted">pontos</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}