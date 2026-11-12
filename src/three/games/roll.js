// Abrir a massa: arrastar para cima e para baixo com o rolo até a bola virar um disco.
import { STATION_X } from "../sets.js";
import { rollingPin } from "../gear.js";
import { pizza } from "../foods.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, speedScore, zigzag, v3 } from "./common.js";

const STROKES = 14;

export default {
  title: "Abrir a massa",
  how: "Arraste para cima e para baixo para passar o rolo na massa.",
  keys: "Alterne ↑ e ↓ bem rápido.",
  gesture: "zigzag",
  shot: "bench",
  seconds: 18,

  create(world, ctx) {
    const s = scope(world), bench = world.kitchen.stations.bench;
    const C = v3(STATION_X.bench, bench.userData.top, bench.position.z);
    const pie = pizza(), pu = pie.userData;
    pie.position.copy(C);
    world.scene.add(pie);
    world.dish.pizza = pie; // a mesma pizza segue até o forno e a tábua
    let h = pu.flatten(0);

    const pin = s.add(rollingPin()), r = pin.userData.r;
    pin.position.set(C.x, C.y + 3.6, C.z);

    let n = 0, shown = 0, live = false, used = 0, idle = 0, side = 1, z = 0, rolling = false;
    ctx.guide({ kind: () => (n < STROKES ? "zigzag" : null), at: C.clone().add(v3(pu.R * 0.9, 0.1, 0)), r: pu.R * 0.6, dir: v3(0, 0, 1) });

    s.every((dt) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 1.8) { idle = -2; ctx.say("Vai e volta com o rolo!"); }
      shown += (n / STROKES - shown) * Math.min(1, dt * 8);
      if (n === STROKES && shown > 0.985) shown = 1;
      h = pu.flatten(shown);
      if (!rolling) return;
      const before = z;
      z += (side * (0.2 + 0.8 * shown) * pu.R * 0.55 - z) * Math.min(1, dt * 12);
      pin.position.set(C.x, C.y + h * 0.85 + r, C.z + z);
      pin.rotation.x += (z - before) / r;
    });

    function stroke(d) {
      if (n >= STROKES) return;
      n++; idle = 0; side = d;
      sfx.swish();
      if (n % 3 === 0) world.fx.steam(v3(C.x, C.y + 0.2, C.z + d * 0.6), 2, { size: 0.5, rise: 0.4 }); // farinha
      ctx.progress(n / STROKES);
      if (n < STROKES) return;
      const at = C.clone().add(v3(0, 0.6, 0));
      world.fx.sparkle(at, 12);
      if (live) { live = false; ctx.good(at, "Massa aberta!"); ctx.done(speedScore(used, 12)); }
    }

    const zz = zigzag("y", stroke, () => live);
    return {
      async intro() {
        await hop(world, pin, v3(C.x, C.y + h * 0.85 + r, C.z), { height: 0.4, dur: 0.6 });
        sfx.thud();
        rolling = true;
      },
      start() { live = true; world.input = zz.input; },
      key: zz.key,
      async rescue() {
        live = false;
        while (n < STROKES) { stroke(n % 2 ? 1 : -1); await world.wait(0.1); }
      },
      async outro() {
        rolling = false;
        await hop(world, pin, v3(C.x + 3, C.y + 3.4, C.z - 1), { height: 0.4, dur: 0.45 });
      },
      finish() { if (n === STROKES) pu.flatten(1); s.dispose(); },
    };
  },
};
