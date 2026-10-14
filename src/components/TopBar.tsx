"use client";

import Link from "next/link";
import Avatar from "@/components/Avatar";
import { useGame } from "@/components/GameProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { ui } from "@/lib/ui";

export default function TopBar() {
  const { user, connected, signOut } = useGame();

  return (
    <header className="mb-12 flex items-center justify-between gap-3 border-b border-line pb-4">
      <Link href="/" className="font-display text-[1.7rem] leading-none tracking-tight">
        Game Hub<span className="text-accent">.</span>
      </Link>

      <div className="flex items-center gap-2">
        <span role="status" className="mr-1 flex items-center gap-2 text-sm text-muted">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${connected ? "bg-good" : "bg-accent motion-safe:animate-pulse"}`}
          />
          <span className="sr-only sm:not-sr-only">{connected ? "Conectado" : "Conectando…"}</span>
        </span>

        {user && (
          <Link
            href="/perfil"
            aria-label={`Perfil de ${user.name}`}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 text-sm transition hover:bg-surface-2"
          >
            <Avatar player={{ id: user.id, name: user.name }} size="sm" />
            <span className="hidden max-w-[14ch] truncate sm:inline">{user.name}</span>
          </Link>
        )}

        <ThemeToggle />
        <button className={ui.btnGhost} onClick={signOut}>
          Sair
        </button>
      </div>
    </header>
  );
}