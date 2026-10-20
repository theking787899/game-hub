"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { useGame } from "@/components/GameProvider";
import QuizGame from "@/components/QuizGame";
import QuizTypeModal from "@/components/QuizTypeModal";
import TopBar from "@/components/TopBar";
import { errorText, isReady } from "@/lib/types";
import { ui } from "@/lib/ui";

export default function RoomView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { user, authPending, connected, room, error, quiz, questionCount, joinRoom, leaveRoom, createQuiz, toggleReady } =
    useGame();

  const [copied, setCopied] = useState(false);
  const [choosingType, setChoosingType] = useState(false);

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  // Entra na sala ao abrir o link ou reconectar.
  useEffect(() => {
    if (connected && user && room?.id !== id) joinRoom(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, user?.id, id]);

  function leave() {
    leaveRoom();
    router.push("/");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // O navegador pode bloquear o acesso à área de transferência.
      setCopied(false);
    }
  }

  if (authPending || !user) return <main className={ui.center}>Carregando…</main>;

  const current = room?.id === id ? room : null;

  if (!current && error) {
    return (
      <main className={ui.shell}>
        <TopBar />
        <h1 className={ui.h1}>Não deu para entrar na sala</h1>
        <p role="alert" className={`${ui.alert} mt-6`}>
          {errorText(error)}
        </p>
        <p className="mt-6">
          <button className={ui.btnPrimary} onClick={leave}>
            Voltar ao início
          </button>
        </p>
      </main>
    );
  }

  if (!current) return <main className={ui.center}>Entrando na sala…</main>;

  // Se o quiz começou, mostra o jogo.
  if (quiz) {
    return (
      <main className={ui.shell}>
        <TopBar />
        <QuizGame players={current.players} meId={user.id} />
      </main>
    );
  }

  const seats = Array.from({ length: current.maxPlayer }, (_, i) => current.players[i] ?? null);
  const full = current.players.length >= current.maxPlayer;
  const me = current.players.find((p) => p.id === user.id);
  const isHost = !!me?.host;
  const meReady = !!me && isReady(me);
  const readyCount = current.players.filter((p) => isReady(p)).length;
  const allReady = readyCount === current.players.length;
  const count = current.questionCount ?? questionCount;

  return (
    <main className={ui.shell}>
      <TopBar />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={ui.h1}>Sala de espera</h1>
        <button className={ui.btnSecondary} onClick={leave}>
          Sair da sala
        </button>
      </div>

      <div className={`${ui.card} mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 p-4`}>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">Código da sala</p>
          <code className="mt-0.5 block break-all font-mono text-sm">{current.id}</code>
        </div>
        <button className={ui.btnSecondary} onClick={copyLink}>
          {copied ? "Link copiado" : "Copiar link"}
        </button>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex items-baseline gap-3">
          <h2 className={ui.h2}>Jogadores</h2>
          <span className="font-mono text-sm text-muted">
            {current.players.length}/{current.maxPlayer}
          </span>
        </div>
        <button
          className={meReady ? ui.btnSecondary : ui.btnPrimary}
          onClick={toggleReady}
          disabled={!connected}
          aria-pressed={meReady}
        >
          {meReady ? "Cancelar pronto" : "Estou pronto"}
        </button>
      </div>
      <p className="mt-2 text-muted" aria-live="polite">
        <span className="font-mono text-fg">
          {readyCount}/{current.players.length}
        </span>{" "}
        prontos. {full ? "A sala está cheia." : "Mande o link para chamar o resto do grupo."}
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {seats.map((p, i) =>
          p ? (
            <li
              key={p.id}
              className={`flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-colors motion-safe:animate-rise ${
                isReady(p) ? "border-good/50" : "border-line"
              }`}
            >
              <Avatar player={p} size="md" />
              <div className="min-w-0">
                <p className="font-medium [overflow-wrap:anywhere]">{p.name}</p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  <span className={ui.tag}>{p.host ? "Anfitrião" : "Jogador"}</span>
                  {p.id === user.id && <span className={ui.tagAccent}>Você</span>}
                  {isReady(p) && <span className={ui.tagGood}>Pronto</span>}
                </p>
              </div>
            </li>
          ) : (
            <li
              key={`vazio-${i}`}
              className="flex items-center gap-4 rounded-2xl border border-dashed border-line p-4 text-muted"
            >
              <span className="size-12 flex-none rounded-full border border-dashed border-line" />
              Vaga livre
            </li>
          ),
        )}
      </ul>

      <section className={`${ui.card} mt-12 flex max-w-[560px] flex-col items-start gap-4 p-7`}>
        <h2 className={ui.h2}>Quiz</h2>

        {isHost ? (
          <>
            <p className="max-w-[40ch] text-muted">
              <span className="font-mono text-fg">{count}</span> perguntas de conhecimentos
              gerais. O primeiro a acertar cada uma ganha o ponto.
            </p>
            {!allReady && <p className="text-sm text-muted">Nem todos estão prontos ainda.</p>}
            <button className={`${ui.btnPrimary} mt-1`} onClick={() => setChoosingType(true)} disabled={!connected}>
              Começar quiz
            </button>
          </>
        ) : (
          <p className="text-muted">
            Aguardando o anfitrião começar o quiz
            {current.questionCount ? ` (${current.questionCount} perguntas)` : ""}.
          </p>
        )}
      </section>

      {error && (
        <p role="alert" className={`${ui.alert} mt-6`}>
          {errorText(error)}
        </p>
      )}

      <QuizTypeModal
        open={choosingType}
        questionCount={count}
        onClose={() => setChoosingType(false)}
        onConfirm={(gameType) => {
          setChoosingType(false);
          createQuiz(gameType);
        }}
      />
    </main>
  );
}