"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Avatar from "@/components/Avatar";
import { ui } from "@/lib/ui";

// Rota do servidor (o Next encaminha para o Express, ver next.config.mjs).
const STATS_URL =  `${process.env.NEXT_PUBLIC_SOCKET_URL}/user/stats`;
const INITIAL_MATCHES = 8;

type Match = {
  match_id: number | string;
  type: string;
  gametype: string;
  players: { id: string; name: string, imagem: string}[];
};

type Stats = { totalPoints: number; gamesPlayed: number; gamesWon: number };

type StatsResponse = {
  statistics?: {
    totalPoints?: number;
    gamesPlayed?: number;
    gamesPlayerd?: number; // nome como o servidor envia hoje (com erro de digitação)
    gamesWon?: number;
  };
  matches?: Match[];
};

const numberFormat = new Intl.NumberFormat("pt-BR");
const typeLabels: Record<string, string> = { ranked: "Ranqueada", casual: "Casual" };
const gameLabels: Record<string, string> = { quiz: "Quiz" };

function StatCard({
  label,
  value,
  highlight,
  children,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        highlight ? "border-accent/50 bg-accent/10" : "border-line bg-surface"
      }`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-mono text-3xl tabular-nums">{value}</p>
      {children}
    </div>
  );
}

export default function UserStats({ meId }: { meId?: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const res = await fetch(STATS_URL, { credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      const data: StatsResponse = await res.json();
      const s = data.statistics;
      if (!s) throw new Error("resposta inválida");
      setStats({
        totalPoints: s.totalPoints ?? 0,
        gamesPlayed: s.gamesPlayed ?? s.gamesPlayerd ?? 0,
        gamesWon: s.gamesWon ?? 0,
      });
      setMatches(Array.isArray(data.matches) ? data.matches : []);
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
        <p role="alert">Não foi possível carregar suas estatísticas.</p>
        <button className={ui.btnSecondary} onClick={load}>
          Tentar de novo
        </button>
      </section>
    );
  }

  if (!stats) {
    return (
      <div aria-busy="true" aria-label="Carregando as estatísticas">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-[104px] rounded-2xl border border-line bg-surface motion-safe:animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const rate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const visible = showAll ? matches : matches.slice(0, INITIAL_MATCHES);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className={ui.h2}>Estatísticas</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard highlight label="Pontos" value={numberFormat.format(stats.totalPoints)} />
          <StatCard label="Partidas" value={numberFormat.format(stats.gamesPlayed)} />
          <StatCard label="Vitórias" value={numberFormat.format(stats.gamesWon)} />
          <StatCard label="Aproveitamento" value={`${rate}%`}>
            <div
              role="progressbar"
              aria-label="Aproveitamento"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={rate}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"
            >
              <div className="h-full rounded-full bg-accent" style={{ width: `${rate}%` }} />
            </div>
          </StatCard>
        </div>
      </section>

      <section>
        <h2 className={ui.h2}>Suas partidas</h2>

        {matches.length === 0 ? (
          <p className="mt-4 max-w-[44ch] text-muted">
            Você ainda não jogou nenhuma partida. Crie uma sala e comece um quiz.
          </p>
        ) : (
          <>
            <ul className="mt-5 flex flex-col gap-3">
              {visible.map((m) => {
                const players = m.players ?? [];
                const names = players.map((p) => (p.id === meId ? "Você" : p.name)).join(", ");
                return (
                  <li
                    key={m.match_id}
                    className={`${ui.card} flex flex-wrap items-center gap-x-4 gap-y-3 p-4`}
                  >
                    <span className="font-mono text-sm text-muted">#{m.match_id}</span>

                    <div className="flex">
                      {players.slice(0, 5).map((p) => (
                        <span key={p.id} className="-ml-2 rounded-full ring-2 ring-surface first:ml-0">
                          <Avatar player={{ id: p.id, name: p.name, avatar: p.imagem }} size="sm" />
                        </span>
                      ))}
                    </div>

                    <p className="min-w-[8rem] flex-1 [overflow-wrap:anywhere]">{names}</p>

                    <span className="flex gap-1.5">
                      <span className={ui.tag}>{typeLabels[m.type] ?? m.type}</span>
                      <span className={ui.tag}>{gameLabels[m.gametype] ?? m.gametype}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            {!showAll && matches.length > INITIAL_MATCHES && (
              <button className={`${ui.btnSecondary} mt-4`} onClick={() => setShowAll(true)}>
                Mostrar todas ({matches.length})
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}