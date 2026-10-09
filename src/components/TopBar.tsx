"use client";

import Link from "next/link";
import { useGame } from "@/components/GameProvider";
import { ui } from "@/lib/ui";

export default function TopBar() {
  const { user, connected, signOut } = useGame();

  return (
    <header className="mb-14 flex flex-wrap items-center justify-between gap-4">
      <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
        Game Hub
      </Link>
      <div className="flex flex-wrap items-center gap-3.5">
        <span role="status" className="inline-flex items-center gap-2 text-[0.9rem]">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${connected ? "bg-mint" : "bg-sun"}`}
          />
          {connected ? "Conectado" : "Conectando…"}
        </span>
        {user && (
          <Link href="/perfil" className="underline">
            {user.name}
          </Link>
        )}
        <button className={ui.btnGhost} onClick={signOut}>
          Sair
        </button>
      </div>
    </header>
  );
}