// Espalhar: arrastar a colher pintando a superfície (molho na massa, creme na travessa)
// até cobrir tudo.
import { RoundedBoxGeometry, build, mesh, food } from "../kit.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, speedScore, addLayer, v3 } from "./common.js";

const GRID = 10, FULL = 0.93; // malha que mede a cobertura; com isso de coberto, está pronto

export default {
  title: "Espalhar",
  how: "Arraste por toda a superfície até cobrir tudo.",
  keys: "Segure Espaço para espalhar em espiral.",
  gesture: "circle",
  shot: "bench",
  seconds: 20,

  create(world, ctx, spec) {
    const s = scope(world), t = world.dish[spec.on];
    if (!t) throw new Error(`Nada para cobrir em dish.${spec.on}`);
    const f = t.userData.face, lay = addLayer(t), lu = lay.userData;
    const brush = Math.min(lu.w, lu.d) * 0.17, center = t.localToWorld(v3(0, f.y, 0));
    const cells = [];
    for (let i = 0; i < GRID; i++) for (let j = 0; j < GRID; j++) {
      const lx = ((i + 0.5) / GRID - 0.5) * lu.w, lz = ((j + 0.5) / GRID - 0.5) * lu.d;
      if (lu.within(lx, lz)) cells.push({ lx, lz, on: false });
    }
    const spoon = s.add(build.spoon());
    spoon.scale.setScalar(1.2); spoon.rotation.z = -0.5;
    spoon.position.copy(center).add(v3(2, 2.2, 0));

    let covered = 0, dabs = 0, live = false, used = 0, idle = 0, full = false, spiral = 0, held = false, pressed = false;
    ctx.guide({ kind: () => (full ? null : "circle"), at: center, r: Math.min(lu.w, lu.d) * 0.36 });

    function complete() {
      full = true;
      lu.flood(spec.color);
      const at = center.clone().add(v3(0, 0.5, 0));
      world.fx.sparkle(at, 12);
      if (live) { live = false; ctx.good(at, "Bem espalhado!"); ctx.done(speedScore(used, 14)); }
    }
    function paint(lx, lz) {
      if (full) return;
      idle = 0;
      lu.dot(lx, lz, brush, spec.color, 0.95);
      for (const c of cells) if (!c.on && Math.hypot(c.lx - lx, c.lz - lz) < brush) { c.on = true; covered++; }
      spoon.position.copy(lay.localToWorld(v3(lx, 0.03, lz)));
      if (++dabs % 8 === 0) sfx.spread(spec.on);
      const k = covered / cells.length;
      ctx.progress(Math.min(1, k / FULL));
      if (k >= FULL) complete();
    }
    // espiral do centro para fora: o teclado e o chef espalham assim
    function auto(dt, speed = 0.28) {
      spiral = Math.min(1, spiral + dt * speed);
      const a = spiral * Math.PI * 12, lx = Math.cos(a) * spiral * lu.w * 0.72, lz = Math.sin(a) * spiral * lu.d * 0.72;
      if (lu.within(lx, lz)) paint(lx, lz);
      if (spiral >= 1 && !full) complete();
    }

    s.every((dt) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 2.2) { idle = -2; ctx.say("Arraste por cima para espalhar!"); }
      if (live && held) auto(dt);
    });

    const at = (e) => {
      const p = world.planeHit(e, center.y);
      if (!p || !live) return;
      const l = lay.worldToLocal(p);
      if (lu.within(l.x, l.z)) paint(l.x, l.z);
    };
    return {
      async intro() {
        await hop(world, spoon, center.clone().add(v3(0, 0.05, 0)), { height: 0.5, dur: 0.5 });
      },
      start() {
        live = true;
        world.input = { down: (e) => { pressed = true; at(e); }, move: (e) => { if (pressed) at(e); }, up: () => { pressed = false; } };
      },
      key(e, down) {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        held = down;
      },
      async rescue() {
        live = false;
        while (!full) { auto(0.03, 0.6); await world.wait(0.02); }
      },
      async outro() {
        hop(world, spoon, center.clone().add(v3(2.2, 2.4, 0)), { height: 0.4, dur: 0.4 });
        if (!spec.thick) return;
        // o creme ganha corpo: sobe como uma camada de verdade
        const slab = mesh(new RoundedBoxGeometry(f.w, spec.thick, f.d, 2, 0.05).translate(0, spec.thick / 2, 0), food({ color: spec.color, roughness: 0.55, clearcoat: 0.2 }));
        slab.position.y = f.y;
        t.add(slab);
        const y0 = lay.position.y;
        await world.tween(0.4, (k) => { slab.scale.y = Math.max(0.01, k); lay.position.y = y0 + spec.thick * k; });
        f.y += spec.thick;
      },
      finish() {
        if (spec.from === "bowl") { // o creme saiu da tigela
          const bowl = world.kitchen.stations.bowl;
          bowl.userData.level = 0; bowl.userData.fill(0);
        }
        s.dispose();
      },
    };
  },
};
