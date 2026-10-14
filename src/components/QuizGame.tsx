"use client";

import { useGame } from "@/components/GameProvider";
import QuizResults from "@/components/QuizResults";
import Scoreboard from "@/components/Scoreboard";
import { errorText, findPlayer, isPlayer, type Player } from "@/lib/types";
import { ui } from "@/lib/ui";

const letters = ["A", "B", "C", "D", "E", "F"];

type Tone = "neutral" | "good" | "bad";
const tones: Record<Tone, string> = {
  neutral: "border-line bg-surface",
  good: "border-good/40 bg-good/15",
  bad: "border-bad/40 bg-bad/15",
};
const dots: Record<Tone, string> = { neutral: "bg-muted", good: "bg-good", bad: "bg-bad" };

export default function QuizGame({ players, meId }: { players: Player[]; meId: string }) {
  const { quiz, answerQuiz, error } = useGame();
  if (!quiz) return null;

  if (quiz.phase === "finished") {
    return <QuizResults players={players} scores={quiz.scores} meId={meId} />;
  }

  const me = players.find((p) => p.id === meId);
  const winner = quiz.winnerId ? findPlayer(players, quiz.winnerId) : undefined;
  const iWon = !!me && !!quiz.winnerId && isPlayer(me, quiz.winnerId);
  const iWasWrong = !!me && quiz.wrongIds.some((id) => isPlayer(me, id));
  const locked = quiz.myAnswer !== null || quiz.roundOver;

  let tone: Tone = "neutral";
  let text = "Escolha uma resposta. Só o primeiro a acertar ganha o ponto.";
  if (iWon) {
    tone = "good";
    text = "Você acertou! +1 ponto. Próxima pergunta em instantes.";
  } else if (quiz.winnerId) {
    text = `${winner?.name ?? "Alguém"} acertou primeiro. Próxima pergunta em instantes.`;
  } else if (quiz.roundOver) {
    text = "Ninguém acertou. Próxima pergunta em instantes.";
  } else if (iWasWrong) {
    tone = "bad";
    text = "Resposta errada. Você não pode tentar de novo nesta pergunta.";
  } else if (quiz.myAnswer) {
    text = "Resposta enviada. Aguardando o resultado…";
  }

  const current = quiz.index + 1;

  return (
    <section className="grid items-start gap-8 min-[900px]:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm text-muted">
            Pergunta {current}
            {quiz.total ? ` de ${quiz.total}` : ""}
          </p>
          {quiz.total ? (
            <div
              role="progressbar"
              aria-label="Progresso do quiz"
              aria-valuemin={1}
              aria-valuemax={quiz.total}
              aria-valuenow={current}
              className="h-1 w-full overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${(current / quiz.total) * 100}%` }}
              />
            </div>
          ) : null}
        </div>

        <h1 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-normal leading-[1.08] tracking-tight">
          {quiz.question.question}
        </h1>

        <div className="grid gap-3 min-[640px]:grid-cols-2">
          {quiz.question.options.map((opt, i) => {
            const picked = quiz.myAnswer === opt;
            return (
              <button
                key={opt}
                disabled={locked}
                aria-pressed={picked}
                onClick={() => answerQuiz(opt)}
                className={`flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 text-left text-lg font-medium transition enabled:hover:border-fg/40 enabled:hover:bg-surface-2 disabled:cursor-not-allowed ${
                  picked ? "border-accent bg-accent/10" : "border-line bg-surface disabled:opacity-50"
                }`}
              >
                <span
                  className={`grid size-8 flex-none place-items-center rounded-lg font-mono text-sm ${
                    picked ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"
                  }`}
                >
                  {letters[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <p role="status" className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${tones[tone]}`}>
          <span aria-hidden="true" className={`size-2 flex-none rounded-full ${dots[tone]}`} />
          {text}
        </p>
        {error && (
          <p role="alert" className={ui.alert}>
            {errorText(error)}
          </p>
        )}
      </div>

      <aside className={`${ui.card} flex flex-col gap-4 p-5`}>
        <h2 className={ui.h2}>Placar</h2>
        <Scoreboard
          players={players}
          scores={quiz.scores}
          meId={meId}
          winnerId={quiz.winnerId}
          wrongIds={quiz.wrongIds}
        />
      </aside>
    </section>
  );
}