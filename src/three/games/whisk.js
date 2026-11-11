// Bater o molho: arrastar de um lado para o outro (zigue-zague) até o amido sumir
// e o molho ficar lisinho e brilhante.
import { build } from "../kit.js";
import { STATION_X } from "../sets.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, speedScore, v3 } from "./common.js";

const STROKES = 16;
const MIN_PX = 25; // quanto o dedo precisa andar antes de virar para contar uma batida

export default {
  title: "Bater o molho",
  how: "Arraste de um lado para o outro, em zigue-zague, sem parar.",
  keys: "Alterne ← e → bem rápido.",
  gesture: "zigzag",
  shot: "bowl",
  seconds: 18,

  create(world, ctx) {
    const s = scope(world);
    const bowl = world.kitchen.stations.bowl;
    const liquid = bowl.userData.liquid;
    const island = world.dish.island;
    const center = v3(STATION_X.bowl, 0, bowl.position.z);
    const surface = () => bowl.localToWorld(v3(0, liquid.position.y, 0)).y;

    const whisk = s.add(build.whisk());
    whisk.scale.setScalar(1.15);
    whisk.position.set(center.x + 2.5, 3.6, center.z);
    whisk.rotation.z = -0.5;
    const restY = () => surface() + 1.36 * 1.15 - 0.08; // a ponta do arame encosta no fundo do molho

    let live = false, strokes = 0, used = 0, side = 1, swing = 0, last = null, dir = 0, idle = 0;
    const startColor = liquid.material.color.clone();
    const startRough = liquid.material.roughness;

    s.every((dt, t) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 1.8) { idle = -2; ctx.say("Não para! Vai e volta, vai e volta!"); }
      swing += (side * 0.55 - swing) * Math.min(1, dt * 16);
      if (live || strokes) {
        whisk.position.x = center.x + swing;
        whisk.rotation.z = -swing * 0.5;
        whisk.rotation.y = t * 2;
      }
      liquid.rotation.z += dt * (0.4 + Math.abs(swing) * 0.3);
    });

    function stroke() {
      if (strokes >= STROKES) return;
      strokes++; idle = 0;
      side = -side;
      sfx.whisk();
      const k = strokes / STROKES;
      // amido dissolve; o molho clareia um pouco e ganha brilho
      if (island) island.scale.setScalar(Math.max(0.01, 1 - k));
      liquid.material.color.copy(startColor).lerp(world.dish.sauceColor?.clone().offsetHSL(0, 0.05, 0.08) ?? startColor, k);
      liquid.material.roughness = startRough * (1 - k) + 0.04 * k;
      if (strokes % 2 === 0) world.fx.bits(v3(center.x + swing, surface() + 0.05, center.z), ["#6a3410", "#8a4a1e"], 2, { size: 0.05, speed: 1.4, up: 2, floor: surface() });
      ctx.progress(k);
      if (strokes === STROKES) {
        if (island) island.visible = false;
        world.fx.sparkle(v3(center.x, surface() + 0.5, center.z), 12);
        if (live) { live = false; ctx.good(v3(center.x, surface() + 1, center.z), "Lisinho!"); ctx.done(speedScore(used, 12)); }
      }
    }

    return {
      async intro() {
        await hop(world, whisk, v3(center.x, restY(), center.z), { height: 0.8, dur: 0.6 });
        whisk.rotation.z = 0;
      },
      start() {
        live = true;
        world.input = {
          down: (e) => { last = e.clientX; dir = 0; },
          move: (e) => {
            if (last == null || !live) return;
            const dx = e.clientX - last;
            if (Math.abs(dx) < MIN_PX) return;
            const d = Math.sign(dx);
            if (d !== dir) { dir = d; stroke(); }
            last = e.clientX;
          },
          up: () => { last = null; },
        };
      },
      key(e, down) {
        if (!down || !live || e.repeat) return;
        const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
        if (!d) return;
        e.preventDefault();
        if (d !== dir) { dir = d; stroke(); }
      },
      async rescue() {
        live = false;
        while (strokes < STROKES) { stroke(); await world.wait(0.08); }
      },
      async outro() {
        await hop(world, whisk, v3(center.x + 2.6, 3.4, center.z - 1), { height: 0.6, dur: 0.5 });
      },
      finish() {
        island?.removeFromParent();
        world.dish.island = null;
        s.dispose();
      },
    };
  },
};
