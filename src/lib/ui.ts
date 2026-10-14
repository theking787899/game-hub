// Combinações de classes Tailwind usadas em várias telas.
const btn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[0.95rem] font-semibold transition enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";
const serif = "font-display font-normal tracking-tight";
const tag = "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[0.72rem]";

export const ui = {
  shell: "mx-auto w-full max-w-[1080px] px-5 pb-16 pt-5",
  center: "grid min-h-dvh place-items-center text-center text-muted",
  h1: `${serif} text-[clamp(2.8rem,7.5vw,4.75rem)] leading-none`,
  h2: `${serif} text-[2rem] leading-[1.05]`,
  lead: "mt-4 max-w-[50ch] text-lg text-muted",

  card: "rounded-2xl border border-line bg-surface",

  btnPrimary: `${btn} bg-accent text-accent-fg hover:brightness-105`,
  btnSecondary: `${btn} border border-line bg-surface-2 text-fg hover:border-fg/30`,
  btnGhost: `${btn} text-muted hover:bg-surface-2 hover:text-fg`,

  label: "flex w-full flex-col gap-1.5 text-sm font-medium",
  input:
    "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-base font-normal text-fg placeholder:text-muted/70 focus-visible:border-fg/50",
  alert: "max-w-[60ch] rounded-xl border border-bad/40 bg-bad/15 px-4 py-3 text-fg",

  tag: `${tag} border-line bg-surface-2 text-muted`,
  tagAccent: `${tag} border-accent/40 bg-accent/15 text-fg`,
  tagGood: `${tag} border-good/40 bg-good/15 text-fg`,
  tagBad: `${tag} border-bad/40 bg-bad/15 text-fg`,
};