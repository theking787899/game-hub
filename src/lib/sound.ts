// Sons gerados no navegador com a Web Audio API: não precisa de arquivos de áudio.

export type Sfx = "correct" | "wrong" | "other" | "nobody" | "win" | "end";

const STORAGE_KEY = "gamehub:sound";
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;

// ---------------------------------------------------------------- liga/desliga
let on = true;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    on = localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // sem acesso ao armazenamento: o som fica ligado nesta visita
  }
}

export function isSoundOn(): boolean {
  load();
  return on;
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSoundOn(next: boolean) {
  load();
  on = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // ignora
  }
  if (ctx && master) master.gain.setTargetAtTime(next ? 1 : 0, ctx.currentTime, 0.05);
  ensure(); // o clique do usuário libera o áudio do navegador
  listeners.forEach((l) => l());
}

// ---------------------------------------------------------------- contexto de áudio
let unlockArmed = false;

// Navegadores só tocam áudio depois de um clique ou tecla: espera o primeiro.
function armUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const unlock = () => {
    void ctx?.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    unlockArmed = false;
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = isSoundOn() ? 1 : 0;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.6;
    sfxBus.connect(master);
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
    armUnlock();
  }
  return ctx;
}

// ---------------------------------------------------------------- notas
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

type ToneOpts = {
  type?: OscillatorType;
  gain?: number;
  bus?: AudioNode | null;
  slideTo?: number;
  attack?: number;
};

function tone(c: AudioContext, freq: number, start: number, dur: number, o: ToneOpts = {}) {
  const out = o.bus ?? sfxBus;
  if (!out) return;
  const { type = "sine", gain = 0.3, slideTo, attack = 0.012 } = o;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);

  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(g);
  g.connect(out);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

// ---------------------------------------------------------------- efeitos
export function playSfx(name: Sfx) {
  if (!isSoundOn()) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + 0.02;

  switch (name) {
    case "correct": // você acertou: arpejo subindo
      [72, 76, 79, 84].forEach((n, i) =>
        tone(c, midi(n), t + i * 0.09, i === 3 ? 0.5 : 0.16, { type: "triangle", gain: 0.35 }),
      );
      break;

    case "wrong": // você errou: dois tons graves caindo
      tone(c, 220, t, 0.2, { type: "sawtooth", gain: 0.16, slideTo: 160 });
      tone(c, 165, t + 0.18, 0.34, { type: "sawtooth", gain: 0.16, slideTo: 90 });
      break;

    case "other": // outro jogador acertou: dois toques suaves, descendo
      tone(c, midi(76), t, 0.18, { gain: 0.22 });
      tone(c, midi(72), t + 0.13, 0.28, { gain: 0.22 });
      break;

    case "nobody": // ninguém acertou
      tone(c, 262, t, 0.45, { type: "triangle", gain: 0.22, slideTo: 175 });
      break;

    case "win": // fim do quiz, você está entre os primeiros
      [60, 64, 67, 72].forEach((n, i) =>
        tone(c, midi(n), t + i * 0.12, 0.25, { type: "triangle", gain: 0.3 }),
      );
      [72, 76, 79, 84].forEach((n) =>
        tone(c, midi(n), t + 0.5, 1.1, { type: "triangle", gain: 0.22 }),
      );
      break;

    case "end": // fim do quiz, resolução calma
      [67, 72, 76].forEach((n, i) => tone(c, midi(n), t + i * 0.16, 0.5, { gain: 0.2 }));
      break;
  }
}

// ---------------------------------------------------------------- música de fundo
// Loop gerado na hora: pad, baixo e arpejo sobre Lá menor, Fá, Dó e Sol.
const BPM = 92;
const BEAT = 60 / BPM;
const chords = [
  [57, 60, 64],
  [53, 57, 60],
  [48, 52, 55],
  [55, 59, 62],
];

let musicBus: GainNode | null = null;
let musicTimer: number | null = null;

function scheduleBeat(c: AudioContext, bus: GainNode, t: number, i: number) {
  const chord = chords[Math.floor(i / 4) % chords.length];
  const step = i % 4;

  if (step === 0) {
    chord.forEach((n) => tone(c, midi(n), t, BEAT * 4, { gain: 0.14, bus, attack: 0.5 }));
  }
  if (step === 0 || step === 2) {
    tone(c, midi(chord[0] - 12), t, BEAT * 1.9, { gain: 0.4, bus });
  }

  const arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12];
  tone(c, midi(arp[step]), t, BEAT * 0.9, { type: "triangle", gain: 0.22, bus });
  tone(c, midi(arp[(step + 2) % 4] + 12), t + BEAT / 2, BEAT * 0.5, {
    type: "triangle",
    gain: 0.1,
    bus,
  });
}

export function startMusic() {
  const c = ensure();
  if (!c || !master || musicTimer !== null) return;

  const bus = c.createGain();
  bus.gain.value = 0.0001;
  bus.gain.setTargetAtTime(0.35, c.currentTime, 0.6); // entra devagar
  bus.connect(master);
  musicBus = bus;

  let nextTime = c.currentTime + 0.1;
  let beat = 0;
  const tick = () => {
    // agenda as próximas notas com folga, para não falhar se o navegador atrasar o timer
    while (nextTime < c.currentTime + 1.0) {
      scheduleBeat(c, bus, nextTime, beat);
      nextTime += BEAT;
      beat++;
    }
  };
  tick();
  musicTimer = window.setInterval(tick, 250);
}

export function stopMusic() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  const bus = musicBus;
  musicBus = null;
  if (bus && ctx) {
    bus.gain.setTargetAtTime(0, ctx.currentTime, 0.15); // sai devagar
    window.setTimeout(() => bus.disconnect(), 1500);
  }
}