import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Background3D from "@/components/Background3D";
import GameProvider from "@/components/GameProvider";
import "./globals.css";

const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow" });
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "Game Hub",
  description: "Salas de jogos para jogar com os amigos.",
};

// Aplica o tema antes da primeira pintura (padrão: escuro, até a pessoa escolher outro).
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":true;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-[17px] text-fg antialiased">
        <Background3D />
        <div className="relative z-10">
          <GameProvider>{children}</GameProvider>
        </div>
      </body>
    </html>
  );
}