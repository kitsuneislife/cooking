// Despejar: segurar para inclinar a garrafa (ou a jarra do liquidificador) e soltar quando
// o medidor estiver na faixa. `spec.pours` diz o que cai, em que ordem e quanto;
// `spec.into` diz onde. Com `spec.starch`, fecha com uma colherada de amido.
import { THREE, build, fit } from "../kit.js";
import { stock, PANTRY } from "../foods.js";
import { bandScore, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, squash, stream, vessels, mouthOf, surfaceOf, v3 } from "./common.js";

const SLACK = 0.18;
const RATE = 0.36; // medidor por segundo com a garrafa bem inclinada
const TILT = 1.95, POUR_AT = 1.3, CAP = 0.85;
const Z = v3(0, 0, 1);

export default {
  title: "Preparar o molho",
  how: "Segure para despejar e solte quando o medidor entrar na faixa.",
  keys: "Segure Espaço para despejar, solte para parar.",
  gesture: "hold",
  shot: "bowl",
  seconds: 30,

  create(world, ctx, spec, game) {
    const s = scope(world);
    const { stations, props } = world.kitchen;
    const targets = vessels(world, spec.into ?? "bowl"), bowl = targets[0];
    const jar = stations.blender.userData.jar;
    const nameOf = (id) => game.ingredients.find((i) => i.id === id)?.name;
    // cada despejo: de onde sai (`from: "blender"` é a jarra), a cor e para qual recipiente vai
    const POURS = spec.pours.map((p, i) => ({
      ...p, name: p.name ?? nameOf(p.id), target: targets[i % targets.length],
      color: p.from === "blender" ? jar.userData.liquid.material.color.clone() : new THREE.Color(PANTRY[p.id].tint),
    }));
    // garrafa que não mora na cozinha: `fit` embrulha o modelo, então a boca sobe junto para o embrulho
    const shelfless = (id) => {
      const m = stock(id), wrap = fit(m, 1.9);
      wrap.userData.mouth = m.userData.mouth.clone().multiply(m.scale).add(m.position);
      return wrap;
    };
    const steps = POURS.length + (spec.starch ? 1 : 0);
    const jet = s.add(stream("#ffffff"));
    // a garrafa gira em volta da base: o grupo `pivot` fica ao lado do recipiente
    const pivot = s.add(new THREE.Group());

    const scores = [];
    let n = -1, level = 0, held = false, live = false, phase = "idle", bottle = null, home = null, rescuing = false;
    // a jarra esvazia na proporção do que os copos recebem
    let jarLeft = jar.userData.level ?? 0;
    const jarShare = jarLeft / (POURS.reduce((a, p) => a + (p.from === "blender" ? p.fill : 0), 0) || 1);
    ctx.guide({
      kind: () => (phase === "spoon" ? "tap" : phase === "ready" || phase === "hop" ? "hold" : null),
      at: () => mouthOf(phase === "spoon" ? bowl : POURS[Math.max(0, n)].target).add(v3(0, 0, 0.5)), r: 0.6,
    });

    const fillTo = (v, k) => { v.userData.level = k; v.userData.fill(Math.min(CAP, k)); };
    const finish = () => { phase = "done"; ctx.gauge(null); if (live) { live = false; ctx.done(average(scores)); } };

    async function next() {
      n++;
      if (n >= POURS.length) return spec.starch ? spoon() : finish();
      const b = POURS[n];
      level = 0; held = false; phase = "hop";
      ctx.gauge({ kind: "band", level: 0, lo: b.lo, hi: b.hi, label: b.name });
      jet.material.color.copy(b.color);
      // vem da prateleira, do liquidificador ou (se não mora na cozinha) aparece ao lado
      const prop = b.from === "blender" ? jar : props[b.id] ?? shelfless(b.id);
      const fresh = !prop.parent;
      if (prop === jar) jar.userData.lid.visible = false; // sem tampa para servir
      if (fresh) { s.add(prop); prop.position.copy(mouthOf(b.target)).add(v3(2.6, 3, 0)); }
      home = { pos: prop.position.clone(), rot: prop.rotation.clone(), parent: prop.parent, fresh };
      bottle = prop;
      const at = prop.getWorldPosition(v3(0, 0, 0));
      world.scene.attach(prop);
      prop.position.copy(at);
      // o pivô fica onde a boca, com a garrafa deitada, para bem em cima do recipiente
      const m = prop.userData.mouth.clone().multiply(prop.scale).applyAxisAngle(Z, TILT);
      pivot.rotation.z = 0;
      pivot.position.copy(mouthOf(b.target)).add(v3(0.12 - m.x, 0.5 - m.y, 0.1));
      await hop(world, prop, pivot.position.clone(), { height: 1.4, dur: 0.55 });
      pivot.attach(prop);
      prop.position.set(0, 0, 0);
      prop.rotation.set(0, 0, 0);
      phase = "ready";
    }

    async function release() {
      const b = POURS[n];
      phase = "back";
      jet.visible = false;
      const score = bandScore(level, b.lo, b.hi, SLACK);
      scores.push(score);
      const at = mouthOf(b.target).add(v3(0, 0.6, 0));
      if (score >= 0.85) { world.fx.sparkle(at, 10); ctx.good(at, level > b.hi ? "No limite!" : "Na medida!"); }
      else if (score > 0.3) ctx.good(at, level < b.lo ? "Faltou um pouco" : "Passou um pouco");
      else ctx.bad(at, level < b.lo ? "Pouquinho demais!" : "Exagerou!");
      ctx.progress(scores.length / steps);
      await world.tween(0.3, (k) => { pivot.rotation.z = pivot.rotation.z * (1 - k); });
      // volta para o lugar dela
      const p = bottle;
      world.scene.attach(p);
      if (home.fresh) await hop(world, p, p.position.clone().add(v3(2.6, 3, 0)), { height: 0.4, dur: 0.4 });
      else {
        const to = home.parent.localToWorld(home.pos.clone());
        await hop(world, p, to, { height: 1.2, dur: 0.5 });
        home.parent.attach(p);
        p.position.copy(home.pos); p.rotation.copy(home.rot);
        if (p === jar) jar.userData.lid.visible = true;
        sfx.plop();
      }
      if (home.fresh) p.removeFromParent();
      bottle = null;
      if (live || rescuing) await next();
    }

    // amido: a colher vem cheia, um toque e ela vira, deixando uma ilha branca no molho
    let spoonObj = null;
    async function spoon() {
      ctx.gauge(null);
      spoonObj = s.add(build.spoon());
      const heap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), new THREE.MeshStandardMaterial({ color: "#fffdf6", roughness: 1 }));
      heap.scale.set(1, 1.3, 0.6); heap.position.z = 0.06; // na face da concha
      spoonObj.add(heap);
      spoonObj.userData.heap = heap;
      spoonObj.scale.setScalar(1.3);
      spoonObj.rotation.set(0, 0, 0.9);
      spoonObj.position.copy(props.cornstarch.getWorldPosition(v3(0, 1, 0)));
      await hop(world, spoonObj, mouthOf(bowl).add(v3(0.5, 1, 0)), { height: 1, dur: 0.5 });
      phase = "spoon";
      ctx.say("Agora uma colherada de amido: toque!");
    }
    async function dropStarch() {
      phase = "starch";
      sfx.swish();
      await world.tween(0.25, (k) => { spoonObj.rotation.z = 0.9 - k * 2.6; });
      spoonObj.userData.heap.visible = false;
      const island = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), new THREE.MeshStandardMaterial({ color: "#fffaf0", roughness: 1 }));
      island.rotation.x = -Math.PI / 2;
      island.position.set(0.1, bowl.userData.surface() + 0.006, 0);
      bowl.add(island);
      world.dish.island = island;
      world.fx.steam(surfaceOf(bowl).add(v3(0, 0.2, 0)), 3, { color: "#ffffff", size: 0.6, rise: 0.5 });
      sfx.plop("splat");
      squash(world, bowl, 0.06);
      ctx.progress(1);
      if (live) ctx.good(mouthOf(bowl).add(v3(0, 0.6, 0)), "Amido!");
      await hop(world, spoonObj, props.cornstarch.getWorldPosition(v3(0, 1.2, 0)), { height: 0.8, dur: 0.45 });
      spoonObj.visible = false;
      finish();
    }

    s.every((dt, t) => {
      if (phase !== "ready" || !bottle) return;
      const b = POURS[n], u = b.target.userData;
      const want = held ? TILT : 0.2;
      pivot.rotation.z += (want - pivot.rotation.z) * Math.min(1, dt * (held ? 3.2 : 8));
      const flow = Math.max(0, (pivot.rotation.z - POUR_AT) / (TILT - POUR_AT));
      jet.visible = flow > 0.02;
      // o fio enche o copo (bebida) ou cai na tigela (molho); passou da faixa, transborda
      sfx.loop(spec.into ? "fill" : "pot", jet.visible ? 0.4 + 0.6 * flow : 0);
      if (level > b.hi && jet.visible) sfx.loop("overflow", flow);
      if (!jet.visible) return;
      const before = u.level ?? 0, add = b.fill / ((b.lo + b.hi) / 2) * RATE * flow * dt;
      level += RATE * flow * dt;
      // a cor mistura o que já está com o que cai
      u.liquid.material.color.lerp(b.color, before < 0.01 ? 1 : Math.min(1, add / (before + add) * 1.5));
      fillTo(b.target, before + add);
      if (b.from === "blender") { jarLeft = Math.max(0, jarLeft - add * jarShare); jar.userData.level = jarLeft; jar.userData.fill(jarLeft); }
      const mouth = bottle.localToWorld(bottle.userData.mouth.clone());
      const below = v3(mouth.x - 0.12, surfaceOf(b.target).y, mouth.z);
      jet.userData.aim(mouth, below, 0.5 + flow * 0.8 + Math.sin(t * 30) * 0.05);
      if (Math.random() < flow * dt * 8) world.fx.bits(below, [b.color], 1, { size: 0.05, speed: 0.8, up: 1.2, floor: below.y });
      ctx.gauge({ kind: "band", level, lo: b.lo, hi: b.hi, label: b.name });
      if (level > b.hi + SLACK) { held = false; release(); } // transbordou: para sozinho
    });

    // segurar enquanto a garrafa ainda chega já vale: ela inclina assim que chegar
    const press = () => { if (!live) return; if (phase === "ready" || phase === "hop") held = true; else if (phase === "spoon") dropStarch(); };
    const lift = () => {
      if (!held) return;
      held = false;
      if (phase === "ready" && level > 0.03) release();
    };

    return {
      async intro() { await next(); },
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
            const b = POURS[n];
            phase = "rescue";
            pivot.rotation.z = 0;
            level = (b.lo + b.hi) / 2;
            b.target.userData.liquid.material.color.lerp(b.color, (b.target.userData.level ?? 0) < 0.01 ? 1 : 0.5);
            fillTo(b.target, (b.target.userData.level ?? 0) + b.fill);
            await release();
          } else if (phase === "spoon") await dropStarch();
          else await world.wait(0.05);
        }
      },
      finish() {
        jet.visible = false;
        ctx.gauge(null);
        world.dish.sauceColor = bowl.userData.liquid.material.color.clone();
        s.dispose();
      },
    };
  },
};
