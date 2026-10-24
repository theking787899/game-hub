// Chamadas direto ao servidor (sem rewrites do Next).
const base = process.env.NEXT_PUBLIC_SOCKET_URL;

const FRIENDS_URL = `${base}/user/friends`;
const INVITATIONS_URL = `${base}/user/friends/invitations`;

export type Friend = { id: string; name: string; image: string | null };

// Convite como o servidor devolve: user_id = quem convidou, friend = quem foi convidado.
export type Invitation = {
  userId: string;
  friendId: string;
  friendName: string | null;
  friendImage: string | null;
  status: string;
};

// Valores aceitos pelo PATCH de convites.
export type InvitationStatus = "accepted" | "refuse";

// Status que o PATCH grava. Qualquer outro status ainda espera resposta.
const ANSWERED: string[] = ["accepted", "refuse"];
export const isPending = (status: string) => !ANSWERED.includes(status);

export function statusLabel(status: string): string {
  if (status === "accepted") return "Aceito";
  if (status === "refuse") return "Recusado";
  return status;
}

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
    return "A resposta do servidor veio num formato que o front não reconhece.";
  }
  return fallback;
}

// A resposta pode ser a lista direta ou um objeto que carrega a lista:
// usamos a primeira lista que aparecer.
function listFrom(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    return Object.values(data).find((v): v is unknown[] => Array.isArray(v)) ?? [];
  }
  return [];
}

// Cada amigo precisa de pelo menos um `id`.
function toFriends(data: unknown): Friend[] {
  const raw = listFrom(data);
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

// Cada convite precisa de `user_id` e `status`; `friend` pode ser o id ou o objeto do usuário.
function toInvitations(data: unknown): Invitation[] {
  const raw = listFrom(data);
  const invitations = raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const o = item as Record<string, unknown>;
    if (typeof o.user_id !== "string" || typeof o.status !== "string") return [];
    const f = o.friend;
    const fo = f && typeof f === "object" ? (f as Record<string, unknown>) : null;
    return [
      {
        userId: o.user_id,
        friendId: typeof f === "string" ? f : typeof fo?.id === "string" ? fo.id : "",
        friendName: typeof fo?.name === "string" ? fo.name : null,
        friendImage: typeof fo?.image === "string" ? fo.image : null,
        status: o.status,
      },
    ];
  });

  if (raw.length > 0 && invitations.length === 0) throw new UnexpectedFormatError();
  return invitations;
}

export async function fetchFriends(): Promise<Friend[]> {
  return toFriends(await request(FRIENDS_URL));
}

export async function fetchInvitations(): Promise<Invitation[]> {
  return toInvitations(await request(INVITATIONS_URL));
}

export function sendInvitation(id: string) {
  return request(INVITATIONS_URL, { method: "POST", body: JSON.stringify({ id }) });
}

export function respondToInvitation(sendId: string, status: InvitationStatus) {
  return request(INVITATIONS_URL, { method: "PATCH", body: JSON.stringify({ sendId, status }) });
}