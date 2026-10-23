"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";
import { useGame } from "@/components/GameProvider";
import SoundToggle from "@/components/SoundToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { ui } from "@/lib/ui";

const links = [
  { href: "/ranking", label: "Ranking" },
  { href: "/amigos", label: "Amigos" },
];

export default function TopBar() {
  const { user, connected, signOut } = useGame();
  const pathname = usePathname();

  return (
    <header className="mb-12 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-b border-line pb-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href="/" className="font-display text-[1.7rem] leading-none tracking-tight">
          Game Hub<span className="text-accent">.</span>
        </Link>
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`text-sm font-medium underline-offset-4 transition hover:text-fg ${
                active ? "text-fg underline" : "text-muted"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>

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

        <SoundToggle />
        <ThemeToggle />
        <button className={ui.btnGhost} onClick={signOut}>
          Sair
        </button>
      </div>
    </header>
  );
}