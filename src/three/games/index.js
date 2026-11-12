// Um minijogo por gesto, no espírito de Cooking Mama (ver docs/inspiracao).
// Contrato de cada um: { title, how, keys, gesture, shot, seconds, create(world, ctx, spec, game) }.
// A receita pode trocar qualquer um desses textos na própria etapa (ver src/data/games.js).
import shop from "./shop.js";
import slice from "./slice.js";
import mince from "./mince.js";
import pour from "./pour.js";
import whisk from "./whisk.js";
import fry from "./fry.js";
import toss from "./toss.js";
import stir from "./stir.js";
import plate from "./plate.js";
import drop from "./drop.js";
import swirl from "./swirl.js";
import blend from "./blend.js";
import pound from "./pound.js";
import shake from "./shake.js";
import roll from "./roll.js";
import spread from "./spread.js";
import arrange from "./arrange.js";
import wait from "./wait.js";
import dip from "./dip.js";
import wheel from "./wheel.js";

const GAMES = { shop, slice, mince, pour, whisk, fry, toss, stir, plate, drop, swirl, blend, pound, shake, roll, spread, arrange, wait, dip, wheel };

export function minigame(name) {
  const g = GAMES[name];
  if (!g) throw new Error(`Minijogo desconhecido: ${name}`);
  return g;
}
