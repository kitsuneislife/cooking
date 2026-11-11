// Selar a carne: cada tira doura por baixo. Toque quando o anel ficar verde para virar;
// toque de novo quando o outro lado dourar para tirar do wok.
import { THREE, RoundedBoxGeometry, rawBeefMat, servingPlate, castAll } from "../kit.js";
import { STATION_X } from "../sets.js";
import { aimScore, cookZone, COOK_READY } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, ring, squash, v3 } from "./common.js";

const SPOTS = [[-0.52, -0.3], [0.02, -0.34], [0.55, -0.24], [-0.5, 0.3], [0.04, 0.34], [0.56, 0.26]];
const BURN_OUT = 1.1; // esquecida até aqui, a tira sai queimada sozinha
const RAW = new THREE.Color("#ffffff"), GOLD = new THREE.Color("#b5794a"), BROWN = new THREE.Color("#7a4424"), CHAR = new THREE.Color("#2a160a");
const RING = { raw: "#ffffff", ready: "#5ad16a", burnt: "#ff5a4a" };

// a cor de um lado da carne conforme o cozimento
function shade(mat, p) {
  if (p < COOK_READY) mat.color.copy(RAW).lerp(GOLD, p / COOK_READY);
  else if (p < 0.85) mat.color.copy(GOLD).lerp(BROWN, (p - COOK_READY) / 0.25);
  else mat.color.copy(BROWN).lerp(CHAR, Math.min(1, (p - 0.85) / 0.25));
  mat.clearcoat = 0.8 - Math.min(0.5, p * 0.4);
}

function strip() {
  const g = new THREE.Group(), halves = [];
  for (const y of [-0.043, 0.043]) { // [0] começa por baixo, [1] por cima
    const m = rawBeefMat();
    const h = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.086, 0.3, 2, 0.035), m);
    h.position.y = y;
    g.add(h); halves.push(m);
  }
  castAll(g);
  return { g, halves };
}

export default {
  title: "Selar a carne",
  how: "Toque na tira quando o anel ficar verde: vira. Toque de novo: sai do wok.",
  keys: "Setas escolhem a tira, Espaço vira ou tira.",
  gesture: "timing",
  shot: "wok",
  seconds: 40,

  create(world, ctx) {
    const s = scope(world);
    const { wok, stove } = world.kitchen.stations;
    const floor = wok.userData.floor;

    // prato de apoio para a carne selada, ao lado do fogão
    const plate = s.add(servingPlate());
    plate.scale.setScalar(0.5);
    plate.position.set(STATION_X.stove + 2.5, 0.02, 1.9);
    castAll(plate);

    const strips = SPOTS.map(([x, z], i) => {
      const { g, halves } = strip();
      const r = Math.hypot(x, z);
      g.position.set(x, floor(r) + 0.09, z);
      g.rotation.y = (i % 2 ? 0.25 : -0.2) + Math.PI / 2 * (i % 3 === 1 ? 0.1 : 0);
      g.visible = false;
      const halo = s.add(ring(0.24));
      halo.visible = false;
      Object.assign(g.userData, { halves, p: [0, 0], side: 0, state: "wait", halo, rate: 0.11 + Math.random() * 0.06, scores: [] });
      return g;
    });
    strips.forEach((g) => s.add(g, wok));

    const scores = [];
    let live = false, focus = 0, sizzleT = 0, outCount = 0;
    const inPan = () => strips.filter((g) => g.userData.state === "cook");

    s.every((dt, t) => {
      const cooking = inPan();
      sizzleT -= dt;
      if (cooking.length && sizzleT <= 0) { sfx.sizzle(0.06 + cooking.length * 0.025); sizzleT = 1.1; }
      const sel = cooking[focus % Math.max(1, cooking.length)];
      for (const g of strips) {
        const u = g.userData;
        if (u.state !== "cook") { u.halo.visible = false; continue; }
        // o lado de baixo doura; o de cima esfria um tiquinho de nada
        const bottom = u.side === 0 ? 0 : 1;
        u.p[bottom] += u.rate * dt * stove.userData.heat;
        shade(u.halves[bottom], u.p[bottom]);
        const p = u.p[bottom], zone = cookZone(p);
        const pos = g.getWorldPosition(v3(0, 0, 0));
        u.halo.visible = true;
        u.halo.position.copy(pos).add(v3(0, 0.62, 0));
        u.halo.quaternion.copy(world.camera.quaternion);
        u.halo.scale.setScalar(g === sel && live ? 1.35 + Math.sin(t * 8) * 0.06 : 1);
        u.halo.userData.set(Math.min(1, p / 0.85), RING[zone]);
        if (Math.random() < dt * (zone === "burnt" ? 9 : 4)) world.fx.sizzle(pos, 1, 0.3);
        if (zone === "burnt" && Math.random() < dt * 3) world.fx.steam(pos, 1, { color: "#5a4a40", size: 0.6, rise: 1.2 });
        if (p >= BURN_OUT) act(g, true);
      }
    });

    // toque numa tira: vira (1º lado) ou tira do wok (2º lado)
    async function act(g, auto = false) {
      const u = g.userData;
      if (u.state !== "cook") return;
      const bottom = u.side === 0 ? 0 : 1, p = u.p[bottom], zone = cookZone(p);
      const at = g.getWorldPosition(v3(0, 0.8, 0));
      const score = zone === "ready" ? 0.7 + 0.3 * aimScore(p, 0.72, 0.13) : zone === "raw" ? 0.35 * p / COOK_READY : 0.2;
      u.scores.push(score);
      if (live) {
        if (zone === "ready") { ctx.good(at, score > 0.9 ? "Dourada!" : "Boa!"); world.fx.sparkle(at, 6); }
        else if (zone === "raw") ctx.bad(at, "Ainda crua!");
        else ctx.bad(at, auto ? "Esqueceu e queimou!" : "Queimou!");
      }
      u.state = "busy";
      if (u.side === 0) { // vira no ar
        u.side = 1;
        const y0 = g.position.y, rx = g.rotation.x;
        sfx.swish();
        await world.tween(0.42, (k) => { g.position.y = y0 + Math.sin(k * Math.PI) * 0.7; g.rotation.x = rx + Math.PI * k; });
        sfx.sizzle(0.25); world.fx.sizzle(g.getWorldPosition(v3(0, 0, 0)), 6, 0.4);
        squash(world, g, 0.18, 0.25);
        u.state = "cook";
        return;
      }
      // sai do wok para o prato
      const n = outCount++;
      world.scene.attach(g);
      const spot = plate.position.clone().add(v3(((n % 3) - 1) * 0.34 + (n >= 3 ? 0.17 : 0), 0.145 + (n >= 3 ? 0.15 : 0), (n >= 3 ? 0.05 : 0)));
      g.rotation.set(g.rotation.x, Math.PI / 2 + (Math.random() - 0.5) * 0.3, g.rotation.z);
      await hop(world, g, spot, { height: 1.4, dur: 0.55 });
      sfx.plop();
      u.state = "out";
      scores.push((u.scores[0] + u.scores[1]) / 2);
      ctx.progress(outCount / strips.length);
      if (outCount === strips.length && live) { live = false; ctx.done(scores.reduce((a, b) => a + b, 0) / scores.length); }
    }

    const holderOf = (o) => { while (o && !strips.includes(o)) o = o.parent; return o; };

    return {
      async intro() {
        world.tween(0.6, (k) => { stove.userData.heat = 1 + 0.4 * k; });
        world.fx.steam(wok.getWorldPosition(v3(0, 0.4, 0)), 3, { size: 0.8 });
        await world.wait(0.3);
      },
      start() {
        live = true;
        // as tiras caem uma de cada vez: cada uma tem seu tempo
        strips.forEach((g, i) => world.wait(i * 0.55).then(async () => {
          if (!s.alive) return;
          const y = g.position.y;
          g.visible = true; g.position.y = y + 2;
          await world.tween(0.3, (k) => { g.position.y = y + 2 * (1 - k); });
          sfx.sizzle(0.3); world.shake(0.04);
          world.fx.sizzle(g.getWorldPosition(v3(0, 0, 0)), 8, 0.4);
          g.userData.state = "cook";
        }));
        world.input = {
          down: (e) => { const g = holderOf(world.pick(e, strips)?.object); if (live && g) act(g); },
          move: (e) => { world.canvas.style.cursor = holderOf(world.pick(e, strips)?.object) ? "pointer" : ""; },
        };
      },
      key(e, down) {
        if (!down || !live || e.repeat) return;
        const list = inPan();
        if (!list.length) return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") focus = (focus + 1) % list.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") focus = (focus - 1 + list.length) % list.length;
        else if (e.key === " " || e.key === "Enter") act(list[focus % list.length]);
        else return;
        e.preventDefault();
      },
      async rescue() {
        live = false;
        while (outCount < strips.length) {
          const g = strips.find((x) => x.userData.state === "cook");
          if (!g) { await world.wait(0.05); continue; }
          const u = g.userData;
          u.p[u.side] = Math.max(u.p[u.side], 0.7); // o chef espera dourar antes de virar
          shade(u.halves[u.side], u.p[u.side]);
          await act(g);
        }
      },
      finish() {
        world.canvas.style.cursor = "";
        stove.userData.heat = 1;
        s.keep(plate);
        strips.forEach((g) => s.keep(g));
        world.dish.seared = { plate, strips };
        s.dispose();
      },
    };
  },
};
