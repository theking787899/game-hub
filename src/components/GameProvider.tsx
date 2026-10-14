
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getSocket } from "@/lib/socket";

import {
  normalizeRoom,
  type AnswerResult,
  type GameError,
  type QuizQuestion,
  type QuizState,
  type RawRoom,
  type Room,
  type ScoreEntry,
} from "@/lib/types";

const QUESTION_COUNT_KEY = "gamehub:questionCount";
export const DEFAULT_QUESTION_COUNT = 10;

type QuestionPayload = {
  question: QuizQuestion;
  questionIndex: number;
  total?: number;
};

type GameContextValue = {
  user: { id: string; name: string } | null;
  authPending: boolean;
  connected: boolean;
  room: Room | null;
  error: GameError | null;
  quiz: QuizState | null;
  questionCount: number;

  createRoom: (questionCount: number) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;

  createQuiz: () => void;
  startQuiz: () => void;
  answerQuiz: (answer: string) => void;
  closeQuiz: () => void;

  signOut: () => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame precisa estar dentro de GameProvider");
  }

  return context;
}

export default function GameProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;
  const userId = user?.id;

  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<GameError | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  // Quantidade de perguntas escolhida no modal de criar sala.
  // Fica no sessionStorage para sobreviver a um F5 do anfitrião.
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);

  useEffect(() => {
    const saved = Number(sessionStorage.getItem(QUESTION_COUNT_KEY));
    if (saved > 0) setQuestionCount(saved);
  }, []);

  // Socket e eventos recebidos do servidor.
  useEffect(() => {
    if (!userId) {
      setConnected(false);
      setRoom(null);
      setQuiz(null);
      return;
    }

    const socket = getSocket();

    const handlers = {
      connect: () => {
        setConnected(true);
        setError(null);
      },

      disconnect: () => {
        setConnected(false);
      },

      connect_error: () => {
        setConnected(false);
        setError({
          code: "CONNECTION",
          message: "Não foi possível conectar ao servidor.",
        });
      },

      "room:created": (raw: RawRoom) => {
        const createdRoom = normalizeRoom(raw);

        setRoom(createdRoom);
        setError(null);
        router.push(`/room/${createdRoom.id}`);
      },

      "room:joined": (raw: RawRoom) => {
        setRoom(normalizeRoom(raw));
        setError(null);
      },

      "room:updated": (raw: RawRoom) => {
        setRoom(normalizeRoom(raw));
      },

      "room:left": () => {
        setRoom(null);
        setQuiz(null);
      },

      "room:error": (gameError: GameError) => {
        setError(gameError);
      },

      // O servidor confirmou que o quiz foi criado.
      // Só então pedimos para iniciá-lo.
      "quiz:created": (payload: { roomId: string }) => {
        setError(null);
        socket.emit("quiz:start", {
          roomId: payload.roomId,
        });
      },

      // Primeira pergunta.
      "quiz:started": (payload: QuestionPayload) => {
        setError(null);

        setQuiz({
          phase: "question",
          question: payload.question,
          index: payload.questionIndex,
          total: payload.total,
          myAnswer: null,
          winnerId: null,
          wrongIds: [],
          roundOver: false,
          scores: {},
        });
      },

      // Perguntas seguintes.
      "quiz:next-question": (payload: QuestionPayload) => {
        setQuiz((currentQuiz) => {
          if (!currentQuiz) return currentQuiz;

          return {
            ...currentQuiz,
            phase: "question",
            question: payload.question,
            index: payload.questionIndex,
            total: payload.total ?? currentQuiz.total,
            myAnswer: null,
            winnerId: null,
            wrongIds: [],
            roundOver: false,
          };
        });
      },

      // Resultado de uma resposta.
      "quiz:answer-result": (result: AnswerResult) => {
        setQuiz((currentQuiz) => {
          if (!currentQuiz || !result.accepted) {
            return currentQuiz;
          }

          const wrongIds = result.correct
            ? currentQuiz.wrongIds
            : currentQuiz.wrongIds.includes(result.playerId)
              ? currentQuiz.wrongIds
              : [...currentQuiz.wrongIds, result.playerId];

          return {
            ...currentQuiz,
            scores: {
              ...currentQuiz.scores,
              [result.playerId]: result.score,
            },
            wrongIds,
            winnerId: result.correct
              ? result.playerId
              : currentQuiz.winnerId,
            roundOver: result.questionFinished,
          };
        });
      },

      // Fim do quiz.
      "quiz:finished": (payload: { scores: ScoreEntry[] }) => {
        setQuiz((currentQuiz) => {
          if (!currentQuiz) return currentQuiz;

          return {
            ...currentQuiz,
            phase: "finished",
            scores: Object.fromEntries(
              payload.scores.map((score) => [
                score.playerId,
                score.score,
              ])
            ),
          };
        });
      },

      "quiz:error": (payload: {
        code?: string;
        message: string;
      }) => {
        setError({
          code: payload.code ?? "QUIZ",
          message: payload.message,
        });
      },
    };

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    socket.connect();

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }

      socket.disconnect();

      setConnected(false);
      setRoom(null);
      setQuiz(null);
    };
  }, [userId, router]);

  // Criar sala.
  const createRoom = useCallback((count: number) => {
    setError(null);
    setQuestionCount(count);
    sessionStorage.setItem(QUESTION_COUNT_KEY, String(count));
    // A quantidade de perguntas vai junto com a criação da sala.
    getSocket().emit("room:create", { questionCount: count });
  }, []);

  // Entrar em sala.
  const joinRoom = useCallback((roomId: string) => {
    setError(null);
    getSocket().emit("room:join", { roomId });
  }, []);

  // Sair da sala.
  const leaveRoom = useCallback(() => {
    if (room) {
      getSocket().emit("room:leave", {
        roomId: room.id,
      });
    }

    setRoom(null);
    setQuiz(null);
    setError(null);
  }, [room]);

  // Criar quiz no servidor.
  const createQuiz = useCallback(() => {
    if (!room) return;

    setError(null);

    getSocket().emit("quiz:create", {
      roomId: room.id,
      // Prefere o valor guardado na sala pelo servidor; senão usa o escolhido no modal.
      questionCount: room.questionCount ?? questionCount,
    });
  }, [room, questionCount]);

  // Iniciar quiz.
  // Útil caso queira iniciar manualmente em outro componente.
  const startQuiz = useCallback(() => {
    if (!room) return;

    setError(null);

    getSocket().emit("quiz:start", {
      roomId: room.id,
    });
  }, [room]);

  // Enviar resposta.
  const answerQuiz = useCallback(
    (answer: string) => {
      if (!room) return;

      setQuiz((currentQuiz) =>
        currentQuiz
          ? { ...currentQuiz, myAnswer: answer }
          : currentQuiz
      );

      getSocket().emit("quiz:answer", {
        roomId: room.id,
        answer,
      });
    },
    [room]
  );

  // Fechar a interface do quiz no cliente.
  const closeQuiz = useCallback(() => {
    setQuiz(null);
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();

    setRoom(null);
    setQuiz(null);

    router.replace("/login");
  }, [router]);

  return (
    <GameContext.Provider
      value={{
        user: user
          ? {
              id: user.id,
              name: user.name,
            }
          : null,

        authPending: isPending,
        connected,
        room,
        error,
        quiz,
        questionCount,

        createRoom,
        joinRoom,
        leaveRoom,

        createQuiz,
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