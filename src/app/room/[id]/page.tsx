"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import QuizGame from "@/components/QuizGame";
import TopBar from "@/components/TopBar";
import { errorText } from "@/lib/types";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, authPending, connected, room, error, quiz, joinRoom, leaveRoom, startQuiz } =
    useGame();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  // Entra na sala do link (também ao recarregar a página ou reconectar).
  useEffect(() => {
    if (connected && user && room?.id !== id) joinRoom(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, user?.id, id]);

  function leave() {
    leaveRoom();
    router.push("/");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authPending || !user) return <main className="center">Carregando…</main>;

  const current = room?.id === id ? room : null;

  if (!current && error) {
    return (
      <main className="shell">
        <TopBar />
        <h1>Não deu para entrar na sala</h1>
        <p role="alert" className="alert">
          {errorText(error)}
        </p>
        <p style={{ marginTop: 24 }}>
          <button className="btn btn-sun" onClick={leave}>
            Voltar ao início
          </button>
        </p>
      </main>
    );
  }

  if (!current) return <main className="center">Entrando na sala…</main>;

  if (quiz) {
    return (
      <main className="shell">
        <TopBar />
        <QuizGame players={current.players} meId={user.id} />
      </main>
    );
  }

  const seats = Array.from({ length: current.maxPlayer }, (_, i) => current.players[i] ?? null);
  const full = current.players.length >= current.maxPlayer;
  const isHost = !!current.players.find((p) => p.id === user.id)?.host;

  return (
    <main className="shell">
      <TopBar />
      <div className="room-head">
        <h1>Sala de espera</h1>
        <button className="btn btn-ghost" onClick={leave}>
          Sair da sala
        </button>
      </div>

      <div className="code">
        <code>{current.id}</code>
        <button className="btn btn-sun" onClick={copyLink}>
          {copied ? "Link copiado" : "Copiar link"}
        </button>
      </div>

      <p className="count" aria-live="polite">
        {current.players.length} de {current.maxPlayer} jogadores.{" "}
        {full ? "A sala está cheia." : "Mande o link para chamar o resto do grupo."}
      </p>

      <ul className="seats">
        {seats.map((p, i) =>
          p ? (
            <li key={p.id} className="seat filled">
              <div className="avatar">
                {p.avatar?.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar} alt="" />
                ) : (
                  p.name.trim().charAt(0).toUpperCase()
                )}
              </div>
              <span className="name">{p.name}</span>
              <span className="tags">
                <span className="tag">{p.host ? "Anfitrião" : "Jogador"}</span>
                {p.id === user.id && <span className="tag">Você</span>}
              </span>
            </li>
          ) : (
            <li key={`vazio-${i}`} className="seat empty">
              Vaga livre
            </li>
          ),
        )}
      </ul>

      <section className="panel sun start">
        <h2>Quiz</h2>
        {isHost ? (
          <>
            <p>Perguntas de conhecimentos gerais. O primeiro a acertar ganha o ponto.</p>
            <button className="btn btn-ink" onClick={() => startQuiz()}>
              Começar quiz
            </button>
          </>
        ) : (
          <p>Aguardando o anfitrião começar o quiz.</p>
        )}
      </section>

      {error && (
        <p role="alert" className="alert">
          {errorText(error)}
        </p>
      )}
    </main>
  );
}
