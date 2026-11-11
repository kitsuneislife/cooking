import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffle, missingIngredients, brokenSteps, starsFor, comboMultiplier, timeLimit, finalScore, cookZone } from "./rules.js";
import { games } from "../data/games.js";

test("shuffle keeps every item and does not change the input", () => {
  const list = [1, 2, 3, 4, 5];
  const out = shuffle(list, () => 0.3);
  assert.deepEqual([...out].sort(), list);
  assert.deepEqual(list, [1, 2, 3, 4, 5]);
});

test("starsFor drops a star at 2, 4 and 7 errors", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 6, 7].map(starsFor), [3, 3, 2, 2, 1, 1, 0]);
});

test("comboMultiplier grows every 4 hits and stops at x4", () => {
  assert.deepEqual([0, 3, 4, 8, 12, 40].map(comboMultiplier), [1, 1, 2, 3, 4, 4]);
});

test("timeLimit gives 5 seconds per recipe minute", () => {
  assert.equal(timeLimit({ prepTimeMinutes: 20, cookTimeMinutes: 15 }), 175);
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

test("every game in the data has steps that can be played", () => {
  for (const game of Object.values(games)) assert.deepEqual(brokenSteps(game), []);
});
