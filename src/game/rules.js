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

export function starsFor(errors) {
  if (errors <= 1) return 3;
  if (errors <= 3) return 2;
  if (errors <= 6) return 1;
  return 0;
}

// Acertos seguidos valem mais: x2 a partir de 4, até x4.
export function comboMultiplier(combo) {
  return Math.min(1 + Math.floor(combo / 4), 4);
}

// Tempo da partida, em segundos, a partir dos minutos que a API informa.
export function timeLimit(recipe) {
  return (recipe.prepTimeMinutes + recipe.cookTimeMinutes) * 5;
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
