import Avatar from "@/components/Avatar";
import { isPlayer, scoreOf, type Player } from "@/lib/types";
import { ui } from "@/lib/ui";

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
    <ul aria-label="Placar" className="flex flex-col gap-2">
      {rows.map(({ p, score }) => {
        const won = !!winnerId && isPlayer(p, winnerId);
        const wrong = wrongIds.some((id) => isPlayer(p, id));
        return (
          <li
            key={p.id}
            className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 ${won ? "bg-sun" : ""}`}
          >
            <Avatar player={p} />
            <span className="flex-1 font-semibold [overflow-wrap:anywhere]">
              {p.name}
              {p.id === meId ? " (você)" : ""}
            </span>
            {won && <span className={ui.tag}>Acertou</span>}
            {wrong && <span className={ui.tagBad}>Errou</span>}
            <span
              className="min-w-[1.5ch] text-right font-display text-[1.6rem] font-extrabold"
              aria-label={`${score} pontos`}
            >
              {score}
            </span>
          </li>
        );
      })}
    </ul>
  );
}