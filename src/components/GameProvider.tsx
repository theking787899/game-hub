"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getSocket } from "@/lib/socket";
import {
  normalizeRoom,
  type AnswerResult,
  type GameError,
  type QuizData,
  type QuizQuestion,
  type QuizState,
  type RawRoom,
  type Room,
  type ScoreEntry,
} from "@/lib/types";

type QuestionPayload = { question: QuizQuestion; questionIndex: number; total?: number };

type GameContextValue = {
  user: { id: string; name: string } | null;
  authPending: boolean;
  connected: boolean;
  room: Room | null;
  error: GameError | null;
  quiz: QuizState | null;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startQuiz: (questions: QuizData[]) => void;
  answerQuiz: (answer: string) => void;
  closeQuiz: () => void;
  signOut: () => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame precisa estar dentro de GameProvider");
  return ctx;
}

export default function GameProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const userId = user?.id;

  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<GameError | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  // Conecta o socket quando há sessão e desconecta ao sair.
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();

    const handlers = {
      connect: () => {
        setConnected(true);
        setError(null);
      },
      disconnect: () => setConnected(false),
      connect_error: () => {
        setConnected(false);
        setError({ code: "CONNECTION", message: "" });
      },
      "room:created": (raw: RawRoom) => {
        const created = normalizeRoom(raw);
        setRoom(created);
        router.push(`/room/${created.id}`);
      },
      "room:joined": (raw: RawRoom) => setRoom(normalizeRoom(raw)),
      "room:updated": (raw: RawRoom) => setRoom(normalizeRoom(raw)),
      "room:left": () => {
        setRoom(null);
        setQuiz(null);
      },
      "room:error": (e: GameError) => setError(e),

      // Quiz: eventos de pergunta fora de um quiz iniciado são ignorados.
      "quiz:started": (p: QuestionPayload) => {
        setError(null);
        setQuiz({
          phase: "question",
          question: p.question,
          index: p.questionIndex,
          total: p.total,
          myAnswer: null,
          winnerId: null,
          wrongIds: [],
          roundOver: false,
          scores: {},
        });
      },
      "quiz:next-question": (p: QuestionPayload) =>
        setQuiz((q) =>
          q && {
            ...q,
            phase: "question",
            question: p.question,
            index: p.questionIndex,
            total: p.total ?? q.total,
            myAnswer: null,
            winnerId: null,
            wrongIds: [],
            roundOver: false,
          },
        ),
      "quiz:answer-result": (r: AnswerResult) =>
        setQuiz((q) => {
          if (!q || !r.accepted) return q;
          return {
            ...q,
            scores: { ...q.scores, [r.playerId]: r.score },
            wrongIds: r.correct ? q.wrongIds : [...q.wrongIds, r.playerId],
            winnerId: r.correct ? r.playerId : q.winnerId,
            roundOver: r.questionFinished,
          };
        }),
      "quiz:finished": (p: { scores: ScoreEntry[] }) =>
        setQuiz((q) =>
          q && {
            ...q,
            phase: "finished",
            scores: Object.fromEntries(p.scores.map((s) => [s.playerId, s.score])),
          },
        ),
      "quiz:error": (e: { message: string }) => setError({ code: "QUIZ", message: e.message }),
    };

    for (const [event, fn] of Object.entries(handlers)) socket.on(event, fn);
    socket.connect();

    return () => {
      for (const [event, fn] of Object.entries(handlers)) socket.off(event, fn);
      socket.disconnect();
      setConnected(false);
      setRoom(null);
      setQuiz(null);
    };
  }, [userId, router]);

  const createRoom = useCallback(() => {
    setError(null);
    getSocket().emit("room:create");
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    setError(null);
    getSocket().emit("room:join", { roomId });
  }, []);

  const leaveRoom = useCallback(() => {
    if (room) getSocket().emit("room:leave", { roomId: room.id });
    setRoom(null);
    setQuiz(null);
    setError(null);
  }, [room]);

  const startQuiz = useCallback(
    () => {
      if (!room) return;
      setError(null);
      getSocket().emit("quiz:start", { roomId: room.id});
    },
    [room],
  );

  const answerQuiz = useCallback(
    (answer: string) => {
      if (!room) return;
      setQuiz((q) => q && { ...q, myAnswer: answer });
      getSocket().emit("quiz:answer", { roomId: room.id, answer });
    },
    [room],
  );

  const closeQuiz = useCallback(() => setQuiz(null), []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    router.replace("/login");
  }, [router]);

  return (
    <GameContext.Provider
      value={{
        user: user ? { id: user.id, name: user.name } : null,
        authPending: isPending,
        connected,
        room,
        error,
        quiz,
        createRoom,
        joinRoom,
        leaveRoom,
        startQuiz,
        answerQuiz,
        closeQuiz,
        signOut,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
