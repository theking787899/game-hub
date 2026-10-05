"use client";

import Avatar from "@/components/Avatar";
import { useGame } from "@/components/GameProvider";
import { scoreOf, type Player } from "@/lib/types";

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
    <section className="results">
      <h1>{title}</h1>
      <ol className="podium">
        {ranked.map(({ p, score }) => (
          <li key={p.id} className={`podium-row${best > 0 && score === best ? " top" : ""}`}>
            <span className="rank">{ranked.findIndex((r) => r.score === score) + 1}</span>
            <Avatar player={p} />
            <span className="who-name">
              {p.name}
              {p.id === meId ? " (você)" : ""}
            </span>
            <span className="pts" aria-label={`${score} pontos`}>
              {score}
            </span>
          </li>
        ))}
      </ol>
      <button className="btn btn-sun" onClick={closeQuiz}>
        Voltar para a sala
      </button>
    </section>
  );
}
