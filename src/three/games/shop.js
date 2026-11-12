// Feira: tocar só no que está na lista de compras. Cada acerto pula para a cesta.
import { THREE, fit, mesh, glossy } from "../kit.js";
import { stock } from "../foods.js";
import { shuffle } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, squash, v3 } from "./common.js";

const ONLY = { rice: 2 }; // itens que não empilham bem: quantos lado a lado

// Item já comprado: o monte fica cinza e meio transparente (materiais clonados, não afeta o resto).
function dim(obj) {
  const grey = new THREE.Color("#9a9a9a");
  obj.traverse((c) => {
    if (!c.isMesh) return;
    c.material = c.material.clone();
    c.material.color?.lerp(grey, 0.7);
    c.material.transparent = true; c.material.opacity = 0.45; c.material.depthWrite = false;
    c.castShadow = false;
  });
}

// Monte de feira dentro do caixote: frascos e caixas em fila, o resto amontoado com um por cima.
function pile(id, crate) {
  const g = new THREE.Group(), copy = (size) => fit(stock(id), size);
  const probe = copy(1), dim = new THREE.Box3().setFromObject(probe).getSize(v3(0, 0, 0));
  const tall = dim.y > Math.max(dim.x, dim.z) * 1.1;
  const place = (m, x, y, z, ry) => { m.position.set(x, y, z); m.rotation.y = ry; g.add(m); };
  if (tall || ONLY[id]) {
    const n = ONLY[id] ?? 3, size = tall ? Math.min(1.25, crate * 0.75) : crate / n * 0.95;
    const step = Math.min((crate - 0.25) / n, (tall ? size * Math.max(dim.x, dim.z) / dim.y : size) * 1.05);
    for (let i = 0; i < n; i++) place(copy(size), (i - (n - 1) / 2) * step, 0, i % 2 ? -0.15 : 0.1, (Math.random() - 0.5) * 0.5);
  } else {
    const size = Math.min(0.95, crate * 0.42);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) place(copy(size), x * crate * 0.2, 0, z * 0.25, Math.random() * Math.PI * 2);
    const top = copy(size); place(top, 0, size * dim.y * 0.6, 0, Math.random() * Math.PI * 2);
    top.rotation.z = (Math.random() - 0.5) * 0.4;
  }
  return g;
}

export default {
  title: "Feira do bairro",
  how: "Toque só no que está na lista de compras.",
  keys: "Setas escolhem, Espaço põe na cesta.",
  gesture: "tap",
  shot: "market",
  seconds: 45,

  create(world, ctx, spec, game) {
    const s = scope(world), { group, basket } = world.market;
    const pool = shuffle([
      ...game.ingredients.map((i) => ({ ...i, belongs: true })),
      ...game.intruders.map((i) => ({ ...i, belongs: false })),
    ]);
    const stall = world.market.stall(pool.length), hitMat = new THREE.MeshBasicMaterial({ visible: false });
    s.add(stall.group, group);
    const items = pool.map((it, n) => {
      const holder = new THREE.Group(), { pos, size } = stall.slots[n];
      holder.add(pile(it.id, size));
      holder.position.copy(pos);
      holder.rotation.x = stall.tilt; // deitado junto com o caixote
      holder.userData = { item: it, hover: 0 };
      // hitbox fixa do caixote: o monte sobe e cresce no hover, então mirar nele fazia piscar.
      // baixa o bastante para não tampar o caixote do degrau de trás
      const hit = s.add(new THREE.Mesh(new THREE.BoxGeometry(size, 1.2, 1.4), hitMat), group);
      hit.position.copy(pos).add(v3(0, 0.5, 0));
      hit.rotation.x = stall.tilt;
      hit.userData.holder = holder;
      holder.userData.hit = hit;
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
        const on = !got.has(h.userData.item.id) && (h === hover || (focus >= 0 && remaining()[focus] === h)) ? 1 : 0;
        h.userData.hover += (on - h.userData.hover) * Math.min(1, dt * 12);
        const k = h.userData.hover;
        h.children[0].position.y = k * 0.35;
        h.scale.setScalar(1 + k * 0.14);
      }
      const f = remaining()[focus];
      marker.visible = live && !!f;
      if (f) { marker.position.set(f.position.x, f.position.y + 0.12, f.position.z); marker.rotation.z = t; }
    });

    const holderAt = (e) => world.pick(e, remaining().map((h) => h.userData.hit))?.object.userData.holder ?? null;

    async function choose(h) {
      if (!h || got.has(h.userData.item.id)) return;
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
      sfx.pick();
      sendList();
      ctx.progress(got.size / game.ingredients.length);
      // só um vai para a cesta (o de cima do monte); o que sobra no caixote fica apagado
      const pile = h.children[0], one = pile.children[pile.children.length - 1];
      const from = one.getWorldPosition(v3(0, 0, 0));
      s.add(one, group).position.copy(group.worldToLocal(from));
      one.rotation.set(0, one.rotation.y, 0);
      dim(pile);
      const n = inBasket++;
      const spot = basket.position.clone().add(v3(((n % 3) - 1) * 0.5, 0.55 + Math.floor(n / 3) * 0.22, ((n * 7) % 3 - 1) * 0.35));
      world.tween(0.6, (k) => one.scale.setScalar(1 - 0.25 * k));
      await hop(world, one, spot, { height: 3, dur: 0.6, turn: 3 });
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
          move: (e) => { hover = holderAt(e); world.canvas.style.cursor = hover ? "pointer" : ""; },
          down: (e) => { if (live) choose(holderAt(e)); },
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
