"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Avatar from "@/components/Avatar";
import {
  describeError,
  fetchFriends,
  fetchInvitations,
  isPending,
  respondToInvitation,
  sendInvitation,
  statusLabel,
  type Friend,
  type Invitation,
  type InvitationStatus,
} from "@/lib/friends-api";
import { ui } from "@/lib/ui";

type Feedback = { kind: "ok" | "error"; text: string } | null;

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  if (feedback.kind === "error") {
    return (
      <p role="alert" className={`${ui.alert} w-full`}>
        {feedback.text}
      </p>
    );
  }
  return (
    <p role="status" className="w-full max-w-[60ch] rounded-sm border border-good/40 bg-good/15 px-4 py-3">
      {feedback.text}
    </p>
  );
}

// POST /user/friends/invitations  { id }
function SendInvite({ meId, onSent }: { meId: string; onSent: () => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const id = value.trim();
    if (!id || busy) return;
    if (id === meId) {
      setFeedback({ kind: "error", text: "Esse é o seu próprio ID." });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await sendInvitation(id);
      setValue("");
      setFeedback({ kind: "ok", text: "Convite enviado." });
      onSent();
    } catch (err) {
      setFeedback({ kind: "error", text: describeError(err, "Não foi possível enviar o convite.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${ui.card} flex max-w-[560px] flex-col items-start gap-4 p-6 sm:p-7`} onSubmit={submit}>
      <h2 className={ui.h2}>Adicionar amigo</h2>
      <p className="max-w-[40ch] text-muted">
        Cole o ID do jogador. Ele aparece no perfil dele, ao lado de “Copiar ID”.
      </p>
      <label className={ui.label}>
        ID do jogador
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          className={ui.input}
        />
      </label>
      <FeedbackMessage feedback={feedback} />
      <button className={ui.btnPrimary} disabled={busy || !value.trim()}>
        {busy ? "Enviando…" : "Enviar convite"}
      </button>
    </form>
  );
}

// PATCH /user/friends/invitations  { sendId: user_id, status }
function ReceivedInvite({ invite, onAnswered }: { invite: Invitation; onAnswered: (s: InvitationStatus) => void }) {
  const [pending, setPending] = useState<InvitationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function answer(status: InvitationStatus) {
    if (pending) return;
    setPending(status);
    setError(null);
    try {
      await respondToInvitation(invite.userId, status);
      onAnswered(status);
    } catch (err) {
      const fallback =
        status === "accepted" ? "Não foi possível aceitar o convite." : "Não foi possível recusar o convite.";
      setError(describeError(err, fallback));
    } finally {
      setPending(null);
    }
  }

  return (
    <li className={`${ui.card} flex flex-wrap items-center gap-x-4 gap-y-3 p-4 motion-safe:animate-rise`}>
      <Avatar player={{ id: invite.userId, name: "?" }} size="md" />
      <div className="min-w-[10rem] flex-1">
        <p className="font-medium">Convite recebido</p>
        <p className="font-mono text-sm text-muted [overflow-wrap:anywhere]">{invite.userId}</p>
      </div>
      <div className="flex gap-2.5">
        <button className={ui.btnPrimary} disabled={pending !== null} onClick={() => answer("accepted")}>
          {pending === "accepted" ? "Aceitando…" : "Aceitar"}
        </button>
        <button className={ui.btnSecondary} disabled={pending !== null} onClick={() => answer("refuse")}>
          {pending === "refuse" ? "Recusando…" : "Recusar"}
        </button>
      </div>
      {error && (
        <p role="alert" className={`${ui.alert} w-full`}>
          {error}
        </p>
      )}
    </li>
  );
}

export default function Friends({ meId }: { meId: string }) {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setFriendsError(null);
    try {
      setFriends(await fetchFriends());
    } catch (err) {
      setFriendsError(describeError(err, "Não foi possível carregar seus amigos."));
    }
  }, []);

  const loadInvitations = useCallback(async () => {
    setInvitationsError(null);
    try {
      setInvitations(await fetchInvitations());
    } catch (err) {
      setInvitationsError(describeError(err, "Não foi possível carregar os convites."));
    }
  }, []);

  useEffect(() => {
    loadFriends();
    loadInvitations();
  }, [loadFriends, loadInvitations]);

  // user_id === eu: convite que eu enviei. Os outros chegaram para mim.
  const received = (invitations ?? []).filter((i) => i.userId !== meId && isPending(i.status));
  const sent = (invitations ?? []).filter((i) => i.userId === meId);

  const answered = (status: InvitationStatus) => {
    loadInvitations();
    if (status === "accepted") loadFriends();
  };

  return (
    <div className="flex flex-col gap-12">
      <SendInvite meId={meId} onSent={loadInvitations} />

      <section>
        <div className="flex items-baseline gap-3">
          <h2 className={ui.h2}>Convites recebidos</h2>
          {invitations && <span className="font-mono text-sm text-muted">{received.length}</span>}
        </div>
        <div className="mt-5">
          {invitationsError ? (
            <div className={`${ui.card} flex flex-col items-start gap-5 p-6 sm:p-7`}>
              <p role="alert">{invitationsError}</p>
              <button className={ui.btnSecondary} onClick={loadInvitations}>
                Tentar de novo
              </button>
            </div>
          ) : !invitations ? (
            <p className="text-muted">Carregando convites…</p>
          ) : received.length === 0 ? (
            <p className="text-muted">Nenhum convite esperando resposta.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {received.map((i) => (
                <ReceivedInvite key={i.userId} invite={i} onAnswered={answered} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {sent.length > 0 && (
        <section>
          <h2 className={ui.h2}>Convites enviados</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {sent.map((i) => (
              <li key={`${i.friendId}-${i.status}`} className={`${ui.card} flex items-center gap-4 p-4`}>
                <Avatar
                  player={{ id: i.friendId || "?", name: i.friendName ?? "?", avatar: i.friendImage }}
                  size="md"
                />
                <p className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">
                  {i.friendName ?? (i.friendId || "Jogador")}
                </p>
                <span className={ui.tag}>{statusLabel(i.status)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-baseline gap-3">
          <h2 className={ui.h2}>Seus amigos</h2>
          {friends && <span className="font-mono text-sm text-muted">{friends.length}</span>}
        </div>
        <div className="mt-5">
          {friendsError ? (
            <div className={`${ui.card} flex flex-col items-start gap-5 p-6 sm:p-7`}>
              <p role="alert">{friendsError}</p>
              <button className={ui.btnSecondary} onClick={loadFriends}>
                Tentar de novo
              </button>
            </div>
          ) : !friends ? (
            <p className="text-muted">Carregando amigos…</p>
          ) : friends.length === 0 ? (
            <p className="max-w-[44ch] text-muted">
              Você ainda não tem amigos. Envie um convite pelo ID do jogador.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {friends.map((f) => (
                <li key={f.id} className={`${ui.card} flex items-center gap-4 p-4 motion-safe:animate-rise`}>
                  <Avatar player={{ id: f.id, name: f.name, avatar: f.image }} size="md" />
                  <p className="min-w-0 flex-1 text-lg font-medium [overflow-wrap:anywhere]">{f.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}