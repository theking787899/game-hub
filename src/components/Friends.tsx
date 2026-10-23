"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Avatar from "@/components/Avatar";
import {
  describeError,
  fetchFriends,
  respondToInvitation,
  sendInvitation,
  type Friend,
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
    <p
      role="status"
      className="w-full max-w-[60ch] rounded-xl border border-good/40 bg-good/15 px-4 py-3"
    >
      {feedback.text}
    </p>
  );
}

// POST /api/user/friends/invitations  { id }
function SendInvite({ meId }: { meId: string }) {
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
    } catch (err) {
      setFeedback({ kind: "error", text: describeError(err, "Não foi possível enviar o convite.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${ui.card} flex flex-col items-start gap-4 p-6 sm:p-7`} onSubmit={submit}>
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

// PATCH /api/user/friends/invitations  { sendId, status }
function RespondInvite({ onAccepted }: { onAccepted: () => void }) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState<InvitationStatus | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function respond(status: InvitationStatus) {
    const sendId = value.trim();
    if (!sendId || pending) return;

    setPending(status);
    setFeedback(null);
    try {
      await respondToInvitation(sendId, status);
      setValue("");
      setFeedback({
        kind: "ok",
        text: status === "accepted" ? "Convite aceito." : "Convite recusado.",
      });
      if (status === "accepted") onAccepted();
    } catch (err) {
      const fallback =
        status === "accepted"
          ? "Não foi possível aceitar o convite."
          : "Não foi possível recusar o convite.";
      setFeedback({ kind: "error", text: describeError(err, fallback) });
    } finally {
      setPending(null);
    }
  }

  const blocked = !value.trim() || pending !== null;

  return (
    <form
      className={`${ui.card} flex flex-col items-start gap-4 p-6 sm:p-7`}
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className={ui.h2}>Responder a um convite</h2>
      <p className="max-w-[40ch] text-muted">
        Informe o ID de quem enviou o convite para aceitar ou recusar.
      </p>
      <label className={ui.label}>
        ID de quem enviou
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          className={ui.input}
        />
      </label>
      <FeedbackMessage feedback={feedback} />
      <div className="flex flex-wrap gap-2.5">
        <button type="button" className={ui.btnPrimary} disabled={blocked} onClick={() => respond("accepted")}>
          {pending === "accepted" ? "Aceitando…" : "Aceitar"}
        </button>
        <button type="button" className={ui.btnSecondary} disabled={blocked} onClick={() => respond("refuse")}>
          {pending === "refuse" ? "Recusando…" : "Recusar"}
        </button>
      </div>
      <p className="text-sm text-muted">
        O servidor ainda não lista os convites recebidos, por isso o ID é digitado.
      </p>
    </form>
  );
}

// GET /api/user/friends
export default function Friends({ meId }: { meId: string }) {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setFriends(await fetchFriends());
    } catch (err) {
      setLoadError(describeError(err, "Não foi possível carregar seus amigos."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-5 md:grid-cols-2">
        <SendInvite meId={meId} />
        <RespondInvite onAccepted={load} />
      </div>

      <section>
        <div className="flex items-baseline gap-3">
          <h2 className={ui.h2}>Seus amigos</h2>
          {friends && <span className="font-mono text-sm text-muted">{friends.length}</span>}
        </div>

        <div className="mt-5">
          {loadError ? (
            <div className={`${ui.card} flex flex-col items-start gap-5 p-6 sm:p-7`}>
              <p role="alert">{loadError}</p>
              <button className={ui.btnSecondary} onClick={load}>
                Tentar de novo
              </button>
            </div>
          ) : !friends ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Carregando amigos">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-[84px] rounded-2xl border border-line bg-surface motion-safe:animate-pulse"
                />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <p className="max-w-[44ch] text-muted">
              Você ainda não tem amigos. Envie um convite pelo ID do jogador.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {friends.map((f) => (
                <li
                  key={f.id}
                  className={`${ui.card} flex items-center gap-4 p-4 motion-safe:animate-rise`}
                >
                  <Avatar player={{ id: f.id, name: f.name, avatar: f.image }} size="md" />
                  <p className="min-w-0 flex-1 text-lg font-medium [overflow-wrap:anywhere]">
                    {f.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}