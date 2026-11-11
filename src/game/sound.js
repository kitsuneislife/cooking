// Efeitos sonoros gerados na hora com a Web Audio API: sem arquivos de áudio.
let ctx;
let muted = localStorage.getItem("mudo") === "1";

const audio = () => (ctx ??= new AudioContext());

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
function noise(dur, freq, vol) {
  if (muted) return;
  const a = audio(), length = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, length, a.sampleRate), data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = freq;
  gain.gain.value = vol;
  source.connect(filter).connect(gain).connect(a.destination);
  source.start();
}

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
  },
  sizzle: () => noise(1.2, 5200, 0.18),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { dur: 0.22, delay: i * 0.11 })),
};

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  localStorage.setItem("mudo", muted ? "1" : "0");
  return muted;
}
