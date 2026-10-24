// Combinações de classes Tailwind usadas em várias telas.
// Cantos cortados (chanfro) via clip-path: o foco do teclado fica por dentro para não ser cortado.
const cut = "[clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]";
const btn = `inline-flex cursor-pointer items-center justify-center gap-2 px-6 py-3 font-display text-lg font-extrabold uppercase italic tracking-wide transition enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 focus-visible:-outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 ${cut}`;
const title = "font-display font-black italic uppercase tracking-tight";
const tag = "inline-flex items-center rounded-sm border px-2 py-0.5 font-display text-[0.8rem] font-bold uppercase tracking-wider";

export const ui = {
  shell: "mx-auto w-full max-w-[1080px] px-5 pb-16 pt-5",
  center: "grid min-h-dvh place-items-center text-center text-muted",
  h1: `${title} text-[clamp(3rem,9vw,6rem)] leading-[0.9]`,
  h2: `${title} text-[2.25rem] leading-none`,
  lead: "mt-4 max-w-[50ch] text-lg text-muted",

  card: "border-t-2 border-accent bg-surface [clip-path:polygon(0_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%)]",

  btnPrimary: `${btn} bg-accent text-accent-fg hover:brightness-110`,
  btnSecondary: `${btn} bg-surface-2 text-fg hover:bg-line`,
  btnGhost: `${btn} text-muted hover:bg-surface-2 hover:text-fg`,

  label: "flex w-full flex-col gap-1.5 font-display text-base font-bold uppercase tracking-wider text-muted",
  input:
    "w-full rounded-sm border-2 border-line bg-surface-2 px-3.5 py-2.5 font-sans text-base font-normal normal-case tracking-normal text-fg placeholder:text-muted/70 focus-visible:border-accent",
  alert: "max-w-[60ch] rounded-sm border-l-4 border-bad bg-bad/15 px-4 py-3 text-fg",

  tag: `${tag} border-line bg-surface-2 text-muted`,
  tagAccent: `${tag} border-accent/60 bg-accent/15 text-fg`,
  tagGood: `${tag} border-good/50 bg-good/15 text-fg`,
  tagBad: `${tag} border-bad/50 bg-bad/15 text-fg`,
};