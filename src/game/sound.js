// Efeitos sonoros gerados na hora com a Web Audio API: sem arquivos de áudio.
// A trilha (music.js) usa o mesmo contexto e passa pelo `musicOut`, que o botão de mudo zera.
let ctx, bus;
let muted = localStorage.getItem("mudo") === "1";

export const audio = () => (ctx ??= new AudioContext());

export function musicOut() {
  if (!bus) {
    bus = audio().createGain();
    bus.gain.value = muted ? 0 : 1;
    bus.connect(audio().destination);
  }
  return bus;
}

function tone(freq, { dur = 0.12, type = "triangle", vol = 0.14, delay = 0, to } = {}) {
  if (muted) return;
  const a = audio(), t = a.currentTime + delay;
  const osc = a.createOscillator(), gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur);
}

// Chiado filtrado: faca na tábua (curto) ou comida na chapa (longo).
// `to` faz o filtro deslizar (o "vush" de jogar a comida para cima).
function noise(dur, freq, vol, { to, flat = false } = {}) {
  if (muted) return;
  const a = audio(), length = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, length, a.sampleRate), data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (flat ? Math.sin(Math.PI * i / length) : 1 - i / length);
  const source = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq, a.currentTime);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, a.currentTime + dur);
  gain.gain.value = vol;
  source.connect(filter).connect(gain).connect(a.destination);
  source.start();
}

// Vibração curta no celular a cada corte ou batida (quem não tem, ignora).
const buzz = (ms) => { if (!muted) navigator.vibrate?.(ms); };

export const sfx = {
  pick: () => tone(520, { dur: 0.07 }),
  // o acerto sobe de tom junto com o combo
  good: (combo = 0) => {
    const base = 620 + Math.min(combo, 12) * 35;
    tone(base, { dur: 0.09 });
    tone(base * 1.5, { dur: 0.14, delay: 0.07 });
  },
  bad: () => tone(190, { dur: 0.28, type: "sawtooth", to: 80, vol: 0.12 }),
  // corte no ponto certo ganha um "tim" por cima da batida
  chop: (perfect = false) => {
    noise(0.07, 1700 + Math.random() * 500, 0.5);
    tone(140, { dur: 0.06, type: "square", vol: 0.06 });
    if (perfect) tone(1320, { dur: 0.12, type: "sine", vol: 0.08, delay: 0.03 });
    buzz(perfect ? 25 : 12);
  },
  sizzle: (vol = 0.18) => noise(1.2, 5200, vol, { flat: true }),
  pour: () => noise(0.3, 900, 0.22, { flat: true }),
  whisk: () => noise(0.12, 3800 + Math.random() * 800, 0.3, { flat: true }),
  toss: () => { noise(0.35, 500, 0.4, { to: 2400, flat: true }); buzz(20); },
  flame: () => noise(0.6, 260, 0.5, { to: 120 }),
  plop: () => { tone(220, { dur: 0.14, type: "sine", vol: 0.2, to: 110 }); buzz(15); },
  swish: () => noise(0.18, 1200, 0.25, { to: 3000, flat: true }),
  // motor do liquidificador: ronco que sobe de tom com a velocidade
  blend: (level = 1) => { tone(70 + level * 110, { dur: 0.24, type: "sawtooth", vol: 0.05 }); noise(0.24, 500 + level * 1600, 0.12, { flat: true }); },
  ice: () => { tone(1900 + Math.random() * 700, { dur: 0.06, type: "sine", vol: 0.07 }); tone(2700, { dur: 0.05, type: "sine", vol: 0.05, delay: 0.04 }); },
  shake: () => noise(0.09, 6200, 0.16, { flat: true }),
  thud: () => { tone(110, { dur: 0.12, type: "sine", vol: 0.22, to: 60 }); buzz(15); },
  ding: () => { tone(1568, { dur: 0.5, type: "sine", vol: 0.14 }); tone(2093, { dur: 0.6, type: "sine", vol: 0.08, delay: 0.02 }); },
  tick: () => tone(880, { dur: 0.05, type: "square", vol: 0.05 }),
  go: () => { tone(660, { dur: 0.1 }); tone(990, { dur: 0.25, delay: 0.1 }); },
  stamp: (good = true) => good
    ? [784, 988, 1175].forEach((f, i) => tone(f, { dur: 0.16, delay: i * 0.07 }))
    : tone(240, { dur: 0.3, type: "triangle", to: 160, vol: 0.12 }),
  reveal: () => [523, 784, 1047, 1568].forEach((f, i) => tone(f, { dur: 0.3, type: "sine", delay: i * 0.09, vol: 0.12 })),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { dur: 0.22, delay: i * 0.11 })),
};

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  localStorage.setItem("mudo", muted ? "1" : "0");
  // a trilha some e volta num instante, sem estalo
  bus?.gain.setTargetAtTime(muted ? 0 : 1, audio().currentTime, 0.08);
  return muted;
}
