// Molho: segurar para inclinar a garrafa e soltar quando o medidor estiver na faixa.
// Depois, uma colherada de amido por cima.
import { THREE, build, mix, rgb } from "../kit.js";
import { STATION_X } from "../sets.js";
import { bandScore } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, squash, stream, v3 } from "./common.js";

const SLACK = 0.18;
// faixa de cada garrafa no medidor (0 a 1) e quanto ela enche a tigela
const BOTTLES = [
  { id: "soy", name: "Shoyu", lo: 0.55, hi: 0.72, color: "#3a1a0a", fill: 0.22 },
  { id: "oyster", name: "Molho de ostra", lo: 0.4, hi: 0.55, color: "#5e3416", fill: 0.16 },
  { id: "sesame", name: "Óleo de gergelim", lo: 0.16, hi: 0.28, color: "#d8952a", fill: 0.07 },
];
const RATE = 0.36; // medidor por segundo com a garrafa bem inclinada
const TILT = 1.95, POUR_AT = 1.3;

export default {
  title: "Preparar o molho",
  how: "Segure para despejar e solte quando o medidor entrar na faixa.",
  keys: "Segure Espaço para despejar, solte para parar.",
  gesture: "hold",
  shot: "bowl",
  seconds: 30,

  create(world, ctx) {
    const s = scope(world);
    const { stations, props } = world.kitchen;
    const bowl = stations.bowl;
    const bowlTop = v3(STATION_X.bowl, 0, bowl.position.z);
    const liquid = bowl.userData.liquid;
    const jet = s.add(stream("#3a1a0a"));
    // a garrafa gira em volta da base: o grupo `pivot` fica na lateral da tigela
    const pivot = s.add(new THREE.Group());
    pivot.position.set(STATION_X.bowl + 1.75, 2.1, bowl.position.z + 0.1);

    const scores = [];
    let n = -1, level = 0, held = false, live = false, phase = "idle", bottle = null, home = null, total = 0, wait = 0;
    let tint = rgb("#3a1a0a"), amount = 0, rescuing = false;

    const fillTo = (k) => bowl.userData.fill(Math.min(0.7, k));
    const liquidY = () => bowl.localToWorld(v3(0, liquid.position.y, 0)).y;

    async function next() {
      n++;
      if (n >= BOTTLES.length) return spoon();
      const b = BOTTLES[n];
      level = 0; held = false; phase = "hop";
      ctx.gauge({ kind: "band", level: 0, lo: b.lo, hi: b.hi, label: b.name });
      jet.material.color.set(b.color);
      const prop = props[b.id];
      home = { pos: prop.position.clone(), rot: prop.rotation.clone(), parent: prop.parent };
      bottle = prop;
      // sai da prateleira para a mão: pula até a lateral da tigela
      const at = prop.getWorldPosition(v3(0, 0, 0));
      world.scene.attach(prop);
      prop.position.copy(at);
      await hop(world, prop, pivot.position.clone(), { height: 1.4, dur: 0.55 });
      pivot.attach(prop);
      prop.position.set(0, 0, 0);
      prop.rotation.set(0, 0, 0);
      phase = "ready";
    }

    async function release() {
      const b = BOTTLES[n];
      phase = "back";
      jet.visible = false;
      const score = bandScore(level, b.lo, b.hi, SLACK);
      scores.push(score);
      const at = bowl.getWorldPosition(v3(0, 1.6, 0));
      if (score >= 0.85) { world.fx.sparkle(at, 10); ctx.good(at, level > b.hi ? "No limite!" : "Na medida!"); }
      else if (score > 0.3) ctx.good(at, level < b.lo ? "Faltou um pouco" : "Passou um pouco");
      else ctx.bad(at, level < b.lo ? "Pouquinho demais!" : "Exagerou!");
      ctx.progress(scores.length / (BOTTLES.length + 1));
      await world.tween(0.3, (k) => { pivot.rotation.z = pivot.rotation.z * (1 - k); });
      // volta para o lugar dela
      const p = bottle;
      world.scene.attach(p);
      await hop(world, p, home.pos.clone(), { height: 1.2, dur: 0.5 });
      home.parent.attach(p);
      p.position.copy(home.pos); p.rotation.copy(home.rot);
      sfx.plop();
      bottle = null;
      if (live || rescuing) await next();
    }

    // amido: a colher vem cheia, um toque e ela vira, deixando uma ilha branca no molho
    let spoonObj = null;
    async function spoon() {
      ctx.gauge(null);
      spoonObj = s.add(build.spoon());
      const heap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), new THREE.MeshStandardMaterial({ color: "#fffdf6", roughness: 1 }));
      heap.scale.set(1, 0.6, 1.3); heap.position.y = 0.06;
      spoonObj.add(heap);
      spoonObj.userData.heap = heap;
      spoonObj.scale.setScalar(1.3);
      spoonObj.rotation.set(0, 0, 0.9);
      spoonObj.position.copy(props.cornstarch.getWorldPosition(v3(0, 1, 0)));
      await hop(world, spoonObj, v3(STATION_X.bowl + 0.5, 1.9, bowl.position.z), { height: 1, dur: 0.5 });
      phase = "spoon";
      ctx.say("Agora uma colherada de amido: toque!");
    }
    async function dropStarch() {
      phase = "done";
      sfx.swish();
      await world.tween(0.25, (k) => { spoonObj.rotation.z = 0.9 - k * 2.6; });
      spoonObj.userData.heap.visible = false;
      const island = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), new THREE.MeshStandardMaterial({ color: "#fffaf0", roughness: 1 }));
      island.rotation.x = -Math.PI / 2;
      island.position.set(0.1, liquid.position.y + 0.006, 0);
      bowl.add(island);
      world.dish.island = island;
      world.fx.steam(v3(STATION_X.bowl, liquidY() + 0.2, bowl.position.z), 3, { color: "#ffffff", size: 0.6, rise: 0.5 });
      sfx.plop();
      squash(world, bowl, 0.06);
      const at = bowl.getWorldPosition(v3(0, 1.6, 0));
      ctx.progress(1);
      if (live) ctx.good(at, "Amido!");
      await hop(world, spoonObj, props.cornstarch.getWorldPosition(v3(0, 1.2, 0)), { height: 0.8, dur: 0.45 });
      spoonObj.visible = false;
      if (live) { live = false; ctx.done(scores.reduce((a, b) => a + b, 0) / scores.length); }
    }

    s.every((dt, t) => {
      if (phase !== "ready" || !bottle) return;
      const b = BOTTLES[n];
      const want = held ? TILT : 0.2;
      pivot.rotation.z += (want - pivot.rotation.z) * Math.min(1, dt * (held ? 3.2 : 8));
      const flow = Math.max(0, (pivot.rotation.z - POUR_AT) / (TILT - POUR_AT));
      jet.visible = flow > 0.02;
      if (!jet.visible) { sfxWait(dt, false); return; }
      level += RATE * flow * dt;
      amount += b.fill / ((b.lo + b.hi) / 2) * RATE * flow * dt;
      // a cor do molho mistura o que já está com o que cai
      tint = mix(tint, rgb(b.color), Math.min(1, flow * dt * (total < 0.01 ? 50 : 1.2)));
      liquid.material.color.setRGB(tint[0] / 255, tint[1] / 255, tint[2] / 255, THREE.SRGBColorSpace);
      total = amount;
      fillTo(total);
      const mouth = bottle.localToWorld(bottle.userData.mouth.clone());
      const below = v3(mouth.x - 0.12, liquidY(), mouth.z);
      jet.userData.aim(mouth, below, 0.5 + flow * 0.8 + Math.sin(t * 30) * 0.05);
      sfxWait(dt, true);
      if (Math.random() < flow * dt * 8) world.fx.bits(below, [b.color], 1, { size: 0.05, speed: 0.8, up: 1.2, floor: below.y });
      ctx.gauge({ kind: "band", level, lo: b.lo, hi: b.hi, label: b.name });
      if (level > b.hi + SLACK) { held = false; release(); } // transbordou: para sozinho
    });
    function sfxWait(dt, on) {
      wait -= dt;
      if (on && wait <= 0) { sfx.pour(); wait = 0.24; }
    }

    // segurar enquanto a garrafa ainda chega já vale: ela inclina assim que chegar
    const press = () => { if (!live) return; if (phase === "ready" || phase === "hop") held = true; else if (phase === "spoon") dropStarch(); };
    const lift = () => {
      if (!held) return;
      held = false;
      if (phase === "ready" && level > 0.03) release();
    };

    return {
      async intro() { liquid.visible = false; await next(); },
      start() {
        live = true;
        world.input = { down: press, up: lift };
      },
      key(e, down) {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (e.repeat) return;
        down ? press() : lift();
      },
      async rescue() {
        live = false; rescuing = true;
        // o chef despeja certinho o que faltou
        while (phase !== "done") {
          if (phase === "ready") {
            const b = BOTTLES[n];
            phase = "rescue";
            pivot.rotation.z = 0;
            level = (b.lo + b.hi) / 2;
            amount += b.fill;
            fillTo(amount);
            await release();
          } else if (phase === "spoon") await dropStarch();
          else await world.wait(0.05);
        }
      },
      finish() {
        jet.visible = false;
        ctx.gauge(null);
        world.dish.sauceColor = liquid.material.color.clone();
        s.dispose();
      },
    };
  },
};
