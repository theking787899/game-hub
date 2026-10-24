"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { DEFAULT_GAME_TYPE, gameTypes, type GameType } from "@/lib/gameTypes";
import { ui } from "@/lib/ui";

type Props = {
  open: boolean;
  questionCount: number;
  onClose: () => void;
  onConfirm: (gameType: GameType) => void;
};

export default function QuizTypeModal({ open, questionCount, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState<GameType>(DEFAULT_GAME_TYPE);

  // <dialog> nativo: já traz foco preso, Esc para fechar e fundo escurecido.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    onConfirm(type);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="quiz-type-title"
      className="m-auto w-[min(92vw,30rem)] rounded-sm border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="flex flex-col gap-6 p-6 sm:p-7">
        <div>
          <h2 id="quiz-type-title" className={ui.h2}>
            Tema do quiz
          </h2>
          <p className="mt-2 text-muted">
            <span className="font-mono text-fg">{questionCount}</span> perguntas. Escolha o tema que
            o grupo vai jogar.
          </p>
        </div>

        <fieldset>
          <legend className="sr-only">Tema do quiz</legend>
          <div className="grid gap-2.5 min-[480px]:grid-cols-2">
            {gameTypes.map((t) => (
              <label key={t.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="gameType"
                  value={t.value}
                  checked={type === t.value}
                  onChange={() => setType(t.value)}
                  className="peer sr-only"
                />
                <span className="block h-full rounded-sm border border-line bg-surface-2 p-4 transition hover:border-fg/30 peer-checked:border-accent peer-checked:bg-accent/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
                  <span className="block text-lg font-medium">{t.label}</span>
                  <span className="mt-0.5 block text-sm text-muted">{t.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end gap-2.5">
          <button type="button" className={ui.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={ui.btnPrimary}>
            Começar quiz
          </button>
        </div>
      </form>
    </dialog>
  );
}