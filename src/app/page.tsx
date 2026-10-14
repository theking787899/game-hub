"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import CreateRoomModal from "@/components/CreateRoomModal";
import { useGame } from "@/components/GameProvider";
import TopBar from "@/components/TopBar";
import { errorText, extractRoomId } from "@/lib/types";
import { ui } from "@/lib/ui";

export default function LobbyPage() {
  const router = useRouter();
  const { user, authPending, connected, error, createRoom, questionCount } = useGame();
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);

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

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <section className={`${ui.card} flex flex-col items-start gap-4 p-7`}>
          <h2 className={ui.h2}>Criar sala</h2>
          <p className="max-w-[36ch] text-muted">
            Você vira o anfitrião, escolhe o tamanho do quiz e convida o grupo pelo link.
          </p>
          <button
            className={`${ui.btnPrimary} mt-2`}
            onClick={() => setCreating(true)}
            disabled={!connected}
          >
            Criar sala
          </button>
        </section>

        <form className={`${ui.card} flex flex-col items-start gap-4 p-7`} onSubmit={onJoin}>
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
          <button className={ui.btnSecondary} disabled={!code.trim()}>
            Entrar na sala
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className={`${ui.alert} mt-6`}>
          {errorText(error)}
        </p>
      )}

      <CreateRoomModal
        open={creating}
        defaultCount={questionCount}
        onClose={() => setCreating(false)}
        onConfirm={(n) => {
          setCreating(false);
          createRoom(n);
        }}
      />
    </main>
  );
}