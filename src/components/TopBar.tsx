"use client";

import Link from "next/link";
import { useGame } from "@/components/GameProvider";

export default function TopBar() {
  const { user, connected, signOut } = useGame();

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        Game Hub
      </Link>
      <div className="who">
        <span className={`status ${connected ? "on" : ""}`} role="status">
          {connected ? "Conectado" : "Conectando…"}
        </span>
        {user && <span>{user.name}</span>}
        <button className="btn btn-ghost" onClick={signOut}>
          Sair
        </button>
      </div>
    </header>
  );
}
