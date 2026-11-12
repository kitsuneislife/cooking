import { MENU } from "./games.js";

// Trilha de cada momento do jogo; o caminho é relativo a public/music/, sem ".mp3".
// Cozinhar tem três faixas por fase: cada pedido do cardápio fica com a sua.
export const MUSIC = {
  title: "kitchen-magic/01-title-screen",
  menu: "kitchen-magic/02-menu",
  order: "cuisine/03-preparation-for-cooking",
  market: "kitchen-magic/11-minigames",
  prep: ["kitchen-magic/03-lets-cook-1", "cuisine/04-cooking-theme-1", "kitchen-magic/10-lets-help"],
  cook: ["kitchen-magic/05-lets-cook-2", "kitchen-magic/07-lets-cook-3", "cuisine/05-cooking-theme-2"],
  win: "kitchen-magic/06-results",
  lose: "cuisine/07-results-the-last",
};

// A faixa de uma fase para um pedido: a lista ou a faixa única.
export function trackFor(key, recipeId) {
  const track = MUSIC[key];
  if (!Array.isArray(track)) return track;
  const n = MENU.indexOf(Number(recipeId));
  return track[Math.max(n, 0) % track.length];
}
