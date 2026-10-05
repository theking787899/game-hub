"use client";

import { useGame } from "@/components/GameProvider";
import QuizResults from "@/components/QuizResults";
import Scoreboard from "@/components/Scoreboard";
import { errorText, findPlayer, isPlayer, type Player } from "@/lib/types";

const letters = ["A", "B", "C", "D", "E", "F"];

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

  let tone = "";
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
    <section className="quiz">
      <div className="quiz-main">
        <p className="progress">
          Pergunta {quiz.index + 1}
          {quiz.total ? ` de ${quiz.total}` : ""}
        </p>
        <h1 className="q-text">{quiz.question.question}</h1>

        <div className="options">
          {quiz.question.options.map((opt, i) => (
            <button
              key={opt}
              className={`option o${i % 4}${quiz.myAnswer === opt ? " picked" : ""}`}
              disabled={locked}
              aria-pressed={quiz.myAnswer === opt}
              onClick={() => answerQuiz(opt)}
            >
              <span className="letter">{letters[i]}</span>
              {opt}
            </button>
          ))}
        </div>

        <p role="status" className={`banner ${tone}`}>
          {text}
        </p>
        {error && (
          <p role="alert" className="alert">
            {errorText(error)}
          </p>
        )}
      </div>

      <aside className="panel chalk quiz-side">
        <h2>Placar</h2>
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
