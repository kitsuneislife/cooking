import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MUSIC, trackFor } from "./music.js";
import { MENU } from "./games.js";

test("toda faixa da trilha existe em public/music", () => {
  for (const track of Object.values(MUSIC).flat()) {
    assert.ok(existsSync(new URL(`../../public/music/${track}.mp3`, import.meta.url)), track);
  }
});

test("pedidos vizinhos do cardápio cozinham com faixas diferentes", () => {
  for (const key of ["prep", "cook"]) {
    const tracks = MENU.slice(0, MUSIC[key].length).map((id) => trackFor(key, String(id)));
    assert.equal(new Set(tracks).size, MUSIC[key].length, key);
  }
  assert.equal(trackFor("market", "8"), MUSIC.market);
  assert.equal(trackFor("prep", "999"), MUSIC.prep[0]);
});
