// Combinações de classes Tailwind usadas em várias telas.
const btn =
  "cursor-pointer rounded-full px-6 py-3 font-bold transition-transform enabled:active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";
const heading = "font-display font-extrabold leading-[1.05] tracking-tight";

export const ui = {
  shell: "mx-auto w-full max-w-[1080px] px-5 pb-14 pt-5",
  center: "grid min-h-dvh place-items-center text-center",
  h1: `${heading} text-[clamp(2.4rem,7vw,4.25rem)]`,
  h2: `${heading} text-[1.75rem]`,
  lead: "mt-4 max-w-[52ch] text-xl",

  btnInk: `${btn} bg-ink text-chalk`,
  btnCobalt: `${btn} bg-cobalt text-chalk`,
  btnSun: `${btn} bg-sun text-ink`,
  btnGhost:
    "cursor-pointer rounded-full border-2 border-current px-4 py-1.5 font-bold transition-transform active:translate-y-0.5",

  // Painel sem padding nem alinhamento: cada tela define os seus.
  panel: "flex flex-col gap-4 rounded-[28px] text-ink",
  label: "flex w-full flex-col gap-1.5 font-semibold",
  input:
    "rounded-[14px] border-2 border-[#c9c4ee] bg-white px-3.5 py-3 font-normal text-ink focus-visible:border-cobalt focus-visible:outline-cobalt focus-visible:outline-offset-0",
  alert: "max-w-[60ch] rounded-2xl border-l-8 border-punch bg-ink px-[18px] py-3.5 text-chalk",

  tag: "rounded-full bg-ink px-3 py-0.5 text-[0.85rem] font-semibold text-chalk",
  tagBad: "rounded-full bg-punch px-3 py-0.5 text-[0.85rem] font-semibold text-ink",
};