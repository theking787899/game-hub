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
    <ul aria-label="Placar" className="flex flex-col gap-1.5">
      {rows.map(({ p, score }) => {
        const won = !!winnerId && isPlayer(p, winnerId);
        const wrong = wrongIds.some((id) => isPlayer(p, id));
        return (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-sm px-2.5 py-2 transition-colors ${won ? "bg-accent/15" : ""}`}
          >
            <Avatar player={p} size="sm" />
            <span className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">
              {p.name}
              {p.id === meId && <span className="font-normal text-muted"> (você)</span>}
            </span>
            {won && <span className={ui.tagGood}>Acertou</span>}
            {wrong && <span className={ui.tagBad}>Errou</span>}
            <span className="min-w-[2ch] text-right font-mono text-xl tabular-nums" aria-label={`${score} pontos`}>
              {score}
            </span>
          </li>
        );
      })}
    </ul>
  );
}