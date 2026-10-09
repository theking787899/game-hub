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
    <section className="flex max-w-[560px] flex-col items-start gap-7">
      <h1 className={ui.h1}>{title}</h1>
      <ol className="flex w-full flex-col gap-2.5">
        {ranked.map(({ p, score }) => (
          <li
            key={p.id}
            className={`flex items-center gap-3.5 rounded-[22px] px-[18px] py-3.5 text-ink ${
              best > 0 && score === best ? "bg-sun" : "bg-chalk"
            }`}
          >
            <span className="w-[1.5ch] font-display text-[1.6rem] font-extrabold">
              {ranked.findIndex((r) => r.score === score) + 1}
            </span>
            <Avatar player={p} />
            <span className="flex-1 font-semibold [overflow-wrap:anywhere]">
              {p.name}
              {p.id === meId ? " (você)" : ""}
            </span>
            <span
              className="min-w-[1.5ch] text-right font-display text-[1.6rem] font-extrabold"
              aria-label={`${score} pontos`}
            >
              {score}
            </span>
          </li>
        ))}
      </ol>
      <button className={ui.btnSun} onClick={closeQuiz}>
        Voltar para a sala
      </button>
    </section>
  );
}