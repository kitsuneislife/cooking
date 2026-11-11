// Fatiar a carne: riscar de cima para baixo em cima de cada linha tracejada.
// A peça se divide de verdade: cada fatia é a mesma carne recortada por dois planos.
import { THREE, build } from "../kit.js";
import { STATION_X } from "../sets.js";
import { nextCut, aimScore } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, dashes, v3 } from "./common.js";

const CUTS = 5;
const SCALE = 1.15;
// largura da carne no desenho do kit (x de -1.34 a 1.39), com folga nas pontas arredondadas
const LO = -1.34, HI = 1.39;
const BOX = { lo: 0.1, hi: 0.9 };
const BITS = ["#bf2f3c", "#e8606a", "#f9eedb"];

export default {
  title: "Fatiar a carne",
  how: "Risque de cima para baixo sobre cada linha tracejada.",
  keys: "Espaço corta na linha.",
  gesture: "swipe",
  shot: "board",
  seconds: 22,

  create(world, ctx) {
    const s = scope(world);
    const board = world.kitchen.stations.board;
    const top = board.userData.top * board.scale.y;
    const center = v3(STATION_X.board, top + 0.14 * SCALE, 0.35);

    const slab = s.add(new THREE.Group());
    slab.position.copy(center);
    slab.scale.setScalar(SCALE);
    const steak = build.steak();

    // uma fatia = cópia da carne com materiais próprios presos a dois planos de corte
    const pieces = [];
    function makePiece(lo, hi) {
      const p = steak.clone(true);
      const local = [new THREE.Plane(v3(1, 0, 0), -lo), new THREE.Plane(v3(-1, 0, 0), hi)];
      const planes = local.map((q) => q.clone());
      p.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        o.material.clippingPlanes = planes;
        o.material.clipShadows = true;
        o.castShadow = true;
      });
      p.userData = { lo, hi, local, planes, x: 0 };
      slab.add(p);
      pieces.push(p);
      return p;
    }
    makePiece(-10, 10);
    const sync = () => {
      slab.updateMatrixWorld(true);
      for (const p of pieces) p.userData.local.forEach((q, i) => p.userData.planes[i].copy(q).applyMatrix4(p.matrixWorld));
    };

    const knife = s.add(build.cleaver());
    knife.rotation.y = -Math.PI / 2;
    knife.scale.setScalar(1.05);
    const hoverY = center.y + 0.95;
    knife.position.set(center.x + 2.8, hoverY + 1.5, center.z + 0.4);

    const guide = s.add(dashes(2.6));
    const cuts = []; // posições já cortadas, em fração da carne
    const scores = [];
    let live = false, plan = nextCut(BOX, [], CUTS, null), stroke = null, busy = false, aimX = null;
    const toFrac = (x) => ((x - center.x) / SCALE - LO) / (HI - LO);
    const toX = (f) => center.x + (LO + f * (HI - LO)) * SCALE;

    s.every((dt, t) => {
      // fatias se afastam um pouquinho, com o tampo como mola
      const n = pieces.length;
      pieces.sort((a, b) => a.userData.lo - b.userData.lo).forEach((p, j) => {
        const want = (j - (n - 1) / 2) * 0.11;
        p.userData.x += (want - p.userData.x) * Math.min(1, dt * 10);
        p.position.x = p.userData.x;
      });
      sync();
      guide.visible = live && cuts.length < CUTS;
      guide.position.set(toX(plan.guide), center.y + 0.47, center.z);
      guide.userData.mat.opacity = 0.55 + 0.4 * Math.sin(t * 6);
      if (!busy && live) { // a faca acompanha a mira, pairando
        const tx = aimX ?? toX(plan.guide);
        knife.position.x += (tx - knife.position.x) * Math.min(1, dt * 14);
        knife.position.y += (hoverY - knife.position.y) * Math.min(1, dt * 8);
      }
    });

    function trail(p) {
      const sp = world.fx.sprite("soft", "#fff6c8", true);
      sp.position.copy(p); sp.scale.setScalar(0.28);
      world.fx.add(sp, { life: 0.35, vel: v3(0, 0, 0), fade: 1 });
    }

    async function cut(aim) {
      if (busy || cuts.length >= CUTS) return;
      busy = true;
      const c = nextCut(BOX, cuts, CUTS, aim);
      const x = toX(c.at);
      knife.position.x = x;
      sfx.swish();
      await world.tween(0.09, (k) => { knife.position.y = hoverY + (center.y + 0.02 - hoverY) * k; });
      // divide a fatia que contém o corte
      const local = LO + c.at * (HI - LO);
      const p = pieces.find((q) => q.userData.lo < local && local < q.userData.hi);
      const hi = p.userData.hi;
      p.userData.hi = local; p.userData.local[1].constant = local;
      makePiece(local, hi).userData.x = p.userData.x;
      cuts.push(c.at);
      const score = aim == null ? 1 : aimScore(c.at, c.guide, 0.12);
      scores.push(score);
      const at = v3(x, center.y + 0.5, center.z);
      sfx.chop(c.perfect);
      world.shake(0.06);
      world.fx.bits(at, BITS, c.perfect ? 10 : 6, { floor: top + 0.02, speed: 2.4, up: 2.6 });
      if (c.perfect) { world.fx.sparkle(at, 8); ctx.good(at, "Perfeito!"); } else ctx.good(at, "Corte!");
      ctx.progress(cuts.length / CUTS);
      plan = nextCut(BOX, cuts, CUTS, null);
      await world.tween(0.18, (k) => { knife.position.y = center.y + 0.02 + (hoverY - center.y) * k; });
      busy = false;
      if (cuts.length === CUTS && live) { live = false; ctx.done(scores.reduce((a, b) => a + b, 0) / CUTS); }
    }

    return {
      async intro() {
        await world.tween(0.8, (k) => { knife.position.y = hoverY + 1.5 * (1 - k); });
      },
      start() {
        live = true;
        const hit = (e) => world.planeHit(e, center.y + 0.45);
        world.input = {
          down: (e) => { stroke = { y0: e.clientY, x0: e.clientX, xs: [] }; },
          move: (e) => {
            const p = hit(e);
            if (p) aimX = p.x;
            if (!stroke || !p) return;
            trail(p);
            if (Math.abs(p.z - center.z) < 1.1 && Math.abs(p.x - center.x) < 1.8) stroke.xs.push(p.x);
          },
          up: (e) => {
            const st = stroke; stroke = null;
            if (!st || !live) return;
            const dy = e.clientY - st.y0, dx = e.clientX - st.x0;
            if (Math.abs(dy) < 30 || Math.abs(dy) < Math.abs(dx)) return ctx.say("Risque de cima para baixo, como uma faca!");
            if (!st.xs.length) return ctx.say("Risque por cima da carne.");
            const mid = st.xs.reduce((a, b) => a + b, 0) / st.xs.length;
            cut(toFrac(mid));
          },
        };
      },
      key(e, down) {
        if (down && live && (e.key === " " || e.key === "Enter")) { e.preventDefault(); cut(null); }
      },
      async rescue() {
        live = false;
        while (cuts.length < CUTS) await (busy ? world.wait(0.05) : cut(null));
      },
      finish() {
        // as fatias ficam no fundo da tábua para a próxima etapa
        s.keep(slab);
        world.dish.beefSlab = slab;
        const from = slab.position.clone();
        world.tween(0.6, (k) => {
          slab.position.lerpVectors(from, v3(STATION_X.board - 0.6, from.y, -0.45), k);
          slab.scale.setScalar(SCALE + (0.72 - SCALE) * k);
          slab.position.y = from.y + Math.sin(k * Math.PI) * 0.6 - (0.14 * (SCALE - 0.72)) * k;
        });
        s.dispose();
        // os planos de corte seguem a carne enquanto ela estiver na cena
        const off = world.every(() => { if (!slab.parent) off(); else sync(); });
      },
    };
  },
};
