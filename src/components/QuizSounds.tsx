"use client";

import { useEffect } from "react";
import { playSfx, startMusic, stopMusic } from "@/lib/sound";

type Props = {
  index: number; // número da pergunta
  event: "me" | "other" | "nobody" | null; // como a pergunta terminou
  wrong: boolean; // você errou e a pergunta ainda está aberta
};

// Não desenha nada: só toca a música enquanto o quiz está na tela e os efeitos de cada resultado.
export default function QuizSounds({ index, event, wrong }: Props) {
  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (event === "me") playSfx("correct");
    if (event === "other") playSfx("other");
    if (event === "nobody") playSfx("nobody");
  }, [event, index]);

  useEffect(() => {
    if (wrong) playSfx("wrong");
  }, [wrong, index]);

  return null;
}