// Picar (alho, gengibre, manga, cebola…): tocar rápido, várias vezes. A cada batida o pedaço
// encolhe e o montinho picado cresce ao lado da faca. Os itens vêm de `spec.items`.
import { THREE, RoundedBoxGeometry, build, fit, castAll, food } from "../kit.js";
import { STATION_X } from "../sets.js";
import { PANTRY } from "../foods.js";
import { sfx } from "../../game/sound.js";
import { scope, squash, speedScore, v3 } from "./common.js";

const GRAINS = 90;

// Montinho de picadinho: grãos instanciados que vão aparecendo, mais altos no meio.
function pile(colors, seed) {
  const mesh = new THREE.InstancedMesh(new RoundedBoxGeometry(0.075, 0.05, 0.075, 1, 0.015), food({ roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 }), GRAINS); // úmido e brilhante, como picado na hora
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < GRAINS; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 0.42;
    const y = 0.025 + (1 - r / 0.42) * 0.16 * (i / GRAINS);
    q.setFromEuler(new THREE.Euler(rand() * 0.6, rand() * 6, rand() * 0.6));
    mesh.setMatrixAt(i, m.compose(v3(Math.cos(a) * r, y, Math.sin(a) * r * 0.8), q, v3(1, 1, 1).multiplyScalar(0.7 + rand() * 0.6)));
    mesh.setColorAt(i, c.set(colors[i % colors.length]));
  }
  mesh.count = 0;
  mesh.castShadow = true;
  return mesh;
}

export default {
  title: "Picar alho e gengibre",
  how: "Toque bem rápido para picar bem fininho.",
  keys: "Aperte Espaço sem parar.",
  gesture: "rapid",
  shot: "board",
  seconds: 20,

  create(world, ctx, spec, game) {
    const s = scope(world), CHOPS = spec.chops ?? 14, N = spec.items.length;
    // dois montinhos ficam nos cantos da frente; mais que isso, enfileirados no fundo da tábua
    const ITEMS = spec.items.map((id, i) => {
      const c = PANTRY[id].chop;
      return {
        id, name: game.ingredients.find((x) => x.id === id).name, model: c.model ?? PANTRY[id].model, size: c.size, colors: c.colors,
        rest: N <= 2 ? [i ? 1.35 : -1.55, 1.05] : [(i - (N - 1) / 2) * 0.95, -0.55],
      };
    });
    const board = world.kitchen.stations.board;
    const top = board.userData.top * board.scale.y;
    const spot = v3(STATION_X.board + 0.2, top, 0.95);

    const knife = s.add(build.cleaver());
    knife.rotation.y = -Math.PI / 2;
    knife.position.set(spot.x + 3, top + 2.4, spot.z + 0.2);
    const hoverY = top + 0.8;

    const piles = [];
    let item = 0, chops = 0, live = false, busy = false, used = 0, idle = 0, model = null;
    ctx.guide({ kind: "rapid", at: () => (model ? spot.clone().add(v3(0.35, 0.3, 0)) : null), r: 0.55 });

    function bring(n) {
      const it = ITEMS[n];
      model = fit(it.model(), it.size);
      castAll(model);
      s.add(model).position.copy(spot).add(v3(0, 2.5, 0));
      const p = s.add(pile(it.colors, 7 + n * 31));
      p.position.copy(spot).add(v3(0.75, 0, 0.05));
      p.userData.id = it.id;
      piles.push(p);
      return world.tween(0.45, (k) => { model.position.y = spot.y + 2.5 * (1 - k); }).then(() => { sfx.plop(); squash(world, model, 0.2); });
    }

    s.every((dt) => {
      if (live) { used += dt; idle += dt; }
      if (live && idle > 1.6) { idle = -2; ctx.say("Mais rápido! Toque, toque, toque!"); }
      if (!busy && model) knife.position.y += (hoverY - knife.position.y) * Math.min(1, dt * 10);
    });

    async function chop() {
      if (busy || !model || item >= ITEMS.length) return;
      busy = true; idle = 0;
      const it = ITEMS[item];
      const x = spot.x + 0.35 + (Math.random() - 0.5) * 0.5;
      knife.position.x = x;
      await world.tween(0.05, (k) => { knife.position.y = hoverY + (top + 0.02 - hoverY) * k; });
      chops++;
      sfx.chop(it.id, chops % 7 === 0);
      world.shake(0.03);
      world.fx.bits(v3(x, top + 0.1, spot.z), it.colors, 4, { floor: top + 0.02, speed: 1.6, up: 2 });
      // o pedaço encolhe e o montinho cresce
      const left = 1 - chops / CHOPS;
      model.scale.setScalar(Math.max(0.05, 0.25 + left * 0.75));
      squash(world, model, 0.15, 0.15);
      piles[item].count = Math.round(GRAINS * chops / CHOPS);
      ctx.progress((item * CHOPS + chops) / (CHOPS * ITEMS.length));
      busy = false;
      if (chops < CHOPS) return;
      // terminou um: o montinho desliza para o canto e chega o próximo
      const done = model; model = null;
      done.removeFromParent();
      world.fx.sparkle(spot.clone().add(v3(0.6, 0.4, 0)), 8);
      if (live) ctx.good(spot.clone().add(v3(0.6, 0.6, 0)), `${it.name} picado!`);
      const p = piles[item], from = p.position.clone(), to = v3(STATION_X.board + it.rest[0], top, it.rest[1]);
      world.tween(0.4, (k) => p.position.lerpVectors(from, to, k));
      item++; chops = 0;
      if (item < ITEMS.length) await bring(item);
      else if (live) { live = false; ctx.done(speedScore(used, CHOPS * N * 0.57)); }
    }

    return {
      async intro() {
        await bring(0);
        await world.tween(0.4, (k) => { knife.position.x = spot.x + 3 - 2.65 * k; });
      },
      start() {
        live = true;
        world.input = { down: () => { if (live) chop(); } };
      },
      key(e, down) {
        if (down && live && !e.repeat && (e.key === " " || e.key === "Enter")) { e.preventDefault(); chop(); }
      },
      async rescue() {
        live = false;
        while (item < ITEMS.length) await (busy || !model ? world.wait(0.03) : chop());
      },
      finish() {
        piles.forEach((p) => s.keep(p));
        world.dish.minced = piles;
        s.dispose();
      },
    };
  },
};
