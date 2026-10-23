// Rotas do servidor (o Next encaminha para o Express, ver next.config.mjs).
const base = process.env.NEXT_PUBLIC_SOCKET_URL;

const FRIENDS_URL = `${base}/api/user/friends`;
const INVITATIONS_URL = `${base}/api/user/friends/invitations`;

export type Friend = { id: string; name: string; image: string | null };

// Valores aceitos pelo PATCH de convites.
export type InvitationStatus = "accepted" | "refuse";

export class ApiError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

export class UnexpectedFormatError extends Error {
  constructor() {
    super("Formato de resposta não reconhecido");
  }
}

async function request(url: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!res.ok) throw new ApiError(res.status);
  return res.json().catch(() => null);
}

// Mensagem para a tela. Só usa o que sabemos: o código HTTP que o servidor devolveu.
export function describeError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return `${fallback} (erro ${err.status})`;
  if (err instanceof UnexpectedFormatError) {
    return "A resposta de /api/user/friends veio num formato que o front não reconhece.";
  }
  return fallback;
}

// A resposta pode ser a lista direta ou um objeto que carrega a lista:
// usamos a primeira lista que aparecer. Cada amigo precisa de pelo menos um `id`.
function toFriends(data: unknown): Friend[] {
  let raw: unknown[] = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if (data && typeof data === "object") {
    raw = Object.values(data).find((v): v is unknown[] => Array.isArray(v)) ?? [];
  }

  const friends = raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string") return [];
    return [
      {
        id: o.id,
        name: typeof o.name === "string" ? o.name : o.id,
        image: typeof o.image === "string" ? o.image : null,
      },
    ];
  });

  // Veio coisa, mas nada com `id`: melhor avisar do que mostrar "sem amigos".
  if (raw.length > 0 && friends.length === 0) throw new UnexpectedFormatError();
  return friends;
}

export async function fetchFriends(): Promise<Friend[]> {
  return toFriends(await request(FRIENDS_URL));
}

export function sendInvitation(id: string) {
  return request(INVITATIONS_URL, { method: "POST", body: JSON.stringify({ id }) });
}

export function respondToInvitation(sendId: string, status: InvitationStatus) {
  return request(INVITATIONS_URL, { method: "PATCH", body: JSON.stringify({ sendId, status }) });
}