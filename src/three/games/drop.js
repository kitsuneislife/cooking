// Soltar na hora certa: o ingrediente balança acima do recipiente; um toque e ele cai.
// Serve para a tigela, o liquidificador e o copo. O mesmo ingrediente pode vir mais de uma vez.
import { THREE } from "../kit.js";
import { piece, PANTRY } from "../foods.js";
import { aimScore, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, squash, vessels, inside, mouthOf, rimOf, v3 } from "./common.js";

export default {
  title: "Juntar os ingredientes",
  how: "Toque quando o ingrediente passar bem em cima do recipiente.",
  keys: "Espaço solta o ingrediente.",
  gesture: "timing",
  shot: "bowl",
  seconds: 25,

  create(world, ctx, spec, game) {
    const s = scope(world), v = vessels(world, spec.into)[0], u = v.userData;
    const nameOf = (id) => game.ingredients.find((i) => i.id === id).name;
    const mouth = mouthOf(v), rim = rimOf(v), reach = rim * 2.2 + 0.6, hangY = mouth.y + 1.2;
    const floorY = v.localToWorld(v3(0, u.floor ?? 0.1, 0)).y;
    const each = spec.fill ?? 0.14; // quanto cada ingrediente líquido enche

    const scores = [];
    let n = -1, obj = null, phase = "idle", live = false, t = 0;
    ctx.guide({ kind: "drop", at: () => (phase === "swing" ? mouth : null), r: rim });

    async function bring() {
      n++;
      if (n >= spec.items.length) { phase = "done"; if (live) { live = false; ctx.done(average(scores)); } return; }
      obj = s.add(piece(spec.items[n]));
      world.dish.minced?.find((p) => p.userData.id === spec.items[n])?.removeFromParent(); // sai da tábua o que foi picado
      t = -Math.PI / 2; // começa numa ponta do balanço
      obj.position.set(mouth.x - reach, hangY + 2.5, mouth.z);
      await world.tween(0.3, (k) => { obj.position.y = hangY + 2.5 * (1 - k); });
      if (live) ctx.say(`${nameOf(spec.items[n])}: solte no meio!`);
      phase = "swing";
    }

    s.every((dt) => {
      if (phase !== "swing") return;
      t += dt * (2.3 + n * 0.25);
      obj.position.x = mouth.x + Math.sin(t) * reach;
      obj.position.y = hangY + Math.abs(Math.cos(t)) * 0.25;
      obj.rotation.y += dt * 1.5;
    });

    // o pedaço entrou: os sólidos empilham lá dentro, o resto vira líquido
    function settle(o, id) {
      const p = PANTRY[id];
      sfx.plop();
      squash(world, v, 0.05, 0.25);
      if (p.solid) {
        const box = inside(v);
        box.attach(o);
        o.userData.melts = p.melts;
        s.keep(o);
        return;
      }
      const before = u.level ?? 0;
      u.level = before + each;
      u.fill(u.level);
      u.liquid.material.color.lerp(new THREE.Color(p.tint), before < 0.01 ? 1 : each / u.level);
      o.removeFromParent();
    }

    async function release() {
      if (phase !== "swing") return;
      phase = "fall";
      const o = obj, id = spec.items[n], off = o.position.x - mouth.x, hit = Math.abs(off) < rim * 0.95;
      const stack = inside(v).children.length;
      const surface = v.localToWorld(v3(0, u.surface(), 0)).y;
      const rest = Math.max(floorY + 0.14 + stack * 0.2, (u.level ?? 0) > 0.01 ? surface : -9);
      const from = o.position.y, to = hit ? rest : mouth.y - u.top * v.scale.y + 0.2;
      sfx.swish();
      await world.tween(0.32, (k) => { o.position.y = from + (to - from) * k; }, (k) => k * k);
      const at = v3(o.position.x, mouth.y + 0.4, mouth.z);
      if (hit) {
        const score = 0.55 + 0.45 * aimScore(off, 0, rim);
        scores.push(score);
        if (!PANTRY[id].solid) world.fx.bits(v3(o.position.x, rest + 0.1, mouth.z), [PANTRY[id].tint], 5, { size: 0.06, speed: 1.2, up: 2, floor: rest });
        if (score > 0.85) { world.fx.sparkle(at, 8); ctx.good(at, "Bem no meio!"); } else ctx.good(at, "Entrou!");
      } else { // caiu fora: quica na bancada e o chef põe para dentro
        scores.push(0);
        sfx.plop();
        ctx.bad(at, "Caiu fora!");
        await world.wait(0.25);
        const stackAt = v3(mouth.x, rest, mouth.z);
        await hop(world, o, stackAt, { height: mouth.y - to + 0.8, dur: 0.45 });
      }
      if (hit && PANTRY[id].solid) o.position.x += (mouth.x - o.position.x) * 0.7; // escorrega para dentro
      settle(o, id);
      ctx.progress((n + 1) / spec.items.length);
      if (s.alive) await bring();
    }

    return {
      async intro() {
        if (u.open) await world.tween(0.5, (k) => u.open(k));
        await bring();
      },
      start() {
        live = true;
        world.input = { down: () => { if (live) release(); } };
      },
      key(e, down) {
        if (down && live && !e.repeat && (e.key === " " || e.key === "Enter")) { e.preventDefault(); release(); }
      },
      async rescue() {
        live = false;
        while (phase !== "done") {
          if (phase === "swing") { t = 0; obj.position.x = mouth.x; await release(); }
          else await world.wait(0.05);
        }
      },
      async outro() {
        if (u.open) await world.tween(0.5, (k) => u.open(1 - k));
      },
      finish() { u.open?.(0); s.dispose(); },
    };
  },
};
