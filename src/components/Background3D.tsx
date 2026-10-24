"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Three.js só carrega no navegador, depois da página.
const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

// Na sala e no quiz o fundo fica mais discreto para não atrapalhar a leitura.
export default function Background3D() {
  const dim = usePathname().startsWith("/room");
  return <Scene3D dim={dim} />;
}
