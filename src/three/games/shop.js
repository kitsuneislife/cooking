// Feira: tocar só no que está na lista de compras. Cada acerto pula para a cesta.
import { THREE, RoundedBoxGeometry, build, fit, mesh, glossy, food, canvasTex, castAll } from "../kit.js";
import { shuffle } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, squash, v3 } from "./common.js";

function cornstarchBox() { // caixa de amido com rótulo
  const label = canvasTex(256, 256, (x) => {
    x.fillStyle = "#ffd23f"; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#2a8199"; x.fillRect(0, 70, 256, 90);
    x.fillStyle = "#fff"; x.font = '400 54px "Lilita One", sans-serif'; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText("AMIDO", 128, 118);
  });
  const g = new THREE.Group();
  const box = mesh(new RoundedBoxGeometry(1, 1.4, 0.6, 3, 0.06), new THREE.MeshStandardMaterial({ map: label, roughness: 0.5 }));
  box.position.y = 0.7;
  g.add(box);
  return g;
}

const MODELS = {
  beef: () => build.steak(), broccoli: build.broccoli, soy: build.soy, oyster: build.oyster, sesame: build.sesame,
  garlic: build.garlic, ginger: build.ginger, cornstarch: cornstarchBox, rice: () => build.rice({ sticks: false }),
  shrimp: build.shrimp, tofu: build.tofu, carrot: build.carrot, mushroom: build.mushroom, teriyaki: build.teriyaki,
};

export default {
  title: "Feira do bairro",
  how: "Toque só no que está na lista de compras.",
  keys: "Setas escolhem, Espaço põe na cesta.",
  gesture: "tap",
  shot: "market",
  seconds: 45,

  create(world, ctx, spec, game) {
    const s = scope(world), { group, slots, basket } = world.market;
    const pool = shuffle([
      ...game.ingredients.map((i) => ({ ...i, belongs: true })),
      ...game.intruders.map((i) => ({ ...i, belongs: false })),
    ]);
    const items = pool.map((it, n) => {
      const holder = new THREE.Group();
      const model = fit(MODELS[it.id](), it.id === "beef" || it.id === "tofu" || it.id === "carrot" ? 1.7 : 1.35);
      castAll(model);
      holder.add(model);
      holder.position.copy(slots[n]);
      holder.rotation.y = (Math.random() - 0.5) * 0.6;
      holder.userData = { item: it, phase: n * 0.7, hover: 0 };
      return s.add(holder, group);
    });
    // marcador de seleção pelo teclado: um aro dourado no chão do caixote
    const marker = s.add(mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 40), glossy({ color: "#ffd23f", emissive: "#ffb000", emissiveIntensity: 0.6 })), group);
    marker.rotation.x = Math.PI / 2; marker.visible = false;

    let live = false, errors = 0, hover = null, focus = -1, inBasket = 0;
    const got = new Set();
    const remaining = () => items.filter((h) => !got.has(h.userData.item.id));
    const sendList = () => ctx.list(game.ingredients.map((i) => ({ id: i.id, text: i.api, got: got.has(i.id) })));
    sendList();

    s.every((dt, t) => {
      for (const h of items) {
        if (got.has(h.userData.item.id) || h.userData.flying) continue;
        const on = h === hover || (focus >= 0 && remaining()[focus] === h) ? 1 : 0;
        h.userData.hover += (on - h.userData.hover) * Math.min(1, dt * 12);
        const k = h.userData.hover;
        h.children[0].position.y = Math.sin(t * 2 + h.userData.phase) * 0.05 + k * 0.35;
        h.scale.setScalar(1 + k * 0.14);
      }
      const f = remaining()[focus];
      marker.visible = live && !!f;
      if (f) { marker.position.set(f.position.x, f.position.y + 0.12, f.position.z); marker.rotation.z = t; }
    });

    const holderOf = (o) => { while (o && !o.userData?.item) o = o.parent; return o; };

    async function choose(h) {
      if (!h || got.has(h.userData.item.id) || h.userData.flying) return;
      const it = h.userData.item, at = h.getWorldPosition(v3(0, 0, 0)).add(v3(0, 1, 0));
      if (!it.belongs) {
        errors++;
        world.fx.steam(at, 3, { color: "#ff9a9a", size: 0.8, rise: 1 });
        ctx.bad(at, `${it.name} não está na lista!`);
        const r = h.rotation.z;
        await world.tween(0.45, (k) => { h.rotation.z = r + Math.sin(k * Math.PI * 6) * 0.25 * (1 - k); });
        return;
      }
      got.add(it.id);
      h.userData.flying = true;
      sfx.pick();
      sendList();
      ctx.progress(got.size / game.ingredients.length);
      const n = inBasket++;
      const spot = basket.position.clone().add(v3(((n % 3) - 1) * 0.5, 0.55 + Math.floor(n / 3) * 0.22, ((n * 7) % 3 - 1) * 0.35));
      const scale = h.scale.x;
      world.tween(0.6, (k) => h.scale.setScalar(scale + (0.42 - scale) * k));
      await hop(world, h, spot, { height: 3, dur: 0.6, turn: 3 });
      sfx.plop();
      squash(world, basket, 0.12);
      world.fx.sparkle(basket.getWorldPosition(v3(0, 0, 0)).add(v3(0, 1.4, 0)), 10);
      if (!live) return; // o chef completou: sem moedas
      const all = got.size === game.ingredients.length;
      ctx.good(at, all ? "Compras feitas!" : `${it.name} na cesta!`);
      if (all) { live = false; ctx.done(Math.max(0.2, 1 - errors * 0.15)); }
    }

    return {
      async intro() { await world.wait(0.2); },
      start() {
        live = true;
        world.input = {
          move: (e) => { hover = holderOf(world.pick(e, items)?.object); world.canvas.style.cursor = hover ? "pointer" : ""; },
          down: (e) => { if (live) choose(holderOf(world.pick(e, items)?.object)); },
        };
      },
      key(e, down) {
        if (!down || !live) return;
        const list = remaining();
        if (e.key === "ArrowRight" || e.key === "ArrowDown") focus = (focus + 1) % list.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") focus = (focus - 1 + list.length) % list.length;
        else if ((e.key === " " || e.key === "Enter") && list[focus]) { choose(list[focus]); focus = Math.min(focus, list.length - 2); }
        else return;
        e.preventDefault();
      },
      async rescue() {
        live = false;
        for (const h of remaining().filter((x) => x.userData.item.belongs)) { choose(h); await world.wait(0.15); }
        await world.wait(0.7);
      },
      finish() { world.canvas.style.cursor = ""; s.dispose(); },
    };
  },
};
