import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shuffle, missingIngredients, brokenSteps, starsFor, comboMultiplier, finalScore, cookZone, nextCut,
  stepGrade, average, aimScore, bandScore, angleDelta, judgeBeat,
} from "./rules.js";
import { games } from "../data/games.js";

test("shuffle keeps every item and does not change the input", () => {
  const list = [1, 2, 3, 4, 5];
  const out = shuffle(list, () => 0.3);
  assert.deepEqual([...out].sort(), list);
  assert.deepEqual(list, [1, 2, 3, 4, 5]);
});

test("starsFor turns the average step score into 0 to 3 stars", () => {
  assert.deepEqual([1, 0.85, 0.84, 0.6, 0.59, 0.35, 0.34, 0].map(starsFor), [3, 3, 2, 2, 1, 1, 0, 0]);
});

test("stepGrade stamps each step score", () => {
  assert.deepEqual([1, 0.9, 0.89, 0.7, 0.69, 0.45, 0.44, 0].map((s) => stepGrade(s).key),
    ["perfect", "perfect", "great", "great", "good", "good", "oops", "oops"]);
});

test("average of an empty list is 0", () => {
  assert.equal(average([]), 0);
  assert.equal(average([1, 0.5]), 0.75);
});

test("aimScore and bandScore fall off linearly to 0", () => {
  assert.equal(aimScore(0.5, 0.5, 0.2), 1);
  assert.ok(Math.abs(aimScore(0.6, 0.5, 0.2) - 0.5) < 1e-9);
  assert.equal(aimScore(0.9, 0.5, 0.2), 0);
  assert.equal(bandScore(0.5, 0.4, 0.6, 0.1), 1);
  assert.ok(Math.abs(bandScore(0.65, 0.4, 0.6, 0.1) - 0.5) < 1e-9);
  assert.equal(bandScore(0.2, 0.4, 0.6, 0.1), 0);
});

test("angleDelta takes the short way around", () => {
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  assert.ok(near(angleDelta(0, 0.5), 0.5));
  assert.ok(near(angleDelta(3, -3), 2 * Math.PI - 6)); // passa por π, não volta por 0
  assert.ok(near(angleDelta(-3, 3), 6 - 2 * Math.PI));
});

test("judgeBeat picks the nearest free beat inside the window", () => {
  const beats = [1, 2, 3];
  assert.deepEqual(judgeBeat(2, beats, new Set(), 0.3), { index: 1, accuracy: 1 });
  assert.equal(judgeBeat(2.5, beats, new Set(), 0.3), null);
  assert.equal(judgeBeat(2.1, beats, new Set([1]), 0.3), null); // a do meio já foi
  assert.ok(Math.abs(judgeBeat(3.15, beats, new Set(), 0.3).accuracy - 0.5) < 1e-9);
});

test("every play step points at real ingredients and recipe steps", () => {
  for (const game of Object.values(games)) {
    const ids = new Set(game.ingredients.map((i) => i.id));
    for (const steps of Object.values(game.play)) for (const s of steps) {
      for (const id of s.items ?? []) assert.ok(ids.has(id), `${s.game}: ${id}`);
      if (s.step != null) assert.ok(game.steps[s.step], `${s.game}: passo ${s.step}`);
    }
  }
});

test("comboMultiplier grows every 4 hits and stops at x4", () => {
  assert.deepEqual([0, 3, 4, 8, 12, 40].map(comboMultiplier), [1, 1, 2, 3, 4, 4]);
});

test("finalScore adds the time bonus and gives Medium 50% more", () => {
  assert.deepEqual(finalScore({ coins: 100, secondsLeft: 10, difficulty: "Easy" }), { timeBonus: 20, total: 120 });
  assert.equal(finalScore({ coins: 100, secondsLeft: 10, difficulty: "Medium" }).total, 180);
});

test("cookZone goes raw, ready, burnt", () => {
  assert.deepEqual([0, 0.59, 0.6, 0.84, 0.85, 1].map(cookZone), ["raw", "raw", "ready", "ready", "burnt", "burnt"]);
});

test("missingIngredients lists texts the API no longer has", () => {
  const game = { ingredients: [{ api: "Salt" }, { api: "Sugar" }] };
  assert.deepEqual(missingIngredients({ ingredients: ["Salt"] }, game), ["Sugar"]);
  assert.deepEqual(missingIngredients({ ingredients: ["Salt", "Sugar"] }, game), []);
});

test("brokenSteps flags what is neither an ingredient nor an earlier product", () => {
  const game = {
    ingredients: [{ id: "a" }],
    steps: [{ add: ["a", "mix"], makes: "mix" }, { add: ["mix", "ghost"] }],
  };
  assert.deepEqual(brokenSteps(game), ["passo 1: mix", "passo 2: ghost"]);
});

test("nextCut splits what is left evenly and rewards aiming at the guide", () => {
  const box = { lo: 0, hi: 1 };
  assert.deepEqual(nextCut(box, [], 4, null), { guide: 0.2, at: 0.2, perfect: true });
  assert.equal(nextCut(box, [], 4, 0.22).perfect, true);
  assert.deepEqual(nextCut(box, [], 4, 0.5), { guide: 0.2, at: 0.5, perfect: false });
  // longe demais: o corte para onde ainda cabem os 3 que faltam
  assert.equal(nextCut(box, [], 4, 0.99).at, 1 - 0.2 * 0.4 * 4);
  // fora do ingrediente: corta na guia, sem bônus
  assert.deepEqual(nextCut({ lo: 0.2, hi: 0.8 }, [], 2, 0.1), { guide: 0.4, at: 0.4, perfect: false });
  // depois de um corte torto, a guia redivide o resto
  assert.equal(nextCut(box, [0.5], 4, null).guide, 0.625);
});

test("every game in the data has steps that can be played", () => {
  for (const game of Object.values(games)) assert.deepEqual(brokenSteps(game), []);
});
