import type { Player } from "@/lib/types";

const tones = ["bg-p1", "bg-p2", "bg-p3", "bg-p4", "bg-p5"];
const sizes = {
  sm: "size-9 text-lg",
  md: "size-12 text-2xl",
  lg: "size-24 text-5xl",
};

// A mesma pessoa sempre cai no mesmo tom.
function toneFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return tones[h % tones.length];
}

export default function Avatar({
  player,
  size = "md",
}: {
  player: Pick<Player, "id" | "name" | "avatar">;
  size?: keyof typeof sizes;
}) {
  const hasImage = !!player.avatar && /^(https?:|data:)/.test(player.avatar);

  return (
    <span
      className={`grid flex-none place-items-center overflow-hidden rounded-full font-display text-[#15161a] ${sizes[size]} ${toneFor(player.id)}`}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.avatar!} alt="" className="size-full object-cover" />
      ) : (
        player.name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}