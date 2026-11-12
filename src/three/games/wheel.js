// Cortar a pizza: três riscos de ponta a ponta, cada um em cima da linha tracejada.
import { THREE } from "../kit.js";
import { STATION_X } from "../sets.js";
import { pizzaWheel } from "../gear.js";
import { aimScore, angleDelta, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, dashes, v3 } from "./common.js";

const ANGLES = [0, Math.PI / 3, -Math.PI / 3]; // seis fatias
const CUT_Y = 0.25;

export default {
  title: "Cortar a pizza",
  how: "Risque de ponta a ponta sobre cada linha tracejada.",
  keys: "Espaço corta na linha.",
  gesture: "swipe",
  shot: "board",
  seconds: 20,

  create(world, ctx) {
    const s = scope(world), board = world.kitchen.stations.board, pie = world.dish.pizza;
    if (!pie) throw new Error("Não há pizza para cortar");
    const R = pie.userData.R, C = v3(STATION_X.board, board.userData.top * board.scale.y, 0.4);
    const dir = (a) => v3(Math.sin(a), 0, Math.cos(a));
    const guide = s.add(dashes(R * 2));
    const tool = s.add(pizzaWheel());
    tool.position.set(C.x + 2.4, C.y + 2.2, C.z);
    const groove = new THREE.MeshBasicMaterial({ color: "#6a3a1a" });

    const scores = [];
    let n = 0, live = false, busy = false, p0 = null, aim = null;
    ctx.guide({ kind: "swipe", at: () => (n < ANGLES.length && !busy ? v3(C.x, C.y + CUT_Y + 0.05, C.z) : null), r: R * 0.85, dir: () => dir(ANGLES[n] ?? 0) });

    s.every((dt, t) => {
      guide.visible = live && n < ANGLES.length;
      guide.position.set(C.x, C.y + CUT_Y + 0.04, C.z);
      guide.rotation.y = ANGLES[n] ?? 0;
      guide.userData.mat.opacity = 0.55 + 0.4 * Math.sin(t * 6);
      if (!busy && live && aim) tool.position.lerp(v3(aim.x, C.y + CUT_Y, aim.z), Math.min(1, dt * 14));
    });

    async function cut(score) {
      if (busy || n >= ANGLES.length) return;
      busy = true;
      const a = ANGLES[n], d = dir(a), from = C.clone().addScaledVector(d, -R), to = C.clone().addScaledVector(d, R);
      from.y = to.y = C.y + CUT_Y - 0.06;
      tool.rotation.y = a - Math.PI / 2; // o disco rola ao longo do corte
      sfx.swish();
      await world.tween(0.28, (k) => { tool.position.lerpVectors(from, to, k); tool.userData.disc.rotation.z = -k * R * 2 / 0.34; });
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, R * 1.9), groove);
      mark.position.y = 0.15; mark.rotation.y = a;
      pie.userData.top.add(mark);
      scores.push(score);
      const at = C.clone().add(v3(0, 0.7, 0));
      sfx.chop(score > 0.85);
      world.shake(0.05);
      world.fx.bits(to, ["#e3a64e", "#fff1c8", "#d02a1c"], 6, { floor: C.y + 0.02, speed: 2, up: 2.2 });
      if (score > 0.85) { world.fx.sparkle(at, 8); ctx.good(at, "Perfeito!"); } else ctx.good(at, "Corte!");
      n++;
      ctx.progress(n / ANGLES.length);
      busy = false;
      if (n === ANGLES.length && live) { live = false; ctx.done(average(scores)); }
    }

    const hit = (e) => world.planeHit(e, C.y + CUT_Y);
    return {
      async intro() {
        pie.position.copy(C); // a pizza chega à tábua
        await world.tween(0.6, (k) => { tool.position.y = C.y + 2.2 - (2.2 - CUT_Y - 0.5) * k; tool.position.x = C.x + 2.4 - 1.2 * k; });
      },
      start() {
        live = true;
        world.input = {
          down: (e) => { p0 = hit(e); },
          move: (e) => { aim = hit(e); },
          up: (e) => {
            const a = p0, b = hit(e); p0 = null;
            if (!a || !b || !live || busy) return;
            const v = b.clone().sub(a);
            if (v.length() < R) return ctx.say("Risque de ponta a ponta da pizza!");
            // quanto o risco desviou da linha: no ângulo e na distância do centro
            const turn = Math.abs(angleDelta(Math.atan2(v.x, v.z), ANGLES[n])), off = Math.min(turn, Math.PI - turn);
            const away = Math.abs(C.clone().sub(a).cross(v.normalize()).y);
            cut(Math.max(0.2, aimScore(off, 0, 0.7) * aimScore(away, 0, 0.8)));
          },
        };
      },
      key(e, down) {
        if (down && live && !e.repeat && (e.key === " " || e.key === "Enter")) { e.preventDefault(); cut(1); }
      },
      async rescue() {
        live = false;
        while (n < ANGLES.length) await (busy ? world.wait(0.05) : cut(1));
      },
      async outro() {
        await world.tween(0.4, (k) => { tool.position.y += k * 0.2; tool.position.x += k * 0.25; });
      },
      finish() { s.dispose(); },
    };
  },
};
