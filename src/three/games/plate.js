// Empratar: virar a tigela de arroz bem no meio do prato (no tempo certo) e depois
// arrastar três colheradas do refogado até os alvos. No fim, a cúpula revela o prato.
import { THREE, RoundedBoxGeometry, build, beefStrip, searedMat, riceMound, castAll } from "../kit.js";
import { STATION_X } from "../sets.js";
import { dish } from "../models.js";
import { piece, chickenMat } from "../foods.js";
import { aimScore, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, ring, squash, v3 } from "./common.js";

const SWING = 1.6;
const TARGETS = [[-0.62, 0.5], [0.7, 0.38], [0.05, -0.72]];
const TOL = 1.2;

// uma colherada: tiras de carne e floretes brilhando no molho
function portion(seed) {
  const g = new THREE.Group(), mat = searedMat();
  mat.clearcoat = 1; mat.clearcoatRoughness = 0.08; mat.color.set("#d89870");
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 4; i++) {
    const b = beefStrip(mat); b.scale.setScalar(0.5);
    b.position.set((rand() - 0.5) * 0.4, 0.05 + i * 0.05, (rand() - 0.5) * 0.4);
    b.rotation.set(rand() * 0.5, rand() * 6, rand() * 0.5);
    g.add(b);
  }
  for (let i = 0; i < 3; i++) {
    const b = build.broccoli(); b.scale.setScalar(0.13);
    b.position.set((rand() - 0.5) * 0.5, 0.15 + rand() * 0.08, (rand() - 0.5) * 0.5);
    b.rotation.set(rand() * 0.6, rand() * 6, rand() * 0.6);
    g.add(b);
  }
  castAll(g);
  return g;
}

// colherada de salsa: cubinhos de manga, cebola e ervas com lascas do frango grelhado
function salsa(seed) {
  const g = new THREE.Group();
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (const id of ["mango", "onion", "cilantro", "jalapeno", "mango", "cilantro"]) {
    const p = piece(id); p.scale.setScalar(1.5);
    p.position.set((rand() - 0.5) * 0.55, 0.04, (rand() - 0.5) * 0.55); p.rotation.y = rand() * 6;
    g.add(p);
  }
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.15, 0.22, 2, 0.05), chickenMat("grilled"));
    c.position.set((rand() - 0.5) * 0.45, 0.2 + rand() * 0.06, (rand() - 0.5) * 0.45);
    c.rotation.set(rand() * 0.5, rand() * 6, rand() * 0.5);
    g.add(c);
  }
  castAll(g);
  return g;
}

export default {
  title: "Empratar",
  how: "Toque para virar o arroz no meio do prato. Depois arraste o refogado até cada alvo.",
  keys: "Espaço vira o arroz e solta cada colherada no alvo.",
  gesture: "plate",
  shot: "plate",
  seconds: 30,

  create(world, ctx, spec) {
    const s = scope(world), make = spec.portion === "salsa" ? salsa : portion;
    const plateSt = world.kitchen.stations.plate;
    const rice = world.kitchen.props.rice;
    const C = v3(STATION_X.plate, plateSt.position.y, plateSt.position.z);
    const topY = C.y + 0.09;

    const plated = s.add(new THREE.Group());
    plated.position.copy(C);
    const ricePos = { x: 0, z: 0 };

    const halo = s.add(ring(0.42));
    halo.rotation.x = -Math.PI / 2; halo.visible = false;

    const spatula = s.add(build.spatula());
    spatula.visible = false;
    spatula.scale.setScalar(0.9);
    spatula.rotation.x = 1.0;

    const scores = [];
    let phase = "idle", live = false, swingT = 0, target = 0, carried = null, home = null;
    ctx.guide({
      kind: () => (phase === "swing" || phase === "idle" ? "drop" : halo.visible ? "drop" : null),
      at: () => (phase === "swing" || phase === "idle" ? v3(C.x, topY, C.z) : halo.visible ? halo.position : null), r: 0.6,
    });

    s.every((dt, t) => {
      if (phase === "swing") {
        swingT += dt;
        rice.position.x = C.x + Math.sin(swingT * 2.2) * SWING;
      }
      if (phase === "scoop" && target < TARGETS.length) {
        const [x, z] = TARGETS[target];
        halo.visible = true;
        halo.position.set(C.x + x, topY + 0.25, C.z + z);
        halo.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
        halo.userData.set(1, carried ? "#5ad16a" : "#ffd23f");
      } else halo.visible = false;
    });

    async function dropRice() {
      phase = "drop";
      const x = rice.position.x - C.x;
      const score = aimScore(x, 0, SWING);
      scores.push(score);
      sfx.swish();
      await world.tween(0.25, (k) => { rice.rotation.z = Math.PI * k; rice.position.y = 2.2 - k * 0.9; });
      // o arroz desenformado: um domo redondo que cai e assenta
      const dome = (r) => 0.06 + 0.5 * Math.sqrt(Math.max(0, 1 - (r / 0.78) ** 2));
      const mound = riceMound(dome, 0.78, 300, 13);
      castAll(mound);
      mound.position.set(x, 1.2, 0);
      ricePos.x = x;
      plated.add(mound);
      rice.userData.rice.visible = false; // a tigela fica vazia
      await world.tween(0.22, (k) => { mound.position.y = 1.2 * (1 - k) + 0.07; }, (k) => k * k);
      sfx.plop("rice"); world.shake(0.05);
      squash(world, mound, 0.22, 0.3);
      world.fx.steam(plated.localToWorld(v3(x, 0.8, 0)), 3, { size: 0.7 });
      const at = plated.localToWorld(v3(x, 1.3, 0));
      if (live) score > 0.75 ? (world.fx.sparkle(at, 10), ctx.good(at, "Bem no meio!")) : score > 0.35 ? ctx.good(at, "Quase no meio") : ctx.bad(at, "Torto!");
      ctx.progress(1 / (TARGETS.length + 1));
      await hop(world, rice, home.pos.clone(), { height: 1.2, dur: 0.5, turn: 0 });
      rice.rotation.set(home.rot.x, home.rot.y, 0);
      phase = "scoop";
      if (live) ctx.say(`Agora arraste ${spec.what ?? "o refogado"} até o alvo!`);
    }

    async function place(at) { // solta a colherada carregada no ponto `at` (local do prato)
      const [tx, tz] = TARGETS[target];
      const score = aimScore(Math.hypot(at.x - tx, at.z - tz), 0, TOL);
      scores.push(score);
      const g = carried; carried = null;
      spatula.visible = false;
      world.scene.attach(g);
      const onRice = Math.hypot(at.x - ricePos.x, at.z) < 0.7;
      const land = plated.localToWorld(v3(at.x, onRice ? 0.45 : 0.08, at.z));
      sfx.swish();
      await hop(world, g, land, { height: 0.4, dur: 0.3 });
      plated.attach(g);
      sfx.plop("place");
      squash(world, g, 0.25, 0.3);
      const w = plated.localToWorld(v3(at.x, 0.9, at.z));
      if (live) score > 0.75 ? (world.fx.sparkle(w, 8), ctx.good(w, "No alvo!")) : score > 0.35 ? ctx.good(w, "Pertinho") : ctx.bad(w, "Longe do alvo");
      target++;
      ctx.progress((target + 1) / (TARGETS.length + 1));
      const food = world.dish.wokFood;
      if (food) food.children.forEach((c, i) => { if (i % TARGETS.length < target) c.visible = false; });
      if (target === TARGETS.length) {
        phase = "done";
        if (live) { live = false; ctx.done(average(scores)); }
      }
    }

    function pickUp(p) {
      if (phase !== "scoop" || carried || target >= TARGETS.length) return;
      carried = make(17 + target * 11);
      carried.scale.setScalar(0.9);
      spatula.add(carried);
      carried.position.set(0, 0.06, 0.3);
      spatula.visible = true;
      if (p) spatula.position.copy(p);
      sfx.pick();
    }

    const local = (p) => plated.worldToLocal(p.clone());

    return {
      async intro() {
        home = { pos: rice.position.clone(), rot: rice.rotation.clone() };
        await hop(world, rice, v3(C.x, 2.2, C.z), { height: 0.6, dur: 0.6 });
      },
      start() {
        live = true;
        phase = "swing";
        world.input = {
          down: (e) => {
            if (!live) return;
            if (phase === "swing") return dropRice();
            pickUp(world.planeHit(e, topY + 0.9));
          },
          move: (e) => {
            if (!carried) return;
            const p = world.planeHit(e, topY + 0.9);
            if (p) spatula.position.copy(p);
          },
          up: (e) => {
            if (!carried || !live) return;
            const p = world.planeHit(e, topY);
            place(p ? local(p) : v3(9, 0, 9));
          },
        };
      },
      key(e, down) {
        if (!down || !live || e.repeat || (e.key !== " " && e.key !== "Enter")) return;
        e.preventDefault();
        if (phase === "swing") return dropRice();
        if (phase !== "scoop" || carried) return;
        // pelo teclado, a colherada vai direto para o alvo (com um tremidinho)
        const [x, z] = TARGETS[target];
        pickUp(plated.localToWorld(v3(x, 0.9, z)));
        place(v3(x + (Math.random() - 0.5) * 0.3, 0, z + (Math.random() - 0.5) * 0.3));
      },
      async rescue() {
        live = false;
        while (phase !== "done") {
          if (phase === "swing") { rice.position.x = C.x; await dropRice(); }
          else if (phase === "scoop" && !carried) {
            const [x, z] = TARGETS[target];
            pickUp(plated.localToWorld(v3(x, 0.9, z)));
            await place(v3(x, 0, z));
          }
          else await world.wait(0.05);
        }
      },
      async outro() {
        // gergelim por cima, a cúpula desce, a câmera chega perto e... revela
        world.fx.sparkle(plated.localToWorld(v3(0, 1, 0)), 16, "#fff2c0", 1.4);
        const wrap = s.add(new THREE.Group());
        const cloche = build.cloche();
        castAll(cloche);
        wrap.add(cloche);
        wrap.position.copy(C).add(v3(0, 5, 0));
        cloche.userData.open(0);
        await world.tween(0.5, (k) => { wrap.position.y = C.y + 5 * (1 - k); }, (k) => k * k);
        sfx.plop("lid"); world.shake(0.08);
        squash(world, wrap, 0.08, 0.3);
        if (spec.dish) { // com a cúpula fechada, o prato pronto do Blender toma o lugar do montado
          for (const c of plated.children) c.visible = false;
          plateSt.visible = false;
          plated.add(dish(spec.dish));
        }
        await world.go("hero", 1.4, 0.4);
        await world.wait(0.3);
        sfx.reveal();
        world.fx.steam(plated.localToWorld(v3(0, 0.8, 0)), 6, { size: 1.2, rise: 1.3 });
        await world.tween(0.9, (k) => cloche.userData.open(k));
        world.fx.sparkle(plated.localToWorld(v3(0, 1.2, 0)), 20);
        s.keep(wrap);
        world.dish.cloche = wrap;
      },
      finish() {
        halo.visible = false;
        s.keep(plated);
        world.dish.plated = plated;
        if (world.dish.wokFood) world.dish.wokFood.visible = false;
        s.dispose();
      },
    };
  },
};
