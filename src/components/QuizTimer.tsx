"use client";

import { useEffect, useState } from "react";

// Duração de cada pergunta no servidor. Só limita o valor mostrado:
// quem encerra a pergunta é o servidor (quiz:time-up).
export const QUESTION_TIME_MS = 15_000;

// Segundos que faltam até endsAt (timestamp em ms do Date.now() do servidor).
// Nunca passa de 15 nem fica negativo.
export function secondsLeft(endsAt: number, now: number = Date.now()): number {
  const seconds = Math.ceil((endsAt - now) / 1000);
  return Math.min(QUESTION_TIME_MS / 1000, Math.max(0, seconds));
}

export function formatClock(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

type Props = {
  endsAt: number | null; // prazo da pergunta atual
  stopped: boolean; // a pergunta já terminou: congela o contador
  timeUp: boolean; // o servidor avisou que o tempo acabou
};

// Use com key={endsAt}: cada pergunta nova recomeça o contador do zero,
// sem reaproveitar o intervalo da anterior.
export default function QuizTimer({ endsAt, stopped, timeUp }: Props) {
  const [seconds, setSeconds] = useState(() => (endsAt === null ? 0 : secondsLeft(endsAt)));

  useEffect(() => {
    if (endsAt === null || stopped) return;

    // Confere a cada 250 ms, mas o estado só muda quando o segundo mostrado muda.
    const id = window.setInterval(() => {
      const left = secondsLeft(endsAt);
      setSeconds(left);
      if (left === 0) window.clearInterval(id);
    }, 250);

    return () => window.clearInterval(id);
  }, [endsAt, stopped]);

  if (endsAt === null) return null;

  const shown = timeUp ? 0 : seconds;
  const low = shown <= 5;

  return (
    <div
      role="timer"
      aria-label="Tempo restante"
      className={`rounded-lg border px-3 py-1 font-mono text-lg tabular-nums transition-colors ${
        low ? "border-bad/40 bg-bad/15" : "border-line bg-surface"
      }`}
    >
      {formatClock(shown)}
    </div>
  );
}