// Molhar os biscoitos: segurar para mergulhar no café e soltar na medida.
// De menos fica seco, demais desmancha. Cada um vai deitar na travessa.
import { THREE } from "../kit.js";
import { STATION_X } from "../sets.js";
import { glassDish } from "../gear.js";
import { espresso, ladyfinger } from "../foods.js";
import { bandScore, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, v3 } from "./common.js";

const N = 4, LO = 0.45, HI = 0.7, SLACK = 0.25, RATE = 0.42, CUP = 1.35;
const DRY = new THREE.Color("#f2d28c"), WET = new THREE.Color("#8a5a2c");

export default {
  title: "Molhar os biscoitos",
  how: "Segure para mergulhar o biscoito no café e solte quando entrar na faixa.",
  keys: "Segure Espaço para mergulhar, solte para tirar.",
  gesture: "hold",
  shot: "bench",
  seconds: 25,

  create(world, ctx) {
    const s = scope(world), bench = world.kitchen.stations.bench, top = bench.userData.top;
    const C = v3(STATION_X.bench, top, bench.position.z);
    const cup = s.add(espresso());
    cup.scale.setScalar(CUP);
    cup.position.set(C.x - 1.3, top, C.z);
    const dish = glassDish(2.3, 1.8), inner = dish.userData.inner;
    dish.position.set(C.x + 1.0, top, C.z);
    world.scene.add(dish);
    world.dish.tiramisu = dish; // a travessa segue até a geladeira
    const coffeeY = top + cup.userData.surface * CUP, hoverY = coffeeY + 0.85, dunkY = coffeeY + 0.2;

    const scores = [];
    let n = -1, b = null, soak = 0, held = false, live = false, phase = "idle";
    ctx.guide({ kind: () => (phase === "ready" ? "hold" : null), at: v3(cup.position.x, coffeeY, C.z + 0.4), r: 0.5 });

    async function bring() {
      n++;
      if (n >= N) {
        phase = "done";
        dish.userData.face = { y: inner.y + 0.19, w: inner.w, d: inner.d }; // por cima dos biscoitos
        if (live) { live = false; ctx.done(average(scores)); }
        return;
      }
      b = ladyfinger();
      world.scene.add(b);
      b.rotation.z = Math.PI / 2; // em pé, para mergulhar a ponta
      b.position.set(cup.position.x, hoverY + 2.5, C.z);
      soak = 0;
      ctx.gauge({ kind: "band", level: 0, lo: LO, hi: HI, label: "Café" });
      await world.tween(0.3, (k) => { b.position.y = hoverY + 2.5 * (1 - k); });
      phase = "ready";
    }

    async function release() {
      if (phase !== "ready") return;
      phase = "lay"; held = false;
      const score = bandScore(soak, LO, HI, SLACK), o = b;
      scores.push(score);
      const at = v3(cup.position.x, hoverY + 0.6, C.z);
      if (score >= 0.85) { world.fx.sparkle(at, 8); ctx.good(at, "Na medida!"); }
      else if (score > 0.3) ctx.good(at, soak < LO ? "Meio seco" : "Molhou um pouco demais");
      else ctx.bad(at, soak < LO ? "Sequinho!" : "Encharcou!");
      await world.tween(0.2, (k) => { o.position.y += (hoverY - o.position.y) * k; });
      o.rotation.set(0, Math.PI / 2, 0); // deitado, ao comprido da travessa
      await hop(world, o, dish.localToWorld(v3((n - (N - 1) / 2) * 0.5, inner.y, 0)), { height: 0.8, dur: 0.45 });
      dish.attach(o);
      sfx.plop("place");
      ctx.progress((n + 1) / N);
      if (s.alive) await bring();
    }

    s.every((dt) => {
      if (phase !== "ready") return;
      b.position.y += ((held ? dunkY : hoverY) - b.position.y) * Math.min(1, dt * 9);
      if (!held || b.position.y > coffeeY + 0.45) return;
      soak += RATE * dt;
      b.userData.mat.color.copy(DRY).lerp(WET, Math.min(1, soak / HI));
      if (Math.random() < dt * 6) world.fx.bits(v3(cup.position.x, coffeeY, C.z), ["#2e1508"], 1, { size: 0.04, speed: 0.6, up: 1.2, floor: coffeeY });
      ctx.gauge({ kind: "band", level: soak, lo: LO, hi: HI, label: "Café" });
      if (soak > HI + SLACK) release(); // desmanchou: sai sozinho
    });

    const press = () => { if (live && phase === "ready") { held = true; sfx.plop("dip"); } };
    const lift = () => { if (held && soak > 0.03) release(); else held = false; };
    return {
      async intro() { await bring(); },
      start() { live = true; world.input = { down: press, up: lift }; },
      key(e, down) {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (e.repeat) return;
        down ? press() : lift();
      },
      async rescue() {
        live = false;
        while (phase !== "done") {
          if (phase === "ready") { soak = (LO + HI) / 2; b.userData.mat.color.copy(DRY).lerp(WET, soak / HI); await release(); }
          else await world.wait(0.05);
        }
      },
      finish() { ctx.gauge(null); s.dispose(); },
    };
  },
};
