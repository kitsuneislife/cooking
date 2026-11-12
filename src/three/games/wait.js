// Forno e geladeira: (forno) segurar até a temperatura certa, depois esperar e tirar
// quando o ponteiro estiver no verde. Na geladeira é só a espera.
import { STATION_X } from "../sets.js";
import { dish } from "../models.js";
import { bandScore, average } from "../../game/rules.js";
import { sfx } from "../../game/sound.js";
import { scope, hop, v3 } from "./common.js";

const LO = 0.55, HI = 0.75, SWEET = 0.65, RATE = 0.115, OVER = 1.12; // o ponto, no medidor de 0 a 1
const T_LO = 0.78, T_HI = 0.86; // 235 a 255 °C num forno que vai até 300

export default {
  title: "Assar",
  how: "Segure para esquentar o forno e solte no verde. Depois toque para tirar no ponto.",
  keys: "Segure Espaço para esquentar; depois Espaço tira do forno.",
  gesture: "timing",
  shot: "oven",
  seconds: 30,

  create(world, ctx, spec) {
    const s = scope(world), st = world.kitchen.stations[spec.in], su = st.userData, item = world.dish[spec.item];
    if (!item) throw new Error(`Nada para pôr em ${spec.in}: dish.${spec.item}`);
    const hot = spec.in === "oven";
    const slot = st.localToWorld(su.slot.clone()), front = st.localToWorld(su.mouth.clone());
    front.y = 0.02; // apoiado na bancada, em frente à porta
    const sign = slot.clone().add(v3(0, 1.4, 1.6));
    const scores = [];
    let phase = "idle", live = false, held = false, temp = 0, level = 0, dinged = false, tock = 0;
    // segurar no pré-aquecimento; na espera, o alvo só acende quando entra no ponto
    ctx.guide({ kind: () => (phase === "heat" || (phase === "idle" && spec.preheat) ? "hold" : phase === "cook" && level >= LO ? "timing" : null), at: slot.clone().add(v3(0, 0.2, 1.4)), r: 0.8 });

    async function putIn() {
      phase = "move";
      ctx.gauge(null);
      sfx.door(true);
      await world.tween(0.4, (k) => su.open(k));
      await hop(world, item, slot, { height: 0.5, dur: 0.6 });
      await world.tween(0.4, (k) => su.open(1 - k));
      sfx.door(false);
      phase = "cook";
      if (live) ctx.say("Agora espere... e toque para tirar no verde!");
    }
    async function lock() { // soltou o botão: a temperatura fica onde está
      if (phase !== "heat") return;
      const score = bandScore(temp, T_LO, T_HI, 0.15);
      scores.push(score);
      if (score >= 0.85) { world.fx.sparkle(sign, 8); ctx.good(sign, "Temperatura certa!"); }
      else ctx.bad(sign, temp < T_LO ? "Forno morno!" : "Quente demais!");
      await putIn();
    }
    async function takeOut() {
      if (phase !== "cook") return;
      phase = "out";
      ctx.gauge(null);
      const score = bandScore(level, LO, HI, 0.2);
      scores.push(score);
      sfx.door(true);
      await world.tween(0.4, (k) => su.open(k));
      if (hot) world.fx.steam(slot, 5, { size: 1, rise: 1.4 }); else world.fx.steam(slot, 4, { color: "#d8f0ff", size: 0.9, rise: 0.4 });
      if (score >= 0.85) { world.fx.sparkle(sign, 10); ctx.good(sign, "No ponto!"); }
      else ctx.bad(sign, level < LO ? (hot ? "Ainda crua!" : "Ainda mole!") : (hot ? "Passou do ponto!" : "Gelou demais!"));
      if (hot) { // a geladeira fica aberta mostrando a sobremesa; do forno, sai para a bancada
        await hop(world, item, front, { height: 0.5, dur: 0.6 });
        await world.tween(0.4, (k) => su.open(1 - k));
        sfx.door(false);
      }
      phase = "done";
      if (live) { live = false; ctx.done(average(scores)); }
    }

    s.every((dt) => {
      if (phase === "heat") {
        temp = Math.max(0, Math.min(1, temp + (held ? 0.32 : -0.05) * dt));
        sfx.loop("grill", temp * 0.7); // o fogo do forno crepita mais conforme esquenta
        su.setTemp(temp * 300); su.heat(temp);
        ctx.gauge({ kind: "band", level: temp, lo: T_LO, hi: T_HI, label: "Temperatura" });
        if (temp > T_HI + 0.12) lock();
      } else if (phase === "cook") {
        level += RATE * dt;
        item.userData.ready?.(level / SWEET);
        // a espera tem relógio: tique-taque a cada meio segundo (e o queijo borbulhando, no forno)
        const beat = Math.floor(level / RATE * 2);
        if (beat !== tock) { tock = beat; sfx.tick(beat); }
        if (hot) sfx.loop("bake", 0.5);
        ctx.gauge({ kind: "band", level, lo: LO, hi: HI, label: spec.label });
        if (!dinged && level >= LO) { dinged = true; sfx.done(hot); if (live) ctx.say("No ponto: toque para tirar!", "happy"); }
        if (hot && level > HI && Math.random() < dt * 4) world.fx.steam(slot, 1, { color: "#5a4a40", size: 0.7, rise: 1.2 });
        if (level >= OVER) takeOut();
      }
    });

    const press = () => {
      if (!live) return;
      if (phase === "heat") { if (!held) sfx.switch(); held = true; } else takeOut();
    };
    const lift = () => { if (!held) return; held = false; if (temp > 0.08) lock(); };
    return {
      async intro() {
        if (hot) { su.setTemp(0); su.heat(0); await hop(world, item, front, { height: 1.6, dur: 0.8 }); return; }
        su.open(1); // a sobremesa já entra: a etapa começa fechando a porta
        item.position.copy(slot);
        await world.wait(0.9);
        await world.tween(0.5, (k) => su.open(1 - k));
        sfx.door(false);
      },
      start() {
        live = true;
        if (spec.preheat) phase = "heat"; else if (hot) putIn(); else phase = "cook";
        world.input = { down: press, up: lift };
      },
      key(e, down) {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (e.repeat) return;
        down ? press() : lift();
      },
      async rescue() {
        live = false; held = false;
        while (phase !== "done") {
          if (phase === "heat") { temp = (T_LO + T_HI) / 2; su.setTemp(temp * 300); su.heat(temp); await lock(); }
          else if (phase === "cook") { level = SWEET; item.userData.ready?.(1); await takeOut(); }
          else await world.wait(0.05);
        }
      },
      async outro() {
        if (!spec.serve) return;
        // some num brilho e reaparece servida no lugar do prato
        world.fx.sparkle(item.position.clone().add(v3(0, 0.5, 0)), 14);
        await world.tween(0.25, (k) => item.scale.setScalar(Math.max(0.01, 1 - k)));
        world.kitchen.stations.plate.visible = false;
        if (!spec.dish) { item.position.set(STATION_X.plate, 0.02, 0.3); item.scale.setScalar(1); return; }
        // servida, a sobremesa vira o prato pronto do Blender (e é ele que a foto final enquadra)
        item.visible = false;
        const d = s.add(dish(spec.dish)), size = d.scale.x;
        d.position.set(STATION_X.plate, 0.02, 0.3);
        s.keep(d);
        world.dish[spec.item] = d;
        await world.tween(0.3, (k) => d.scale.setScalar(Math.max(0.01, size * k)));
      },
      finish() { ctx.gauge(null); su.open(0); s.dispose(); },
    };
  },
};
