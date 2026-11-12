import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MODELS } from "./models.js";
import { games } from "../data/games.js";

// Cada `dish` das etapas aponta para um modelo carregado, e cada modelo tem o seu .glb.
test("every dish names a loaded model with a .glb file", () => {
  const dishes = [];
  const walk = (o) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) k === "dish" ? dishes.push(v) : walk(v);
  };
  walk(games);
  assert.deepEqual(dishes.sort(), ["chicken", "stirfry", "tiramisu"]);
  for (const d of dishes) assert.ok(MODELS.includes(d), d);
  for (const m of MODELS) assert.ok(existsSync(new URL(`../../public/models/${m}.glb`, import.meta.url)), m);
});
