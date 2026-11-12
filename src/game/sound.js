// Efeitos sonoros: gravações curtas em public/sfx/ (tabela em src/data/sfx.js), tocadas pela Web Audio API.
// A trilha (music.js) usa o mesmo contexto e passa pelo `musicOut`; os efeitos, pelo `fxOut`. O mudo zera os dois.
import { SFX, LOOPS, layerMix, allSfx } from "../data/sfx.js";

let ctx, bus, fxBus;
let muted = localStorage.getItem("mudo") === "1";
const buffers = new Map();

export const audio = () => {
  if (!ctx) {
    ctx = new AudioContext();
    // carrega tudo de uma vez (são ~2 MB); o que ainda não chegou só não toca
    for (const path of allSfx()) {
      fetch(`/sfx/${path}.wav`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b))
        .then((buf) => buffers.set(path, buf), (e) => console.warn(`Efeito ${path} não carregou`, e));
    }
  }
  return ctx;
};

function out(gain) {
  const node = audio().createGain();
  node.gain.value = muted ? 0 : gain;
  node.connect(audio().destination);
  return node;
}
export const musicOut = () => (bus ??= out(1));
const FX = 0.9;
const fxOut = () => (fxBus ??= out(FX));

// Toca uma das variações: nunca a mesma duas vezes seguidas, com tom e volume
// mexidos de leve, para cem cortes não soarem como um corte só.
const last = new WeakMap();
function play(list, { vol = 1, rate = 1, delay = 0, jitter = 0.06 } = {}) {
  if (muted) return;
  const a = audio();
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === last.get(list)) i = (i + 1) % list.length;
  last.set(list, i);
  const buffer = buffers.get(list[i]);
  if (!buffer) return;
  const src = a.createBufferSource(), gain = a.createGain();
  src.buffer = buffer;
  src.playbackRate.value = rate * (1 + (Math.random() * 2 - 1) * jitter);
  gain.gain.value = vol * (1 - Math.random() * jitter);
  src.connect(gain).connect(fxOut());
  src.start(a.currentTime + delay);
}
const pickOf = (table, key) => table[key] ?? table.default;

// Sons contínuos (fritura, brasa, água): o minijogo chama `loop` a cada quadro com a intensidade.
// As camadas trocam com fade cruzado; quando o minijogo para de chamar (acabou, saiu), o som some sozinho.
const LOOP_VOL = 0.55, SMOOTH = 0.12, GONE = 250;
const loops = new Map();
let watchdog = 0;

function loop(name, level) {
  const a = audio(), files = LOOPS[name];
  let l = loops.get(name);
  if (!l) {
    if (!files.every((f) => buffers.has(f))) return;
    l = { seen: 0, level: -1, layers: files.map((f) => {
      const src = a.createBufferSource(), gain = a.createGain(), buffer = buffers.get(f);
      src.buffer = buffer; src.loop = true;
      gain.gain.value = 0;
      src.connect(gain).connect(fxOut());
      src.start(a.currentTime, Math.random() * buffer.duration); // cada vez entra num ponto diferente da gravação
      return { src, gain };
    }) };
    loops.set(name, l);
    watchdog ||= setInterval(sweep, 100);
  }
  l.seen = performance.now();
  if (Math.abs(level - l.level) < 0.02) return; // não empilha automação a cada quadro
  l.level = level;
  layerMix(level, files.length).forEach((g, i) => l.layers[i].gain.gain.setTargetAtTime(g * LOOP_VOL, a.currentTime, SMOOTH));
}

function sweep() {
  const now = performance.now(), t = audio().currentTime;
  for (const [name, l] of loops) {
    if (now - l.seen < GONE) continue;
    loops.delete(name);
    l.layers.forEach(({ src, gain }) => { gain.gain.setTargetAtTime(0, t, 0.15); src.stop(t + 0.8); });
  }
  if (!loops.size) { clearInterval(watchdog); watchdog = 0; }
}

// O liquidificador não tem gravação: o motor é sintetizado e sobe de tom com a velocidade.
function motor(level) {
  if (muted) return;
  const a = audio(), t = a.currentTime, dur = 0.24;
  const osc = a.createOscillator(), gain = a.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 70 + level * 110;
  gain.gain.setValueAtTime(0.05, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(fxOut());
  osc.start(t); osc.stop(t + dur);
}

// Vibração curta no celular a cada corte ou batida (quem não tem, ignora).
const buzz = (ms) => { if (!muted) navigator.vibrate?.(ms); };

export const sfx = {
  loop,
  pick: () => play(SFX.pick, { vol: 0.7 }),
  // o acerto sobe de tom junto com o combo; a cada 5 seguidos, a fanfarra do combo
  good: (combo = 0) => {
    play(SFX.good, { vol: 0.6, rate: 1 + Math.min(combo, 12) * 0.035, jitter: 0 });
    if (combo % 5 === 4) play(SFX.combo, { vol: 0.7 });
  },
  bad: () => play(SFX.bad, { vol: 0.45 }),
  fail: () => play(SFX.fail, { vol: 0.7 }),
  go: () => play(SFX.go, { vol: 0.8, jitter: 0 }),
  start: () => play(SFX.start, { vol: 0.8 }),
  ready: () => play(SFX.ready, { vol: 0.5, rate: 1.25 }),
  stamp: (grade) => play(SFX.stamp[grade], { vol: 0.85, jitter: 0 }),
  reveal: () => play(SFX.reveal, { vol: 0.8, jitter: 0 }),
  win: () => { play(SFX.win, { jitter: 0 }); play(SFX.reveal, { vol: 0.7, delay: 0.5, jitter: 0 }); },
  lose: () => play(SFX.lose, { vol: 0.8, jitter: 0 }),
  swish: () => play(SFX.swish, { vol: 0.6, jitter: 0.12 }),

  // `food` é o id do ingrediente; corte no ponto certo ganha um brilho por cima
  chop: (food, perfect = false) => {
    play(pickOf(SFX.chop, food), { jitter: 0.08 });
    if (perfect) play(SFX.good, { vol: 0.35, delay: 0.04 });
    buzz(perfect ? 25 : 12);
  },
  slice: (food, perfect = false) => {
    play(pickOf(SFX.slice, food));
    if (perfect) play(SFX.good, { vol: 0.35, delay: 0.05 });
    buzz(perfect ? 25 : 12);
  },
  wheel: (perfect = false) => {
    play(SFX.wheel);
    if (perfect) play(SFX.good, { vol: 0.35, delay: 0.05 });
    buzz(12);
  },
  // onde a coisa cai: "splat" (líquido), "place" (arrumar no prato), "rice", "ice", "sprinkle", "dip", "lid"
  plop: (kind = "default") => {
    play(pickOf(SFX.plop, kind), kind === "ice" ? { rate: 1.5, jitter: 0.15 } : {});
    buzz(15);
  },

  whisk: () => play(SFX.whisk, { vol: 0.7, jitter: 0.1 }),
  mix: (what) => play(SFX.mix[what], { vol: 0.7, jitter: 0.1 }),
  spread: (on) => play(pickOf(SFX.spread, on), { vol: 0.5, jitter: 0.1 }),
  roll: () => play(SFX.roll, { vol: 0.8, jitter: 0.1 }),
  pound: () => { play(SFX.pound, { jitter: 0.08 }); buzz(15); },
  shake: (tool) => play(pickOf(SFX.shake, tool), { vol: 0.6, jitter: 0.1 }),
  pour: () => play(SFX.pour, { vol: 0.8 }),
  crush: () => { play(SFX.crush, { jitter: 0.1 }); motor(1); buzz(20); },
  blend: (level = 1) => motor(level),

  // comida caindo na chapa: "medium" (um pedaço) ou "high" (tudo de uma vez, molho no wok quente)
  sear: (heat = "medium") => play(SFX.sear[heat], { vol: heat === "high" ? 0.7 : 0.8 }),
  toss: () => { play(SFX.toss); play(SFX.spatula, { vol: 0.6, delay: 0.12 }); buzz(20); },
  spatula: () => play(SFX.spatula, { vol: 0.6, jitter: 0.1 }),
  flame: () => { play(SFX.smoke, { vol: 0.8 }); play(SFX.sear.medium, { vol: 0.5, delay: 0.05 }); },
  smoke: () => play(SFX.smoke, { vol: 0.6 }),
  switch: () => play(SFX.switch, { vol: 0.8 }),
  door: (open) => play(open ? SFX.open : SFX.close, { vol: 0.8 }),
  done: (hot) => play(SFX.done[hot ? "hot" : "cold"], { vol: 0.7, jitter: 0 }),
  // relógio: tique e taque alternados
  tick: (n) => play([SFX.tick[n % 2]], { vol: 0.6, jitter: 0 }),
};

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  localStorage.setItem("mudo", muted ? "1" : "0");
  // trilha e loops somem e voltam num instante, sem estalo
  const t = audio().currentTime;
  bus?.gain.setTargetAtTime(muted ? 0 : 1, t, 0.08);
  fxBus?.gain.setTargetAtTime(muted ? 0 : FX, t, 0.08);
  return muted;
}
