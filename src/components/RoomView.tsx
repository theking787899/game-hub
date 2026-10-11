"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import QuizGame from "@/components/QuizGame";
import TopBar from "@/components/TopBar";
import { errorText } from "@/lib/types";
import { ui } from "@/lib/ui";

const seatColors = ["bg-punch", "bg-sun", "bg-mint", "bg-sky", "bg-lilac"];

export default function RoomView() {
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
          <button className={ui.btnSun} onClick={leave}>
            Voltar ao início
          </button>
        </p>
      </main>
    );
  }

  if (!current) return <main className={ui.center}>Entrando na sala…</main>;

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
  const isHost = !!current.players.find((p) => p.id === user.id)?.host;

  return (
    <main className={ui.shell}>
      <TopBar />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={ui.h1}>Sala de espera</h1>
        <button className={ui.btnGhost} onClick={leave}>
          Sair da sala
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <code className="break-all rounded-[14px] bg-deep px-4 py-2.5 text-[0.95rem]">
          {current.id}
        </code>
        <button className={ui.btnSun} onClick={copyLink}>
          {copied ? "Link copiado" : "Copiar link"}
        </button>
      </div>

      <p className="mt-10 font-semibold" aria-live="polite">
        {current.players.length} de {current.maxPlayer} jogadores.{" "}
        {full ? "A sala está cheia." : "Mande o link para chamar o resto do grupo."}
      </p>

      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-5">
        {seats.map((p, i) =>
          p ? (
            <li
              key={p.id}
              className={`flex min-h-[210px] flex-col items-center justify-center gap-2.5 rounded-[32px] p-5 text-center text-ink motion-safe:animate-pop ${
                seatColors[i % 5]
              } ${i % 2 === 0 ? "-rotate-2" : "rotate-[1.5deg]"}`}
            >
              <div className="grid size-[84px] place-items-center overflow-hidden rounded-full bg-chalk font-display text-[2.4rem] font-extrabold">
                {p.avatar?.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar} alt="" className="size-full object-cover" />
                ) : (
                  p.name.trim().charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-display text-xl font-extrabold leading-tight [overflow-wrap:anywhere]">
                {p.name}
              </span>
              <span className="flex flex-wrap justify-center gap-1.5">
                <span className={ui.tag}>{p.host ? "Anfitrião" : "Jogador"}</span>
                {p.id === user.id && <span className={ui.tag}>Você</span>}
              </span>
            </li>
          ) : (
            <li
              key={`vazio-${i}`}
              className="flex min-h-[210px] items-center justify-center rounded-[32px] border-[3px] border-dashed border-chalk/55 p-5 text-center"
            >
              Vaga livre
            </li>
          ),
        )}
      </ul>

      <section className={`${ui.panel} mt-8 max-w-[520px] items-start bg-sun p-8`}>
        <h2 className={ui.h2}>Quiz</h2>
        {isHost ? (
          <>
            <p className="max-w-[36ch]">
              Perguntas de conhecimentos gerais. O primeiro a acertar ganha o ponto.
            </p>
            <button className={ui.btnInk} onClick={() => startQuiz()}>
              Começar quiz
            </button>
          </>
        ) : (
          <p>Aguardando o anfitrião começar o quiz.</p>
        )}
      </section>

      {error && (
        <p role="alert" className={`${ui.alert} mt-6`}>
          {errorText(error)}
        </p>
      )}
    </main>
  );
}