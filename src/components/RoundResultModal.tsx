import Avatar from "@/components/Avatar";
import type { Player } from "@/lib/types";
import { ui } from "@/lib/ui";

type Props = {
  state: "me" | "other" | "nobody" | null;
  winner?: Player;
  score: number; // pontos do vencedor depois desta pergunta
};

// Aparece quando a pergunta termina e some sozinho quando a próxima chega.
// aria-hidden: o resultado já é anunciado pela faixa de status do QuizGame.
export default function RoundResultModal({ state, winner, score }: Props) {
  if (!state) return null;
  const mine = state === "me";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-5 backdrop-blur-sm motion-safe:animate-rise"
    >
      <div
        className={`${ui.card} flex w-full max-w-sm flex-col items-center gap-5 p-8 text-center shadow-2xl motion-safe:animate-rise ${
          mine ? "border-accent/60" : ""
        }`}
      >
        {state === "nobody" ? (
          <>
            <span className="grid size-24 place-items-center rounded-full border border-dashed border-line font-display text-5xl text-muted">
              ?
            </span>
            <div>
              <p className="font-display text-4xl leading-none tracking-tight">Ninguém acertou</p>
              <p className="mt-2 text-muted">Ninguém pontua nesta pergunta.</p>
            </div>
          </>
        ) : (
          <>
            <span className={`rounded-full p-1 ring-4 ${mine ? "ring-accent" : "ring-line"}`}>
              <Avatar player={winner ?? { id: "?", name: "?" }} size="lg" />
            </span>
            <div>
              <p className="font-display text-4xl leading-none tracking-tight [overflow-wrap:anywhere]">
                {mine ? "Você acertou!" : (winner?.name ?? "Alguém")}
              </p>
              {!mine && <p className="mt-2 text-lg text-muted">acertou primeiro</p>}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className={ui.tagAccent}>+1 ponto</span>
              {winner && (
                <span className="font-mono text-sm text-muted">
                  {score} {score === 1 ? "ponto" : "pontos"} no total
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}