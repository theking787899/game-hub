import Avatar from "@/components/Avatar";
import { isPlayer, scoreOf, type Player } from "@/lib/types";

type Props = {
  players: Player[];
  scores: Record<string, number>;
  meId: string;
  winnerId?: string | null;
  wrongIds?: string[];
};

export default function Scoreboard({ players, scores, meId, winnerId, wrongIds = [] }: Props) {
  const rows = players
    .map((p) => ({ p, score: scoreOf(p, scores) }))
    .sort((a, b) => b.score - a.score);

  return (
    <ul className="board" aria-label="Placar">
      {rows.map(({ p, score }) => {
        const won = !!winnerId && isPlayer(p, winnerId);
        const wrong = wrongIds.some((id) => isPlayer(p, id));
        return (
          <li key={p.id} className={`row${won ? " won" : ""}`}>
            <Avatar player={p} />
            <span className="who-name">
              {p.name}
              {p.id === meId ? " (você)" : ""}
            </span>
            {won && <span className="tag">Acertou</span>}
            {wrong && <span className="tag tag-bad">Errou</span>}
            <span className="pts" aria-label={`${score} pontos`}>
              {score}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
