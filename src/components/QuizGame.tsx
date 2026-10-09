"use client";

import { useGame } from "@/components/GameProvider";
import QuizResults from "@/components/QuizResults";
import Scoreboard from "@/components/Scoreboard";
import { errorText, findPlayer, isPlayer, type Player } from "@/lib/types";
import { ui } from "@/lib/ui";

const letters = ["A", "B", "C", "D", "E", "F"];
const optionColors = ["bg-punch", "bg-sun", "bg-mint", "bg-sky"];

type Tone = "neutral" | "good" | "bad";
const tones: Record<Tone, string> = {
  neutral: "bg-deep",
  good: "bg-mint text-ink",
  bad: "bg-punch text-ink",
};

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

  return (
    <section className="grid items-start gap-8 min-[860px]:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <p className="font-semibold">
          Pergunta {quiz.index + 1}
          {quiz.total ? ` de ${quiz.total}` : ""}
        </p>
        <h1 className="font-display text-[clamp(1.7rem,4.5vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight">
          {quiz.question.question}
        </h1>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {quiz.question.options.map((opt, i) => {
            const picked = quiz.myAnswer === opt;
            return (
              <button
                key={opt}
                disabled={locked}
                aria-pressed={picked}
                onClick={() => answerQuiz(opt)}
                className={`flex min-h-[84px] cursor-pointer items-center gap-3.5 rounded-3xl p-5 text-left text-[1.15rem] font-bold text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed ${
                  optionColors[i % 4]
                } ${picked ? "outline-4 outline-offset-[3px] outline-chalk" : "disabled:opacity-45"}`}
              >
                <span className="grid size-[38px] flex-none place-items-center rounded-full bg-ink font-display text-chalk">
                  {letters[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <p role="status" className={`rounded-2xl px-[18px] py-3.5 font-semibold ${tones[tone]}`}>
          {text}
        </p>
        {error && (
          <p role="alert" className={ui.alert}>
            {errorText(error)}
          </p>
        )}
      </div>

      <aside className={`${ui.panel} bg-chalk p-8`}>
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