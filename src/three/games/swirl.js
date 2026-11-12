// Mexer em círculos dentro de um recipiente (tigela ou copo), com a colher da vez.
// O gesto é lido na tela, em volta do recipiente: funciona de cima e de frente.
import { THREE, build } from "../kit.js";
import { barSpoon } from "../gear.js";
import { angleDelta } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, speedScore, vessels, inside, mouthOf, rimOf, v3 } from "./common.js";

const UP = v3(0, 1, 0);

export default {
  title: "Misturar",
  how: "Faça círculos em volta do recipiente até misturar tudo.",
  keys: "Segure ← ou → para mexer.",
  gesture: "circle",
  shot: "bowl",
  seconds: 18,

  create(world, ctx, spec) {
    const s = scope(world), v = vessels(world, spec.into)[0], u = v.userData;
    const goal = (spec.turns ?? 3) * Math.PI * 2;
    const mouth = mouthOf(v), r = rimOf(v) * 0.5;
    const solids = inside(v);
    const dipY = () => v.localToWorld(v3(0, Math.max(u.surface() - 0.25, (u.floor ?? 0.1) + 0.1), 0)).y;
    const tool = s.add(spec.tool === "barSpoon" ? barSpoon() : build.spoon());
    if (spec.tool !== "barSpoon") tool.scale.setScalar(1.25);
    tool.position.set(mouth.x + 2.2, mouth.y + 2.2, mouth.z + 0.4);

    const from = u.liquid.material.color.clone(), to = spec.color ? new THREE.Color(spec.color) : from;
    const melting = solids.children.filter((o) => o.userData.melts);
    let total = 0, angle = 0, live = false, used = 0, last = null, held = 0, idle = 0;
    ctx.guide({ kind: () => (total < goal ? "circle" : null), at: mouth, r: rimOf(v) * 0.8 });

    const place = () => {
      tool.position.set(mouth.x + Math.cos(angle) * r, dipY(), mouth.z + Math.sin(angle) * r);
      tool.rotation.set(Math.sin(angle) * 0.3, 0, -Math.cos(angle) * 0.3);
    };

    function turn(d) {
      if (total >= goal) return;
      idle = 0;
      const before = total;
      total += Math.abs(d); angle += d;
      place();
      const k = Math.min(1, total / goal);
      solids.rotation.y -= d * 0.6;
      u.liquid.rotateOnWorldAxis(UP, -d * 0.6); // o líquido da tigela é um disco deitado: gira no eixo do mundo
      u.liquid.material.color.copy(from).lerp(to, k);
      for (const o of melting) o.scale.setScalar(Math.max(0.01, 1 - k));
      ctx.progress(k);
      if (Math.floor(before / Math.PI) !== Math.floor(total / Math.PI)) sfx.mix(spec.tool === "barSpoon" ? "glass" : "bowl");
      if (total >= goal) {
        melting.forEach((o) => o.removeFromParent());
        const at = mouth.clone().add(v3(0, 0.5, 0));
        world.fx.sparkle(at, 12);
        if (live) { live = false; ctx.good(at, "Misturado!"); ctx.done(speedScore(used, 11)); }
      }
    }

    s.every((dt) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 2.2) { idle = -2; ctx.say("Mexe, mexe! Em roda!"); }
      if (held && live) turn(held * dt * 6);
    });

    return {
      async intro() {
        angle = 0;
        await hop(world, tool, v3(mouth.x + r, dipY(), mouth.z), { height: 0.6, dur: 0.5 });
        place();
      },
      start() {
        live = true;
        world.input = {
          move: (e) => {
            const c = world.toScreen(mouth), dx = e.clientX - c.x, dy = e.clientY - c.y;
            if (!live || Math.hypot(dx, dy) < 18) { last = null; return; }
            const a = Math.atan2(dy, dx);
            if (last != null) { const d = angleDelta(last, a); turn(Math.sign(d) * Math.min(0.8, Math.abs(d))); }
            last = a;
          },
        };
      },
      key(e, down) {
        const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
        if (!d) return;
        e.preventDefault();
        held = down ? d : 0;
      },
      async rescue() {
        live = false;
        while (total < goal) { turn(0.4); await world.wait(0.03); }
      },
      async outro() {
        await hop(world, tool, v3(mouth.x + 2.4, mouth.y + 2.6, mouth.z + 0.6), { height: 0.4, dur: 0.4 });
      },
      finish() { s.dispose(); },
    };
  },
};
