// Montar: arrastar cada pedaço (muçarela, manjericão) até o alvo que pisca em cima da pizza.
import { piece } from "../foods.js";
import { aimScore, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, ring, squash, v3 } from "./common.js";

const TOL = 0.8;

export default {
  title: "Montar a cobertura",
  how: "Arraste cada pedaço até o alvo que pisca.",
  keys: "Espaço põe o pedaço no alvo.",
  gesture: "plate",
  shot: "bench",
  seconds: 25,

  create(world, ctx, spec) {
    const s = scope(world), t = world.dish[spec.on];
    if (!t) throw new Error(`Nada para montar em dish.${spec.on}`);
    const u = t.userData, f = u.face, N = spec.items.length, Y = f.y + 0.035;
    const spots = spec.items.map((_, i) => { const a = i / N * Math.PI * 2 + 0.3; return [Math.cos(a) * f.r * 0.58, Math.sin(a) * f.r * 0.58]; });
    const worldY = t.localToWorld(v3(0, Y, 0)).y;
    const halo = s.add(ring(0.3));
    halo.rotation.x = -Math.PI / 2; halo.visible = false;
    ctx.guide({ kind: "drop", at: () => (halo.visible ? halo.position : null), r: 0.4 });

    const scores = [];
    let n = 0, carried = null, live = false, busy = false;

    s.every((dt, time) => {
      halo.visible = live && n < N;
      if (!halo.visible) return;
      halo.position.copy(t.localToWorld(v3(spots[n][0], Y + 0.2, spots[n][1])));
      halo.scale.setScalar(1 + Math.sin(time * 5) * 0.08);
      halo.userData.set(1, carried ? "#5ad16a" : "#ffd23f");
    });

    function pickUp(p) {
      if (carried || busy || n >= N) return;
      carried = s.add(piece(spec.items[n]));
      carried.position.copy(p);
      sfx.pick();
    }
    async function place(l) { // `l`: onde soltou, em coordenadas da pizza
      const [tx, tz] = spots[n], out = Math.hypot(l.x, l.z) > f.r;
      if (out) l.setLength(f.r * 0.85); // fora da pizza não fica: escorrega para a borda
      const score = out ? 0 : aimScore(Math.hypot(l.x - tx, l.z - tz), 0, TOL);
      scores.push(score);
      const o = carried; carried = null; busy = true;
      await hop(world, o, t.localToWorld(v3(l.x, Y, l.z)), { height: 0.3, dur: 0.22 });
      u.top.attach(o);
      o.rotation.set(0, Math.random() * Math.PI * 2, 0);
      s.keep(o);
      if (spec.items[n] === "mozzarella") u.cheese.push(o);
      sfx.plop();
      squash(world, o, 0.25, 0.3);
      const w = t.localToWorld(v3(l.x, Y + 0.6, l.z));
      if (live) score > 0.75 ? (world.fx.sparkle(w, 8), ctx.good(w, "No alvo!")) : score > 0.35 ? ctx.good(w, "Pertinho") : ctx.bad(w, "Longe do alvo");
      n++; busy = false;
      ctx.progress(n / N);
      if (n === N && live) { live = false; ctx.done(average(scores)); }
    }
    const onTarget = (jitter) => {
      const [x, z] = spots[n];
      pickUp(t.localToWorld(v3(x, Y + 0.6, z)));
      return place(v3(x + (Math.random() - 0.5) * jitter, 0, z + (Math.random() - 0.5) * jitter));
    };

    return {
      async intro() { await world.wait(0.2); },
      start() {
        live = true;
        world.input = {
          down: (e) => { const p = world.planeHit(e, worldY + 0.5); if (live && p) pickUp(p); },
          move: (e) => { const p = world.planeHit(e, worldY + 0.5); if (carried && p) carried.position.copy(p); },
          up: (e) => {
            if (!carried || !live) return;
            const p = world.planeHit(e, worldY);
            place(p ? t.worldToLocal(p).setY(0) : v3(9, 0, 9));
          },
        };
      },
      key(e, down) {
        if (!down || !live || e.repeat || (e.key !== " " && e.key !== "Enter")) return;
        e.preventDefault();
        if (!carried && !busy) onTarget(0.3);
      },
      async rescue() {
        live = false;
        while (n < N) await (busy ? world.wait(0.05) : carried ? place(v3(spots[n][0], 0, spots[n][1])) : onTarget(0));
      },
      finish() { s.dispose(); },
    };
  },
};
