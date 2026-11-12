// Saltear: jogar a comida para cima no ritmo. Cada batida na hora certa faz o wok pular
// e as chamas subirem; batida perdida esfria a panela.
import { THREE, RoundedBoxGeometry, build, food, castAll } from "../kit.js";
import { judgeBeat } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, squash, v3 } from "./common.js";

const BEATS = [1.2, 2.2, 3.0, 4.2, 5.0, 5.6, 6.8];
const LENGTH = 8;
const WINDOW = 0.28;
const LEAD = 1.2; // contagem antes da primeira batida, com a linha do tempo já andando
const AROMA = ["#fbf3dc", "#f6dc86", "#f1e2b8", "#e9c45c"];

export default {
  title: "Saltear no ritmo",
  how: "Toque quando cada bolinha chegar na linha: o wok pula e a comida voa.",
  keys: "Espaço no ritmo.",
  gesture: "rhythm",
  shot: "wok",
  seconds: 16,

  create(world, ctx) {
    const s = scope(world);
    const { wok, stove } = world.kitchen.stations;
    const floor = wok.userData.floor;
    const base = { y: wok.position.y, rz: wok.rotation.z, rx: wok.rotation.x };

    const foodGroup = s.add(new THREE.Group(), wok);
    const pieces = [];
    function piece(obj, h, r, a) {
      obj.position.set(Math.cos(a) * r, 2.5 + Math.random(), Math.sin(a) * r);
      obj.rotation.y = Math.random() * 6;
      foodGroup.add(obj);
      castAll(obj);
      pieces.push({ obj, h, vel: v3(0, 0, 0), spin: v3(0, 0, 0), air: true });
    }
    for (let i = 0; i < 7; i++) {
      const b = build.broccoli(); b.scale.setScalar(0.19);
      piece(b, 0.17, 0.2 + (i % 3) * 0.24, i / 7 * Math.PI * 2);
    }
    const chunkGeo = new RoundedBoxGeometry(0.09, 0.06, 0.09, 1, 0.02);
    for (let i = 0; i < 16; i++) {
      const c = new THREE.Mesh(chunkGeo, food({ color: AROMA[i % 4], roughness: 0.4, clearcoat: 0.6 }));
      piece(c, 0.04, Math.random() * 0.7, Math.random() * Math.PI * 2);
    }
    pieces.forEach((p) => { p.obj.visible = false; });

    const taken = new Set(), hits = BEATS.map(() => null);
    let now = -LEAD, live = false, running = false, wild = 0, tick = 0;

    // perto da batida o alvo pisca forte; entre batidas fica só o pulso do ritmo
    const near = () => BEATS.some((b, i) => hits[i] == null && Math.abs(b - now) < WINDOW);
    ctx.guide({ kind: () => (now > LENGTH ? null : near() ? "timing" : "rhythm"), at: wok.getWorldPosition(v3(0, 0.5, 0.6)), r: 0.9 });
    const gauge = () => ctx.gauge({ kind: "beats", beats: BEATS, now, length: LENGTH, window: WINDOW, hits });

    s.every((dt) => {
      // física simples: cada pedaço voa e cai de volta no fundo curvo do wok
      for (const p of pieces) {
        if (!p.air || !p.obj.visible) continue;
        p.vel.y -= 12 * dt;
        p.obj.position.addScaledVector(p.vel, dt);
        p.obj.rotation.x += p.spin.x * dt; p.obj.rotation.z += p.spin.z * dt;
        const r = Math.hypot(p.obj.position.x, p.obj.position.z);
        if (r > 0.85) { p.obj.position.x *= 0.85 / r; p.obj.position.z *= 0.85 / r; p.vel.x *= -0.3; p.vel.z *= -0.3; }
        const ground = floor(Math.min(r, 0.85)) + p.h;
        if (p.obj.position.y <= ground && p.vel.y < 0) {
          p.obj.position.y = ground; p.air = false; p.vel.set(0, 0, 0);
          p.obj.rotation.x *= 0.3; p.obj.rotation.z *= 0.3;
        }
      }
      if (!running) return;
      now += dt;
      // batida que passou sem toque
      BEATS.forEach((b, i) => {
        if (taken.has(i) || now <= b + WINDOW) return;
        taken.add(i); hits[i] = 0;
        if (live) ctx.bad(wok.getWorldPosition(v3(0, 1.4, 0)), "Perdeu o tempo!");
      });
      // metrônomo: um tique em cada batida
      while (tick < BEATS.length && now >= BEATS[tick]) { sfx.tick(); tick++; }
      gauge();
      if (now >= LENGTH) finishSong();
    });

    function toss(power = 1) {
      sfx.toss();
      const k = power;
      world.tween(0.36, (t) => {
        const b = Math.sin(t * Math.PI);
        wok.position.y = base.y + b * 0.22 * k;
        wok.rotation.z = base.rz + b * 0.16 * k;
      });
      for (const p of pieces) {
        if (!p.obj.visible) continue;
        p.air = true;
        p.vel.set((Math.random() - 0.5) * 1.4 - p.obj.position.x * 0.8, (3 + Math.random() * 1.6) * k, (Math.random() - 0.5) * 1.4 - p.obj.position.z * 0.8);
        p.spin.set((Math.random() - 0.5) * 14, 0, (Math.random() - 0.5) * 14);
      }
    }

    function beat() {
      if (!running) return;
      const at = wok.getWorldPosition(v3(0, 1.5, 0));
      const hit = judgeBeat(now, BEATS, taken, WINDOW);
      if (!hit) {
        wild++;
        toss(0.5);
        if (live) ctx.bad(at, "Fora do ritmo");
        return;
      }
      taken.add(hit.index); hits[hit.index] = hit.accuracy;
      toss(1);
      world.fx.flare(wok.getWorldPosition(v3(0, 0.75, 0)), hit.accuracy > 0.6 ? 22 : 10, 1.3);
      world.shake(0.08 + hit.accuracy * 0.08);
      if (hit.accuracy > 0.6) { sfx.flame(); world.tween(0.5, (t) => { stove.userData.heat = 1 + Math.sin(t * Math.PI); }); }
      if (live) ctx.good(at, hit.accuracy > 0.75 ? "No ritmo!" : "Quase!");
      ctx.progress(taken.size / BEATS.length);
      gauge();
    }

    function finishSong() {
      if (!running) return;
      running = false;
      ctx.progress(1);
      const avg = hits.reduce((a, b) => a + (b ?? 0), 0) / BEATS.length;
      if (live) { live = false; ctx.done(Math.max(0, avg - wild * 0.04)); }
    }

    return {
      async intro() {
        // o picadinho sai da tábua e os floretes caem no wok
        for (const p of world.dish.minced ?? []) p.removeFromParent();
        world.dish.minced = null;
        gauge();
        for (const [i, p] of pieces.entries()) {
          if (i % 4 === 0) { sfx.sizzle(0.2); world.fx.sizzle(wok.getWorldPosition(v3(0, 0.3, 0)), 5, 0.6); }
          p.obj.visible = true;
          await world.wait(0.04);
        }
        await world.wait(0.6);
        squash(world, wok, 0.05);
      },
      start() {
        live = true; running = true;
        world.input = { down: beat };
      },
      key(e, down) {
        if (!down || e.repeat || (e.key !== " " && e.key !== "Enter")) return;
        e.preventDefault();
        beat();
      },
      async rescue() {
        live = false;
        while (running) { await world.wait(0.05); }
      },
      async outro() {
        await world.wait(0.5);
      },
      finish() {
        ctx.gauge(null);
        wok.position.y = base.y; wok.rotation.z = base.rz;
        stove.userData.heat = 1;
        for (const p of pieces) { // quem ainda estava no ar pousa no fundo
          const r = Math.min(0.85, Math.hypot(p.obj.position.x, p.obj.position.z));
          p.obj.position.y = floor(r) + p.h;
        }
        s.keep(foodGroup);
        world.dish.wokFood = foodGroup;
        s.dispose();
      },
    };
  },
};
