"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ui } from "@/lib/ui";

const options = [5, 10, 15, 20];

type Props = {
  open: boolean;
  defaultCount: number;
  onClose: () => void;
  onConfirm: (questionCount: number) => void;
};

export default function CreateRoomModal({ open, defaultCount, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [count, setCount] = useState(defaultCount);

  // <dialog> nativo: já traz foco preso, Esc para fechar e fundo escurecido.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setCount(defaultCount);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    onConfirm(count);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="create-room-title"
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="flex flex-col gap-6 p-6 sm:p-7">
        <div>
          <h2 id="create-room-title" className={ui.h2}>
            Nova sala
          </h2>
          <p className="mt-2 text-muted">
            Escolha quantas perguntas o quiz vai ter. O primeiro a acertar cada uma ganha o ponto.
          </p>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">Quantidade de perguntas</legend>
          <div className="grid grid-cols-4 gap-2">
            {options.map((n) => (
              <label key={n} className="cursor-pointer">
                <input
                  type="radio"
                  name="questionCount"
                  value={n}
                  checked={count === n}
                  onChange={() => setCount(n)}
                  className="peer sr-only"
                />
                <span className="block rounded-xl border border-line bg-surface-2 py-3 text-center font-mono text-lg transition hover:border-fg/30 peer-checked:border-accent peer-checked:bg-accent/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
                  {n}
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
            Criar sala
          </button>
        </div>
      </form>
    </dialog>
  );
}