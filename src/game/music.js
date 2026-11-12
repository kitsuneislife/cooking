import { audio, musicOut } from "./sound";

// Trilha de fundo: uma faixa por vez, trocada com fade cruzado.
const VOLUME = 0.3; // por baixo dos efeitos sonoros
const OUT = 1.2; // a faixa que sai some em 1,2 s
const IN = 1.8; // a que entra cresce em 1,8 s, depois de quase toda a anterior sair
// A faixa emenda em si mesma 4 s antes do fim: cobre o fade-out que as gravações trazem.
const LOOP = 4;

let current = null;

function start(name, delay, dur) {
  const a = audio();
  const el = new Audio(`/music/${name}.mp3`);
  const gain = a.createGain();
  const track = { name, el, gain, stopped: false };
  const at = a.currentTime + delay;
  gain.gain.value = 0;
  a.createMediaElementSource(el).connect(gain).connect(musicOut());

  // o fade começa quando o som sai de fato: download lento ou espera pelo clique não engolem a entrada
  el.addEventListener("playing", () => {
    if (track.stopped) return;
    const t = Math.max(a.currentTime, at);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(VOLUME, t + dur);
  }, { once: true });

  const loop = () => {
    if (current !== track || el.duration - el.currentTime > LOOP) return;
    stop(track, LOOP);
    current = start(name, 0, LOOP);
  };
  el.addEventListener("timeupdate", loop);
  el.addEventListener("ended", loop);

  el.play().catch(() => {}); // sem clique do jogador ainda: o unlock abaixo tenta de novo
  return track;
}

function stop(track, dur) {
  if (!track) return;
  track.stopped = true;
  const g = track.gain.gain, t = audio().currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0, t + dur);
  setTimeout(() => {
    track.el.pause();
    track.el.removeAttribute("src");
    track.el.load(); // solta o download
    track.gain.disconnect();
  }, dur * 1000 + 100);
}

// Troca para a faixa `name` (caminho em public/music/, sem ".mp3"); a mesma faixa segue tocando.
export function playMusic(name) {
  if (current?.name === name) return;
  const before = current;
  stop(before, OUT);
  current = start(name, before ? OUT * 0.6 : 0, IN);
}

// O navegador só deixa tocar som depois do primeiro clique ou tecla na página.
function unlock() {
  audio().resume();
  if (current?.el.paused) current.el.play().catch(() => {});
}
addEventListener("pointerdown", unlock);
addEventListener("keydown", unlock);
