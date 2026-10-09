import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import GameProvider from "@/components/GameProvider";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Game Hub",
  description: "Salas de jogos para jogar com os amigos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh bg-cobalt font-sans text-[1.0625rem] leading-normal text-chalk">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}