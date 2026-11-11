// Um minijogo por gesto, no espírito de Cooking Mama (ver docs/inspiracao/cooking-mama.md).
// Contrato de cada um: { title, how, keys, gesture, shot, seconds, create(world, ctx, spec, game) }.
import shop from "./shop.js";
import slice from "./slice.js";
import mince from "./mince.js";
import pour from "./pour.js";
import whisk from "./whisk.js";
import fry from "./fry.js";
import toss from "./toss.js";
import stir from "./stir.js";
import plate from "./plate.js";

const GAMES = { shop, slice, mince, pour, whisk, fry, toss, stir, plate };

export function minigame(name) {
  const g = GAMES[name];
  if (!g) throw new Error(`Minijogo desconhecido: ${name}`);
  return g;
}
