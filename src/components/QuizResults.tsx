"use client";

import Avatar from "@/components/Avatar";
import { useGame } from "@/components/GameProvider";
import { scoreOf, type Player } from "@/lib/types";
import { ui } from "@/lib/ui";

type Props = { players: Player[]; scores: Record<string, number>; meId: string };

export default function QuizResults({ players, scores, meId }: Props) {
  const { closeQuiz } = useGame();

  const ranked = players
    .map((p) => ({ p, score: scoreOf(p, scores) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0]?.score ?? 0;
  const top = ranked.filter((r) => r.score === best);

  const title =
    best === 0
      ? "Ninguém pontuou"
      : top.length > 1
        ? "Empate no topo"
        : top[0].p.id === meId
          ? "Você venceu!"
          : `${top[0].p.name} venceu!`;

  return (
    <section className="flex max-w-[600px] flex-col items-start gap-8">
      <div>
        <p className="font-mono text-sm text-muted">Fim do quiz</p>
        <h1 className={`${ui.h1} mt-3`}>{title}</h1>
      </div>

      <ol className="flex w-full flex-col gap-2.5">
        {ranked.map(({ p, score }) => {
          const leader = best > 0 && score === best;
          return (
            <li
              key={p.id}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 motion-safe:animate-rise ${
                leader ? "border-accent/50 bg-accent/10" : "border-line bg-surface"
              }`}
            >
              <span className="w-[2ch] font-mono text-lg text-muted tabular-nums">
                {ranked.findIndex((r) => r.score === score) + 1}
              </span>
              <Avatar player={p} size="md" />
              <span className="min-w-0 flex-1 text-lg font-medium [overflow-wrap:anywhere]">
                {p.name}
                {p.id === meId && <span className="font-normal text-muted"> (você)</span>}
              </span>
              <span className="font-mono text-2xl tabular-nums" aria-label={`${score} pontos`}>
                {score}
              </span>
            </li>
          );
        })}
      </ol>

      <button className={ui.btnPrimary} onClick={closeQuiz}>
        Voltar para a sala
      </button>
    </section>
  );
}