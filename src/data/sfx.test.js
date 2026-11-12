import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { allSfx, layerMix } from "./sfx.js";

test("todo efeito sonoro existe em public/sfx", () => {
  const paths = allSfx();
  assert.ok(paths.length > 40);
  for (const path of paths) assert.ok(existsSync(new URL(`../../public/sfx/${path}.wav`, import.meta.url)), path);
});

test("as camadas de um loop trocam só entre vizinhas e com potência constante", () => {
  assert.deepEqual(layerMix(0, 3), [0, 0, 0]);
  assert.deepEqual(layerMix(0.4, 1), [0.4]);
  assert.deepEqual(layerMix(2, 1), [1]);
  const [low, mid, high] = layerMix(0.25, 3);
  assert.equal(high, 0);
  const loud = 0.4 + 0.6 * 0.25;
  assert.ok(Math.abs(low ** 2 + mid ** 2 - loud ** 2) < 1e-9);
  assert.deepEqual(layerMix(1, 3).map((g) => Math.round(g * 1e6) / 1e6), [0, 0, 1]);
});
