// Liquidificador. Modo normal: segurar para acelerar e manter o ponteiro na faixa verde.
// Modo "pulse": toques rápidos, cada um é um tranco que quebra o gelo.
import { THREE } from "../kit.js";
import { sfx } from "../../game/sound.js";
import { scope, speedScore, inside, mouthOf, v3 } from "./common.js";

const LO = 0.5, HI = 0.78, NEED = 4.2; // segundos na faixa para ficar pronto

export default {
  title: "Bater no liquidificador",
  how: "Segure para acelerar e mantenha o ponteiro na faixa verde.",
  keys: "Segure Espaço para acelerar, solte para frear.",
  gesture: "hold",
  shot: "blender",
  seconds: 20,

  create(world, ctx, spec) {
    const s = scope(world), st = world.kitchen.stations.blender, jar = st.userData.jar, u = jar.userData;
    const pulse = spec.mode === "pulse", pulses = spec.pulses ?? 10;
    const solids = [...inside(jar).children], sizes = solids.map((o) => o.scale.x);
    const from = u.liquid.material.color.clone(), to = spec.color ? new THREE.Color(spec.color) : from.clone();
    const top = mouthOf(jar);
    let live = false, held = false, level = 0, good = 0, off = 0, used = 0, hum = 0, warn = 0, hits = 0, done = false;
    ctx.guide({ kind: () => (done ? null : pulse ? "rapid" : "hold"), at: top.clone().add(v3(0, -0.9, 0.4)), r: 0.6 });

    // k de 0 a 1: os pedaços somem e a cor chega na do creme pronto
    function mash(k) {
      solids.forEach((o, i) => { o.scale.setScalar(Math.max(0.01, sizes[i] * (1 - k))); });
      u.liquid.material.color.copy(from).lerp(to, k);
      ctx.progress(k);
    }
    function finishUp() {
      done = true;
      solids.forEach((o) => o.removeFromParent());
      world.fx.sparkle(top.clone().add(v3(0, 0.4, 0)), 12);
      if (!live) return;
      live = false;
      ctx.good(top.clone().add(v3(0, 0.6, 0)), pulse ? "Gelo quebrado!" : "Cremoso!");
      ctx.done(pulse ? speedScore(used, 9) : Math.max(0.25, good / (good + off * 0.7)));
    }

    function tap() { // um tranco
      if (done || hits >= pulses) return;
      hits++;
      level = 1;
      sfx.crush();
      world.shake(0.05);
      mash(hits / pulses);
      if (hits === pulses) finishUp();
    }

    s.every((dt, t) => {
      if (live) used += dt;
      if (pulse) level = Math.max(0, level - dt * 3.5);
      else if (!done) {
        level = Math.max(0, Math.min(1, level + (held ? 0.75 : -0.6) * dt));
        const inBand = level >= LO && level <= HI;
        if (live && level > 0.1) inBand ? (good += dt) : (off += dt);
        if (live && inBand) { mash(Math.min(1, good / NEED)); if (good >= NEED) finishUp(); }
        warn -= dt;
        if (live && level > HI + 0.1 && warn <= 0) { warn = 2.5; world.shake(0.06); ctx.say("Devagar, vai espirrar!", "sad"); }
        if (live) ctx.gauge({ kind: "band", level, lo: LO, hi: HI, label: "Velocidade" });
      } else level = Math.max(0, level - dt * 1.5);
      st.userData.speed = level;
      // o que está dentro gira e pula com as lâminas
      inside(jar).rotation.y -= dt * level * 14;
      u.liquid.rotation.y -= dt * level * 9;
      solids.forEach((o, i) => { if (o.parent) o.position.y += Math.sin(t * 30 + i * 2) * level * dt * 1.2; });
      sfx.loop("pot", level * 0.8); // o líquido batendo no copo
      hum -= dt;
      if (level > 0.08 && hum <= 0 && !pulse) { sfx.blend(level); hum = 0.2; }
    });

    const press = () => { if (!live) return; pulse ? tap() : (held = true); };
    return {
      async intro() { u.open(0); await world.wait(0.3); },
      start() {
        live = true;
        world.input = { down: press, up: () => { held = false; } };
      },
      key(e, down) {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (e.repeat) return;
        down ? press() : (held = false);
      },
      async rescue() {
        live = false; held = false;
        if (pulse) { while (hits < pulses) { tap(); await world.wait(0.12); } return; }
        level = (LO + HI) / 2;
        await world.tween(1.2, (k) => mash(k));
        finishUp();
        await world.tween(0.5, (k) => { level = (LO + HI) / 2 * (1 - k); });
      },
      finish() { st.userData.speed = 0; ctx.gauge(null); s.dispose(); },
    };
  },
};
