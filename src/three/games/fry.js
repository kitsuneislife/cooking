// Selar a carne: cada tira tem um medidor de cozimento em cima. O ponteiro anda do cru ao
// queimado; quando entra no verde aparece a placa "Vire!" (1º lado) ou "Tire!" (2º lado).
import { THREE, RoundedBoxGeometry, rawBeefMat, servingPlate, castAll, tex } from "../kit.js";
import { chickenGeo, chickenMat, chickenTex } from "../foods.js";
import { ease } from "../world.js";
import { aimScore, cookZone, COOK_READY, COOK_BURNT } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, squash, v3 } from "./common.js";

const BURN_OUT = 1.1; // esquecida até aqui, a tira sai queimada sozinha
const SWEET = 0.72; // o ponto perfeito, marcado com uma estrelinha no verde
const WHITE = new THREE.Color("#ffffff"), GREY = new THREE.Color("#e8c4c0"), PINK = new THREE.Color("#ffa0a0"), CHAR = new THREE.Color("#3a2a24");
const GLOW = new THREE.Color("#ffb347");
const GW = 0.46, GH = 0.125, INSET = 10 / 512; // medidor em unidades da cena; borda do trilho na textura

// a cara de um lado da carne conforme o cozimento: crua, depois a textura selada
// (rosada se virar cedo, dourada no ponto) e por fim carvão. Só se vê o lado de baixo ao virar.
function shade(mat, p, maps) {
  const half = COOK_READY / 2, map = maps[p < half ? 0 : 1];
  if (mat.map !== map) mat.map = mat.bumpMap = map;
  if (p < half) mat.color.copy(WHITE).lerp(GREY, p / half);
  else if (p < SWEET) mat.color.copy(PINK).lerp(WHITE, (p - half) / (SWEET - half));
  else mat.color.copy(WHITE).lerp(CHAR, Math.min(1, (p - SWEET) / (BURN_OUT - SWEET)));
  mat.clearcoat = 0.8 - Math.min(0.5, p * 0.4);
}

// O que vai ao fogo (`spec.on`): no wok, tiras de carne; na grelha, sobrecoxas de frango.
// Cada peça são duas metades empilhadas, para dourar um lado de cada vez.
const KINDS = {
  wok: {
    geo: () => new RoundedBoxGeometry(0.75, 0.086, 0.3, 2, 0.035), mat: rawBeefMat, maps: () => [tex("rawBeef"), tex("searedBeef")],
    xs: [-0.48, 0, 0.48], half: 0.043, plate: [1.85, 0.5, 0.34], great: "Dourada!", raw: "Ainda crua!",
  },
  grill: {
    geo: () => chickenGeo().clone().scale(0.68, 0.8, 0.68), mat: () => chickenMat("raw"), maps: () => [chickenTex("raw"), chickenTex("grilled")],
    xs: [-0.98, 0, 0.98], half: 0.045, plate: [2.9, 0.72, 0.3], great: "Dourado!", raw: "Ainda cru!",
  },
};

function strip(kind) {
  const g = new THREE.Group(), halves = [], geo = kind.geo();
  for (const y of [-kind.half, kind.half]) { // [0] começa por baixo, [1] por cima
    const m = kind.mat();
    m.emissive = GLOW.clone(); m.emissiveIntensity = 0;
    const h = new THREE.Mesh(geo, m);
    h.position.y = y;
    g.add(h); halves.push(m);
  }
  castAll(g);
  return { g, halves };
}

/* ---------- Medidor (texturas desenhadas uma vez por partida) ---------- */
function paint(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const at = (p) => p / BURN_OUT; // posição no trilho (0 a 1)

function trackTex() {
  return paint(512, 128, (x, w, h) => {
    x.fillStyle = "#4a2508"; x.beginPath(); x.roundRect(0, 0, w, h, h / 2); x.fill();
    const i = INSET * w, iw = w - 2 * i, ih = h - 2 * i;
    x.save(); x.beginPath(); x.roundRect(i, i, iw, ih, ih / 2); x.clip();
    const a = i + at(COOK_READY) * iw, b = i + at(COOK_BURNT) * iw;
    const raw = x.createLinearGradient(i, 0, a, 0); raw.addColorStop(0, "#ffd9cf"); raw.addColorStop(1, "#f0a487");
    x.fillStyle = raw; x.fillRect(i, i, a - i, ih);
    const ok = x.createLinearGradient(a, 0, b, 0); ok.addColorStop(0, "#3fae52"); ok.addColorStop(0.5, "#7fe08a"); ok.addColorStop(1, "#3fae52");
    x.fillStyle = ok; x.fillRect(a, i, b - a, ih);
    x.fillStyle = "#e5484d"; x.fillRect(b, i, w - b, ih);
    x.fillStyle = "#ffffff55"; x.fillRect(i, i, iw, ih * 0.38); // brilho de cima, ar de plástico
    x.fillStyle = "#4a2508"; x.fillRect(a - 3, i, 6, ih); x.fillRect(b - 3, i, 6, ih);
    x.restore();
    // estrelinha no ponto perfeito
    const sx = i + at(SWEET) * iw, sy = h / 2;
    x.fillStyle = "#fff"; x.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 22, ang = k / 10 * Math.PI * 2; x.lineTo(sx + Math.sin(ang) * r, sy - Math.cos(ang) * r); }
    x.fill();
  });
}
// ponteiro: setinha branca com contorno, apontando para o trilho
const needleTex = () => paint(64, 96, (x) => {
  x.lineJoin = "round"; x.lineWidth = 8; x.strokeStyle = "#4a2508"; x.fillStyle = "#fff";
  x.beginPath(); x.moveTo(8, 8); x.lineTo(56, 8); x.lineTo(32, 44); x.closePath(); x.stroke(); x.fill();
  x.beginPath(); x.roundRect(25, 36, 14, 54, 7); x.stroke(); x.fill();
});
// placa que pula em cima do medidor
const signTex = (text, color, dark) => paint(256, 112, (x, w) => {
  x.fillStyle = dark; x.beginPath(); x.moveTo(w / 2 - 16, 80); x.lineTo(w / 2, 106); x.lineTo(w / 2 + 16, 80); x.fill();
  x.fillStyle = color; x.strokeStyle = "#fff"; x.lineWidth = 7;
  x.beginPath(); x.roundRect(6, 6, w - 12, 78, 39); x.fill(); x.stroke();
  x.font = '400 54px "Lilita One", system-ui'; x.textAlign = "center"; x.textBaseline = "middle";
  const fit = Math.min(1, (w - 56) / x.measureText(text).width); // "Queimando!" encolhe para caber
  x.font = `400 ${Math.floor(54 * fit)}px "Lilita One", system-ui`;
  x.lineWidth = 10; x.strokeStyle = dark; x.strokeText(text, w / 2, 48);
  x.fillStyle = "#fff"; x.fillText(text, w / 2, 48);
});

function flat(map, w, h, order) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
  m.renderOrder = order;
  return m;
}

export default {
  title: "Selar a carne",
  how: "Olhe o medidor de cada tira. No verde, toque nela para virar. No verde de novo, toque para tirar.",
  keys: "Setas escolhem a tira, Espaço vira ou tira.",
  gesture: "timing",
  shot: "sear",
  seconds: 40,

  create(world, ctx, spec) {
    const s = scope(world);
    const grilling = spec.on === "grill", kind = KINDS[grilling ? "grill" : "wok"], maps = kind.maps(), XS = kind.xs;
    const { stations } = world.kitchen;
    // `wok` é onde a comida apoia; `stove` é quem dá o calor (na grelha, as duas coisas são ela)
    const wok = grilling ? stations.grill : stations.wok, stove = grilling ? stations.grill : stations.stove;
    const floor = wok.userData.floor;
    world.dish.rawChicken?.forEach((c) => c.removeFromParent()); // o frango temperado sai da tábua para a grelha
    world.dish.rawChicken = null;
    const art = {
      track: trackTex(), needle: needleTex(),
      flip: signTex("Vire!", "#4cbb5f", "#1d5e2a"), out: signTex("Tire!", "#4cbb5f", "#1d5e2a"), burn: signTex("Queimando!", "#e5484d", "#6e1418"),
    };

    // prato de apoio para a carne selada, ao lado do fogão
    const plate = s.add(servingPlate());
    plate.scale.setScalar(kind.plate[1]);
    plate.position.set(wok.position.x + kind.plate[0], 0.02, 0.8);
    castAll(plate);

    const strips = XS.map((x, i) => {
      const { g, halves } = strip(kind);
      // fila reta na tela: desfaz o giro do wok ao passar para as coordenadas dele
      const z = 0.12, a = -wok.rotation.y;
      g.rotation.order = "YXZ"; // gira no comprimento: inclina na curva do wok e vira no mesmo eixo
      g.position.set(x * Math.cos(a) + z * Math.sin(a), floor(Math.hypot(x, z)) + (grilling ? 0.1 : 0.07), -x * Math.sin(a) + z * Math.cos(a));
      if (grilling) g.rotation.set(0, (i - 1) * 0.25, 0); // deitado na grade
      else g.rotation.set(-Math.atan(0.54 * x), Math.PI / 2 + a + (i - 1) * 0.05, 0);
      g.visible = false;

      const gauge = s.add(new THREE.Group());
      const needle = flat(art.needle, GH * 0.62, GH * 0.93, 22);
      const sign = flat(art.flip, 0.42, 0.184, 23);
      gauge.add(flat(art.track, GW, GH, 21), needle, sign);
      sign.visible = false;
      gauge.visible = false;
      Object.assign(g.userData, {
        halves, p: [0, 0], side: 0, state: "wait", gauge, needle, sign, label: null, pop: 1,
        rate: 0.12 + Math.random() * 0.04, scores: [],
      });
      return g;
    });
    strips.forEach((g) => s.add(g, wok));

    const scores = [];
    let live = false, focus = 0, sizzleT = 0, outCount = 0, told = false;
    const inPan = () => strips.filter((g) => g.userData.state === "cook");
    const up = v3(0, 0, 0);

    s.every((dt, t) => {
      const cooking = inPan();
      sizzleT -= dt;
      if (cooking.length && sizzleT <= 0) { sfx.sizzle(0.06 + cooking.length * 0.03); sizzleT = 1.1; }
      const sel = cooking[focus % Math.max(1, cooking.length)];
      up.setFromMatrixColumn(world.camera.matrixWorld, 1);
      for (const g of strips) {
        const u = g.userData;
        u.gauge.visible = u.state === "cook" || u.state === "busy";
        if (!u.gauge.visible) continue;
        const bottom = u.side, top = 1 - u.side;
        if (u.state === "cook") { // o lado de baixo doura
          u.p[bottom] += u.rate * dt * stove.userData.heat;
          shade(u.halves[bottom], u.p[bottom], maps);
        }
        const p = u.state === "cook" ? u.p[bottom] : 0, zone = cookZone(p);
        const pos = g.getWorldPosition(v3(0, 0, 0));

        // medidor de frente para a câmera, logo acima da tira na tela
        u.gauge.quaternion.copy(world.camera.quaternion);
        u.gauge.position.copy(pos).addScaledVector(up, 0.5);
        u.gauge.scale.setScalar(g === sel && live ? 1.12 : 1);
        u.needle.position.set((-0.5 + INSET + Math.min(1, at(p)) * (1 - 2 * INSET)) * GW, GH * 0.62, 0.001);

        // placa: só aparece no verde (vire ou tire) e no vermelho (queimando)
        const label = u.state !== "cook" ? null : zone === "ready" ? (u.side ? "out" : "flip") : zone === "burnt" ? "burn" : null;
        if (label !== u.label) {
          u.label = label; u.pop = 0;
          if (label) u.sign.material.map = art[label];
          if (label === "flip" || label === "out") {
            sfx.pick();
            if (!told && live) { told = true; ctx.say("Ficou verde: toque na tira!", "happy"); }
          }
        }
        u.sign.visible = !!label;
        if (label) {
          u.pop = Math.min(1, u.pop + dt * 4);
          const k = ease.back(u.pop) * (label === "burn" ? 1 : 1 + Math.sin(t * 9) * 0.06);
          u.sign.scale.setScalar(k);
          u.sign.position.set(0, GH * 1.9 + Math.sin(t * 6) * 0.01, 0.002);
        }
        // no ponto, a tira brilha de leve e chama o toque
        u.halves[top].emissiveIntensity = zone === "ready" && u.state === "cook" ? 0.18 + Math.sin(t * 9) * 0.1 : 0;

        if (u.state !== "cook") continue;
        if (Math.random() < dt * (zone === "burnt" ? 9 : 4)) world.fx.sizzle(pos, 1, 0.25);
        if (zone === "burnt" && Math.random() < dt * 3) world.fx.steam(pos, 1, { color: "#5a4a40", size: 0.5, rise: 1.2 });
        if (p >= BURN_OUT) act(g, true);
      }
    });

    // toque numa tira: vira (1º lado) ou tira do wok (2º lado)
    async function act(g, auto = false) {
      const u = g.userData;
      if (u.state !== "cook") return;
      const p = u.p[u.side], zone = cookZone(p);
      const where = g.getWorldPosition(v3(0, 0.8, 0));
      const score = zone === "ready" ? 0.7 + 0.3 * aimScore(p, SWEET, 0.13) : zone === "raw" ? 0.35 * p / COOK_READY : 0.2;
      u.scores.push(score);
      if (live) {
        if (zone === "ready") { ctx.good(where, score > 0.9 ? kind.great : "Boa!"); world.fx.sparkle(where, 6); }
        else if (zone === "raw") ctx.bad(where, kind.raw);
        else ctx.bad(where, auto ? "Esqueceu e queimou!" : "Queimou!");
      }
      u.state = "busy";
      u.halves.forEach((m) => { m.emissiveIntensity = 0; });
      if (u.side === 0) { // vira no ar e mostra o lado dourado
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
      const spot = plate.position.clone().add(v3((n - 1) * kind.plate[2], 0.145 + (grilling ? n * 0.07 : 0), 0));
      g.rotation.set(Math.PI, (grilling ? 0 : Math.PI / 2) + (Math.random() - 0.5) * 0.3, 0);
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
        // as tiras caem uma de cada vez: cada uma fica no ponto numa hora diferente
        strips.forEach((g, i) => world.wait(i * 0.9).then(async () => {
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
          u.p[u.side] = Math.max(u.p[u.side], SWEET); // o chef espera dourar antes de virar
          shade(u.halves[u.side], u.p[u.side], maps);
          await act(g);
        }
      },
      finish() {
        world.canvas.style.cursor = "";
        stove.userData.heat = 1;
        strips.forEach((g) => { g.userData.gauge.visible = false; g.userData.halves.forEach((m) => { m.emissiveIntensity = 0; }); });
        Object.values(art).forEach((t) => t.dispose());
        s.keep(plate);
        strips.forEach((g) => s.keep(g));
        world.dish.seared = { plate, strips };
        s.dispose();
      },
    };
  },
};
