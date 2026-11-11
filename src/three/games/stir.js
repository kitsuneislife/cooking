// Voltar a carne, juntar o molho e mexer em círculos até tudo ficar brilhante.
import { THREE, build } from "../kit.js";
import { angleDelta } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, stream, speedScore, v3 } from "./common.js";

const TURNS = 3;
const GOAL = TURNS * Math.PI * 2;
const GLAZE = new THREE.Color("#c87a4a");

export default {
  title: "Juntar o molho e mexer",
  how: "Faça círculos dentro do wok até o molho envolver tudo.",
  keys: "Segure ← ou → para mexer.",
  gesture: "circle",
  shot: "wok",
  seconds: 20,

  create(world, ctx) {
    const s = scope(world);
    const { wok, bowl } = world.kitchen.stations;
    const floor = wok.userData.floor;
    const center = wok.position.clone();
    const food = world.dish.wokFood ?? s.add(new THREE.Group(), wok);
    const sauce = wok.userData.sauce;
    const sauceColor = world.dish.sauceColor ?? new THREE.Color("#6a3410");

    const spatula = s.add(build.spatula());
    spatula.scale.setScalar(1.1);
    spatula.position.set(center.x + 2.4, 3.2, center.z + 0.6);
    spatula.rotation.x = 0.55;

    // os materiais da comida passam a ser só desta panela: o brilho do molho não vaza
    const mats = [];
    let total = 0, live = false, used = 0, lastA = null, held = 0, idle = 0, steamT = 0;

    function own(obj) {
      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        mats.push({ m: o.material, c: o.material.color.clone(), cc: o.material.clearcoat ?? 0 });
      });
    }

    function glaze(k) {
      for (const { m, c, cc } of mats) {
        m.color.copy(c).lerp(c.clone().multiply(GLAZE), k * 0.6);
        if ("clearcoat" in m) { m.clearcoat = cc + (1 - cc) * k; m.clearcoatRoughness = 0.3 - 0.25 * k; }
      }
      sauce.scale.set(1 - k * 0.2, 1, 1 - k * 0.2); // o molho reduz e encorpa
      sauce.material.color.copy(sauceColor).lerp(new THREE.Color("#5a2a0c"), k * 0.5);
    }

    s.every((dt, t) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 2.2) { idle = -2; ctx.say("Mexe, mexe! Em roda!"); }
      if (held && live) { // pelo teclado, a espátula roda sozinha pela borda
        turn(dt * 5.5);
        const a = total * 1.3 * held;
        spatula.position.set(center.x + Math.cos(a) * 0.6, center.y + floor(0.6) + 0.05, center.z + Math.sin(a) * 0.6);
        spatula.rotation.y = -a + Math.PI / 2;
      }
      steamT -= dt;
      if (steamT <= 0 && sauce.visible) { world.fx.steam(center.clone().add(v3(0, 0.6, 0)), 1, { size: 1, rise: 1.4 }); steamT = 0.35; }
      food.position.y = Math.sin(t * 9) * 0.01 * Math.min(1, total);
    });

    function turn(d) {
      if (total >= GOAL) return;
      idle = 0;
      total += d;
      food.rotation.y += d * 0.45;
      const k = Math.min(1, total / GOAL);
      glaze(k);
      ctx.progress(k);
      if (Math.floor((total - d) / Math.PI) !== Math.floor(total / Math.PI)) {
        sfx.sizzle(0.12);
        world.fx.sizzle(center.clone().add(v3(0, 0.3, 0)), 4, 0.7);
      }
      if (total >= GOAL) {
        world.fx.sparkle(center.clone().add(v3(0, 0.9, 0)), 14);
        if (live) { live = false; ctx.good(center.clone().add(v3(0, 1.4, 0)), "Envolveu tudo!"); ctx.done(speedScore(used, 12)); }
      }
    }

    return {
      async intro() {
        // a carne selada volta do prato para o wok
        const seared = world.dish.seared;
        if (seared) {
          for (const [i, g] of seared.strips.entries()) {
            const a = i / seared.strips.length * Math.PI * 2, r = 0.35 + (i % 2) * 0.3;
            const local = v3(Math.cos(a) * r, floor(r) + 0.1, Math.sin(a) * r);
            world.scene.attach(g);
            hop(world, g, wok.localToWorld(local.clone()), { height: 1.5, dur: 0.5 }).then(() => {
              food.attach(g);
              sfx.sizzle(0.15);
              world.fx.sizzle(g.getWorldPosition(v3(0, 0, 0)), 4, 0.3);
            });
            await world.wait(0.12);
          }
          await world.wait(0.5);
          const plate = seared.plate, y = plate.position.y;
          await world.tween(0.3, (k) => { plate.position.y = y - k * 0.4; plate.scale.setScalar(0.5 * (1 - k * 0.9)); });
          plate.removeFromParent();
          world.dish.seared = null;
        }
        own(food);
        // a tigela de molho chega, inclina e despeja
        const cup = s.add(build.sauce());
        cup.children[1].material = cup.children[1].material.clone();
        cup.children[1].material.color.copy(sauceColor);
        cup.scale.setScalar(0.7);
        cup.position.set(center.x - 3, 2.6, center.z + 0.4);
        await hop(world, cup, center.clone().add(v3(1.25, 1.6, 0.1)), { height: 0.6, dur: 0.5 });
        const jet = s.add(stream(sauceColor));
        jet.material.color.copy(sauceColor);
        sauce.visible = true;
        sauce.material.color.copy(sauceColor);
        sauce.scale.set(0.01, 1, 0.01);
        await world.tween(0.35, (k) => { cup.rotation.z = k * 1.9; });
        sfx.pour();
        await world.tween(0.9, (k) => {
          const lip = cup.localToWorld(v3(-0.9, 0.62, 0));
          jet.visible = k < 0.92;
          jet.userData.aim(lip, center.clone().add(v3(0.3, 0.25, 0)), 0.9 * (1 - k * 0.6));
          sauce.scale.set(k, 1, k);
          cup.children[1].visible = k < 0.7;
        });
        jet.visible = false;
        sfx.sizzle(0.35);
        world.fx.steam(center.clone().add(v3(0, 0.6, 0)), 5, { size: 1.2 });
        bowl.userData.fill(0); // a tigela de molho da bancada ficou vazia
        await hop(world, cup, v3(center.x - 3, 3, center.z + 0.4), { height: 0.4, dur: 0.4 });
        cup.visible = false;
        await hop(world, spatula, center.clone().add(v3(0.5, 0.2, 0.2)), { height: 0.5, dur: 0.45 });
      },
      start() {
        live = true;
        const plane = center.y + 0.35;
        world.input = {
          move: (e) => {
            const p = world.planeHit(e, plane);
            if (!p) return;
            const dx = p.x - center.x, dz = p.z - center.z, r = Math.hypot(dx, dz);
            const rr = Math.min(r, 0.95);
            spatula.position.set(center.x + dx / (r || 1) * rr, center.y + floor(rr) + 0.05, center.z + dz / (r || 1) * rr);
            spatula.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
            if (!live || r < 0.15 || r > 2.2) { lastA = null; return; }
            const a = Math.atan2(dz, dx);
            if (lastA != null) turn(Math.min(0.8, Math.abs(angleDelta(lastA, a))));
            lastA = a;
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
        while (total < GOAL) { turn(0.4); await world.wait(0.03); }
      },
      async outro() {
        await hop(world, spatula, center.clone().add(v3(2.4, 2.4, 0.8)), { height: 0.4, dur: 0.4 });
      },
      finish() {
        s.keep(food);
        world.dish.wokFood = food;
        s.dispose();
      },
    };
  },
};
