import type { Player } from "@/lib/types";

export default function Avatar({ player }: { player: Player }) {
  return (
    <span className="grid size-11 flex-none place-items-center overflow-hidden rounded-full bg-ink font-display text-[1.3rem] font-extrabold text-chalk">
      {player.avatar?.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.avatar} alt="" className="size-full object-cover" />
      ) : (
        player.name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}