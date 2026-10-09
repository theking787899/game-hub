"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import TopBar from "@/components/TopBar";
import { errorText, extractRoomId } from "@/lib/types";
import { ui } from "@/lib/ui";

export default function LobbyPage() {
  const router = useRouter();
  const { user, authPending, connected, error, createRoom } = useGame();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!authPending && !user) router.replace("/login");
  }, [authPending, user, router]);

  if (authPending || !user) return <main className={ui.center}>Carregando…</main>;

  function onJoin(e: FormEvent) {
    e.preventDefault();
    const id = extractRoomId(code);
    if (id) router.push(`/room/${id}`);
  }

  return (
    <main className={ui.shell}>
      <TopBar />
      <h1 className={ui.h1}>Bora jogar, {user.name.split(" ")[0]}?</h1>
      <p className={ui.lead}>
        Crie uma sala e mande o link para o grupo, ou entre numa sala que alguém já abriu.
      </p>

      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        <section className={`${ui.panel} items-start bg-sun p-8`}>
          <h2 className={ui.h2}>Criar sala</h2>
          <p className="max-w-[36ch]">Você vira o anfitrião e convida o grupo pelo link da sala.</p>
          <button className={ui.btnInk} onClick={createRoom} disabled={!connected}>
            Criar sala
          </button>
        </section>

        <form className={`${ui.panel} items-start bg-chalk p-8`} onSubmit={onJoin}>
          <h2 className={ui.h2}>Entrar numa sala</h2>
          <label className={ui.label}>
            Código ou link da sala
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              className={ui.input}
            />
          </label>
          <button className={ui.btnCobalt} disabled={!code.trim()}>
            Entrar na sala
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className={`${ui.alert} mt-6`}>
          {errorText(error)}
        </p>
      )}
    </main>
  );
}
