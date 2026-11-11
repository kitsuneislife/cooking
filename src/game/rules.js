// Regras puras do jogo, sem React nem rede, para poder testar.

export function shuffle(list, rand = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Textos de ingrediente da camada do jogo que a API não tem mais.
export function missingIngredients(recipe, game) {
  return game.ingredients.filter((i) => !recipe.ingredients.includes(i.api)).map((i) => i.api);
}

// Passos que pedem algo que ainda não existe: nem ingrediente, nem produto de um passo anterior.
export function brokenSteps(game) {
  const have = new Set(game.ingredients.map((i) => i.id));
  const broken = [];
  game.steps.forEach((step, n) => {
    for (const id of step.add) if (!have.has(id)) broken.push(`passo ${n + 1}: ${id}`);
    if (step.makes) have.add(step.makes);
  });
  return broken;
}

// Estrelas do prato pela média das notas das etapas (0 a 1), como nos jogos de culinária.
export function starsFor(average) {
  if (average >= 0.85) return 3;
  if (average >= 0.6) return 2;
  if (average >= 0.35) return 1;
  return 0;
}

// Carimbo de cada etapa pela nota dela (0 a 1).
export const GRADES = [
  { min: 0.9, key: "perfect", label: "Perfeito!" },
  { min: 0.7, key: "great", label: "Ótimo!" },
  { min: 0.45, key: "good", label: "Bom!" },
  { min: 0, key: "oops", label: "Ops…" },
];
export const stepGrade = (score) => GRADES.find((g) => score >= g.min);

export const average = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);

// Mirar: 1 em cima do alvo, cai até 0 a `tolerance` de distância (corte, prato, despejo).
export const aimScore = (at, target, tolerance) => Math.max(0, 1 - Math.abs(at - target) / tolerance);

// Despejar até a faixa: 1 dentro dela, cai até 0 a `slack` fora.
export function bandScore(level, lo, hi, slack) {
  const off = level < lo ? lo - level : level > hi ? level - hi : 0;
  return Math.max(0, 1 - off / slack);
}

// Diferença entre dois ângulos pelo caminho mais curto (-π a π): soma voltas ao mexer.
export function angleDelta(from, to) {
  const d = (to - from) % (2 * Math.PI);
  if (d > Math.PI) return d - 2 * Math.PI;
  if (d < -Math.PI) return d + 2 * Math.PI;
  return d;
}

// Ritmo: a batida ainda livre mais perto de `now`. Dentro de `window` segundos vale,
// com precisão de 1 (em cima) a 0 (na beira da janela). Fora dela, nada.
export function judgeBeat(now, beats, taken, window) {
  let best = -1;
  beats.forEach((t, i) => {
    if (taken.has(i)) return;
    if (best < 0 || Math.abs(t - now) < Math.abs(beats[best] - now)) best = i;
  });
  if (best < 0 || Math.abs(beats[best] - now) > window) return null;
  return { index: best, accuracy: aimScore(now, beats[best], window) };
}

// Acertos seguidos valem mais: x2 a partir de 4, até x4.
export function comboMultiplier(combo) {
  return Math.min(1 + Math.floor(combo / 4), 4);
}

export function finalScore({ coins, secondsLeft, difficulty }) {
  const timeBonus = secondsLeft * 2;
  const total = Math.round((coins + timeBonus) * (difficulty === "Medium" ? 1.5 : 1));
  return { timeBonus, total };
}

// Corte na tábua. `lo`..`hi` é a largura do ingrediente (0 a 1 do desenho), `cuts` são
// as posições já cortadas, da esquerda para a direita, e `total` quantos cortes ele pede.
// A guia divide o que sobra em partes iguais; o corte cai onde o jogador mirou, mas sempre
// deixa espaço para os cortes que faltam. `aim` nulo (teclado) ou fora do ingrediente corta na guia.
export function nextCut({ lo, hi }, cuts, total, aim) {
  const from = cuts.at(-1) ?? lo, left = total - cuts.length;
  const step = (hi - lo) / (total + 1);
  const guide = from + (hi - from) / (left + 1);
  if (aim == null) return { guide, at: guide, perfect: true };
  if (aim < lo || aim > hi) return { guide, at: guide, perfect: false };
  const at = Math.min(Math.max(aim, from + step * 0.4), hi - step * 0.4 * left);
  return { guide, at, perfect: Math.abs(aim - guide) <= step * 0.3 };
}

// Ponto do cozimento: progress vai de 0 (acabou de entrar) a 1 (queimou de vez).
export const COOK_READY = 0.6;
export const COOK_BURNT = 0.85;
export function cookZone(progress) {
  if (progress < COOK_READY) return "raw";
  if (progress < COOK_BURNT) return "ready";
  return "burnt";
}
