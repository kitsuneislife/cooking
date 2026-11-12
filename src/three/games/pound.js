// Socar: toques rápidos com o socador. Os gomos amassam, o açúcar some e o suco sobe.
import { muddler } from "../gear.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, speedScore, vessels, inside, mouthOf, v3 } from "./common.js";

export default {
  title: "Socar",
  how: "Toque bem rápido para socar tudo no fundo do copo.",
  keys: "Aperte Espaço sem parar.",
  gesture: "rapid",
  shot: "bar",
  seconds: 15,

  create(world, ctx, spec) {
    const s = scope(world), v = vessels(world, spec.into)[0], u = v.userData;
    const taps = spec.taps ?? 12, juice = spec.fill ?? 0.3, color = spec.color ?? "#d7ec9a";
    const solids = [...inside(v).children], base = solids.map((o) => o.scale.clone());
    const mouth = mouthOf(v), bottom = v.localToWorld(v3(0, u.floor + 0.22, 0)).y, hoverY = mouth.y + 0.25;
    const tool = s.add(muddler());
    tool.position.set(mouth.x + 1.6, mouth.y + 2.4, mouth.z);

    let n = 0, live = false, busy = false, used = 0, idle = 0;
    ctx.guide({ kind: () => (n < taps ? "rapid" : null), at: mouth, r: 0.55 });

    s.every((dt) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 1.6) { idle = -2; ctx.say("Soca, soca! Mais rápido!"); }
    });

    async function hit() {
      if (busy || n >= taps) return;
      busy = true; idle = 0;
      await world.tween(0.06, (k) => { tool.position.y = hoverY + (bottom - hoverY) * k; });
      n++;
      const k = n / taps;
      sfx.thud();
      world.shake(0.04);
      solids.forEach((o, i) => {
        if (o.userData.melts) o.scale.copy(base[i]).multiplyScalar(Math.max(0.01, 1 - k));
        else o.scale.set(base[i].x * (1 + 0.25 * k), base[i].y * (1 - 0.5 * k), base[i].z * (1 + 0.25 * k));
      });
      u.level = juice * k;
      u.fill(u.level);
      u.liquid.material.color.set(color);
      world.fx.bits(v3(mouth.x, bottom + 0.2, mouth.z), [color, "#ffffff"], 3, { size: 0.05, speed: 0.8, up: 2.4, floor: bottom });
      ctx.progress(k);
      await world.tween(0.08, (j) => { tool.position.y = bottom + (hoverY - bottom) * j; });
      busy = false;
      if (n < taps) return;
      solids.forEach((o) => { if (o.userData.melts) o.removeFromParent(); });
      const at = mouth.clone().add(v3(0, 0.5, 0));
      world.fx.sparkle(at, 12);
      if (live) { live = false; ctx.good(at, "Bem socado!"); ctx.done(speedScore(used, 10)); }
    }

    return {
      async intro() { await hop(world, tool, v3(mouth.x, hoverY, mouth.z), { height: 0.5, dur: 0.5 }); },
      start() {
        live = true;
        world.input = { down: () => { if (live) hit(); } };
      },
      key(e, down) {
        if (down && live && !e.repeat && (e.key === " " || e.key === "Enter")) { e.preventDefault(); hit(); }
      },
      async rescue() {
        live = false;
        while (n < taps) await (busy ? world.wait(0.03) : hit());
      },
      async outro() {
        await hop(world, tool, v3(mouth.x + 2, mouth.y + 2.6, mouth.z), { height: 0.4, dur: 0.4 });
      },
      finish() { s.dispose(); },
    };
  },
};
