export type Player = {
  id: string;
  connectionId?: string;
  name: string;
  avatar?: string | null;
  host?: boolean;
};

export type Room = {
  id: string;
  maxPlayer: number;
  status: string;
  players: Player[];
};

export type GameError = { code: string; message: string };

export type RawRoom = {
  id: string;
  maxPlayer?: number;
  status?: string;
  host?: Player;
  players?: Player[] | Record<string, Player>;
};

// Um Map serializado vira {}, então sem players na lista usamos o anfitrião.
export function normalizeRoom(raw: RawRoom): Room {
  const list = Array.isArray(raw.players) ? raw.players : Object.values(raw.players ?? {});
  const players = list.length > 0 ? list : raw.host ? [raw.host] : [];
  return { id: raw.id, maxPlayer: raw.maxPlayer ?? 5, status: raw.status ?? "LOBBY", players };
}

export function errorText(e: GameError): string {
  switch (e.code) {
    case "ROOM_NOT_FOUND":
      return "Não encontramos essa sala. Confira o código ou peça um link novo.";
    case "ROOM_IS_FULL":
      return "Essa sala já está cheia.";
    case "CONNECTION":
      return "Sem conexão com o servidor de jogos. Confira se ele está rodando.";
    case "INTERNAL_ERROR":
      return "Algo deu errado no servidor. Tente de novo.";
    default:
      return e.message;
  }
}

// Aceita o código puro ou o link inteiro da sala.
export function extractRoomId(input: string): string {
  return input.trim().split("?")[0].split("/").filter(Boolean).pop() ?? "";
}

// ---------- Quiz ----------

// Formato assumido de QuizData (types/Quiz.ts do servidor): ajuste aqui se os nomes forem outros.
export type QuizData = { question: string; options: string[]; correctAnswer: string };
export type QuizQuestion = Pick<QuizData, "question" | "options">;

export type AnswerResult = {
  accepted: boolean;
  correct: boolean;
  questionFinished: boolean;
  playerId: string;
  score: number;
};

export type ScoreEntry = { playerId: string; score: number };

export type QuizState = {
  phase: "question" | "finished";
  question: QuizQuestion;
  index: number;
  total?: number;
  myAnswer: string | null;
  winnerId: string | null;
  wrongIds: string[];
  roundOver: boolean;
  scores: Record<string, number>;
};

// O servidor identifica o jogador por connectionId ou por id de usuário: aceitamos os dois.
export function isPlayer(p: Player, playerId: string): boolean {
  return p.id === playerId || p.connectionId === playerId;
}

export function findPlayer(players: Player[], playerId: string): Player | undefined {
  return players.find((p) => isPlayer(p, playerId));
}

export function scoreOf(p: Player, scores: Record<string, number>): number {
  return scores[p.connectionId ?? ""] ?? scores[p.id] ?? 0;
}
