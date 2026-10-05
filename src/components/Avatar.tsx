import type { Player } from "@/lib/types";

export default function Avatar({ player }: { player: Player }) {
  return (
    <span className="avatar sm">
      {player.avatar?.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.avatar} alt="" />
      ) : (
        player.name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}
