"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import TopBar from "@/components/TopBar";
import { errorText, extractRoomId } from "@/lib/types";

export default function LobbyPage() {
  const router = useRouter();
  const { user, authPending, connected, error, createRoom } = useGame();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  if (authPending || !user) return <main className="center">Carregando…</main>;

  function onJoin(e: FormEvent) {
    e.preventDefault();
    const id = extractRoomId(code);
    if (id) router.push(`/room/${id}`);
  }

  return (
    <main className="shell">
      <TopBar />
      <h1>Bora jogar, {user.name.split(" ")[0]}?</h1>
      <p className="lead">
        Crie uma sala e mande o link para o grupo, ou entre numa sala que alguém já abriu.
      </p>

      <div className="choices">
        <section className="panel sun">
          <h2>Criar sala</h2>
          <p>Você vira o anfitrião e convida o grupo pelo link da sala.</p>
          <button className="btn btn-ink" onClick={createRoom} disabled={!connected}>
            Criar sala
          </button>
        </section>

        <form className="panel chalk" onSubmit={onJoin}>
          <h2>Entrar numa sala</h2>
          <label className="field">
            Código ou link da sala
            <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
          </label>
          <button className="btn btn-cobalt" disabled={!code.trim()}>
            Entrar na sala
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="alert">
          {errorText(error)}
        </p>
      )}
    </main>
  );
}
