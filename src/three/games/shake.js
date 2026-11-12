// Polvilhar: chacoalhar de um lado para o outro. Cada sacudida deixa cair uma chuvinha
// (temperos, cacau, cardamomo) sobre a pizza, o frango, a travessa ou os copos.
import { THREE, fit } from "../kit.js";
import { STATION_X } from "../sets.js";
import { ease } from "../world.js";
import { sieve } from "../gear.js";
import { stock, chicken, PANTRY } from "../foods.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, stream, speedScore, vessels, zigzag, addLayer, v3 } from "./common.js";

// Onde a chuvinha cai: cada alvo tem `userData.face` (a superfície que recebe a camada).
function targets(world, on) {
  if (on === "glasses") {
    return vessels(world, "glasses").map((g) => { g.userData.face = { y: g.userData.surface(), r: g.userData.rim * 0.9 }; return g; });
  }
  if (on === "chicken") { // as sobrecoxas cruas chegam à tábua para temperar
    const board = world.kitchen.stations.board, top = board.userData.top * board.scale.y;
    world.dish.rawChicken = [-0.95, 0.95].map((x, i) => {
      const c = chicken("raw");
      c.position.set(STATION_X.board + x, top, 0.85);
      c.rotation.y = i ? 0.4 : -0.3;
      c.userData.face = { y: 0.325, r: 0.5 };
      world.scene.add(c);
      return c;
    });
    return world.dish.rawChicken;
  }
  if (!world.dish[on]) throw new Error(`Nada para polvilhar em dish.${on}`);
  return [world.dish[on]];
}

export default {
  title: "Polvilhar",
  how: "Chacoalhe de um lado para o outro para polvilhar por igual.",
  keys: "Alterne ← e → bem rápido.",
  gesture: "zigzag",
  shot: "bench",
  seconds: 16,

  create(world, ctx, spec) {
    const s = scope(world), list = targets(world, spec.on);
    const oil = spec.drizzle ? addLayer(list[0]) : null; // o fio de azeite fica por baixo do tempero
    const layers = list.map(addLayer);
    const spots = list.map((t) => t.localToWorld(v3(0, t.userData.face.y, 0)));
    const mid = spots.reduce((a, p) => a.add(p), v3(0, 0, 0)).divideScalar(spots.length);
    const strokes = spec.strokes ?? 14, per = Math.ceil((spec.dots ?? 420) / strokes);
    const colors = spec.colors ?? [PANTRY[spec.tool].tint], size = spec.size ?? 0.035;
    const isSieve = spec.tool === "sieve", hoverY = mid.y + (isSieve ? 0.9 : 1.5);

    // o frasco gira pelo meio, de cabeça para baixo; a peneira fica deitada
    const tool = s.add(new THREE.Group());
    if (isSieve) tool.add(sieve());
    else { const m = fit(stock(spec.tool), 1.2); m.position.y = -0.6; tool.add(m); tool.rotation.z = 2.6; }
    tool.position.set(mid.x + 2.2, hoverY + 1.6, mid.z);

    let n = 0, live = false, used = 0, idle = 0, goal = mid.x, ready = false, kick = 0;
    ctx.guide({ kind: () => (n < strokes ? "zigzag" : null), at: mid, r: list.length > 1 ? 1 : 0.8, dir: v3(1, 0, 0) });

    s.every((dt, t) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 1.8) { idle = -2; ctx.say("Chacoalha! Vai e volta!"); }
      if (!ready) return;
      kick = Math.max(0, kick - dt * 5);
      tool.position.x += (goal - tool.position.x) * Math.min(1, dt * 16);
      tool.position.y = hoverY + Math.sin(t * 3) * 0.03 - kick * 0.12;
    });

    function stroke(d) {
      if (n >= strokes) return;
      n++; idle = 0; kick = 1;
      const i = list.length > 1 ? (d > 0 ? list.length - 1 : 0) : 0, spot = spots[i];
      goal = spot.x + (list.length > 1 ? 0 : d * 0.4);
      layers[i].userData.sprinkle(per, colors, size);
      world.fx.bits(v3(goal, hoverY - 0.35, spot.z), colors, 4, { size: 0.035, speed: 0.7, up: 0.2, floor: spot.y });
      sfx.shake(spec.tool);
      ctx.progress(n / strokes);
      if (n < strokes) return;
      spots.forEach((p) => world.fx.sparkle(p.clone().add(v3(0, 0.4, 0)), 8));
      if (live) { live = false; ctx.good(mid.clone().add(v3(0, 0.8, 0)), spec.cheer ?? "No capricho!"); ctx.done(speedScore(used, 11)); }
    }

    // fio de azeite em espiral, antes de temperar
    async function drizzle() {
      const t = list[0], f = t.userData.face, tint = PANTRY[spec.drizzle].tint;
      const b = s.add(fit(stock(spec.drizzle), 1.6)), jet = s.add(stream(tint));
      b.rotation.z = 1.9;
      jet.visible = true;
      sfx.pour();
      await world.tween(1.5, (k) => {
        const a = k * Math.PI * 5, r = (0.12 + 0.75 * k) * (f.r ?? Math.min(f.w, f.d) / 2);
        const lx = Math.cos(a) * r, lz = Math.sin(a) * r, p = t.localToWorld(v3(lx, f.y, lz));
        oil.userData.dot(lx, lz, 0.045, tint, 0.6);
        b.position.set(p.x + 1.5, p.y + 1.9, p.z);
        jet.userData.aim(v3(p.x, p.y + 1.35, p.z), p, 0.45);
      }, ease.linear);
      jet.visible = false;
      b.removeFromParent();
    }

    const zz = zigzag("x", stroke, () => live);
    return {
      async intro() {
        if (oil) await drizzle();
        await hop(world, tool, v3(mid.x, hoverY, mid.z), { height: 0.5, dur: 0.5 });
        ready = true;
      },
      start() { live = true; world.input = zz.input; },
      key: zz.key,
      async rescue() {
        live = false;
        while (n < strokes) { stroke(n % 2 ? 1 : -1); await world.wait(0.08); }
      },
      async outro() {
        ready = false;
        await hop(world, tool, v3(mid.x + 2.4, hoverY + 1.8, mid.z), { height: 0.4, dur: 0.4 });
      },
      finish() { s.dispose(); },
    };
  },
};
