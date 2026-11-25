import { useEffect, useRef, useState } from "react";
import { minigame } from "../three/games";
import { hero } from "../three/games/common";
import { SHOTS } from "../three/world";
import { stepGrade } from "../game/rules";
import { sfx } from "../game/sound";
import GestureIcon from "./GestureIcon";
import Guide, { GUIDE_FOR } from "./Guide";
import { localize } from "../i18n";

const CANCEL = Symbol("cancel");
const RESCUE_SCORE = 0.25; // etapa que o chef terminou: conta pouco, mas não zera
const FAR = 14; // distância (no eixo da bancada) a partir da qual a câmera corta em vez de voar
const IRIS = 0.55; // segundos da íris fechando (e abrindo); igual a `--iris-time` no CSS
const LEAVE = 0.4; // segundos do cartão e do carimbo saindo; igual a `card-out` no CSS

// Uma fase da partida: roda os minijogos 3D dela um depois do outro.
// Cada etapa: câmera viaja → cartão com o gesto → "Já!" → jogo com tempo → carimbo da nota.
export default function MinigamePhase({ world, specs, game, recipe, combo, good, bad, say, onStep, onDone }) {
  const [view, setView] = useState(null);
  const [hud, setHud] = useState({ progress: 0, gauge: null, list: null, left: 1, total: 1 });
  const [stamp, setStamp] = useState(null);
  const [wipe, setWipe] = useState(false);
  const cb = useRef(null);
  const guide = useRef(null);
  cb.current = { good, bad, say, onStep, onDone };

  useEffect(() => {
    let cancelled = false, inst = null, finished = true;
    const offs = new Set();
    const guard = (p) => p.then((v) => { if (cancelled) throw CANCEL; return v; });

    // Leva a câmera até `shot` (nome ou enquadramento). Perto, voa. Longe demais (feira, outra
    // ponta da bancada), fecha uma íris de estrela, troca o lugar com a tela coberta e abre de novo.
    // `prepare` roda com a câmera parada (ou com a tela coberta) e a GPU aquece o que ele montou
    // antes de qualquer movimento: o voo nunca trava compilando. Devolve `{ arrived }`, embrulhada
    // para o `await` daqui não esperar a viagem inteira.
    async function travelTo(shot, dur, prepare) {
      const to = typeof shot === "string" ? SHOTS[shot] : shot;
      const far = Math.abs((world.shot ?? SHOTS.wide).look.x - to.look.x) > FAR;
      if (far) {
        setWipe("close");
        await guard(world.wait(IRIS));
        world.shot = to; // só depois da espera: uma fase cancelada no meio não deixa a cortina presa
        world.go(to, 0);
      }
      prepare?.();
      await guard(world.warm());
      if (!far) { world.shot = to; return { arrived: world.go(to, dur) }; }
      await guard(world.wait(0.12)); // um respiro coberto: o primeiro quadro do lugar novo já desenhado
      setWipe("open");
      return { arrived: world.wait(IRIS).then(() => { if (!cancelled) setWipe(null); }) };
    }

    async function play(spec, i) {
      // a receita pode trocar título, textos, câmera e tempo do minijogo na própria etapa
      const mg = { ...minigame(spec.game), ...spec };
      setView({ i, mg, spec, stage: "travel" });
      setHud({ progress: 0, gauge: null, list: null, left: mg.seconds, total: mg.seconds });

      let settle;
      const result = new Promise((r) => { settle = r; });
      let live = false, rescuing = false;
      const at = (p) => world.toScreen(p);
      // guia padrão: o gesto da etapa no meio do enquadramento; o minijogo pode trocar ou tirar (`guide: null`)
      const look = (typeof mg.shot === "string" ? SHOTS[mg.shot] : mg.shot).look;
      guide.current = mg.guide === null ? null : { kind: mg.guide ?? GUIDE_FOR[mg.gesture], at: look, r: 1.2, dir: new world.THREE.Vector3(1, 0, 0) };
      // o chef terminando não vale moeda nem bronca
      const ctx = {
        good: (p, text) => { if (!rescuing) cb.current.good(at(p), text); },
        bad: (p, text) => { if (!rescuing) { world.shake(0.1); cb.current.bad(at(p), text); } },
        say: (text, mood) => cb.current.say(text, mood),
        progress: (k) => setHud((h) => ({ ...h, progress: k })),
        gauge: (g) => setHud((h) => ({ ...h, gauge: g })),
        list: (items) => setHud((h) => ({ ...h, list: items })),
        done: (score) => { if (live) settle({ score }); },
        guide: (g) => { guide.current = g; },
      };
      // guardado: no StrictMode a primeira montagem é cancelada antes e não chega a criar a cena
      const { arrived: travel } = await guard(travelTo(mg.shot, world.shot ? 1.3 : 1.8, () => {
        inst = mg.create(world, ctx, spec, game);
        finished = false;
      }));
      setView((v) => ({ ...v, stage: "card" }));
      await guard(Promise.all([travel, inst.intro(), world.wait(1.8)]));

      sfx.go();
      setView((v) => ({ ...v, stage: "go" }));
      await guard(world.wait(0.65));

      // valendo: tempo correndo e teclado ligado
      setView((v) => ({ ...v, stage: "live" }));
      live = true;
      inst.start();
      let left = mg.seconds, shown = left, warned = false, second = 0;
      offs.add(world.every((dt) => {
        if (!live) return;
        left -= dt;
        if (Math.abs(shown - left) >= 0.1) { shown = left; setHud((h) => ({ ...h, left: Math.max(0, left) })); }
        if (!warned && left <= 5) { warned = true; cb.current.say("Rápido, o tempo está acabando!", "sad"); }
        // nos últimos 5 segundos o relógio aparece no som: um tique por segundo
        if (left <= 5 && left > 0 && Math.ceil(left) !== second) { second = Math.ceil(left); sfx.tick(second); }
        if (left <= 0) settle({ timeout: true });
      }));
      const onKey = (down) => (e) => {
        if (!live || e.ctrlKey || e.metaKey || e.altKey) return;
        // Espaço/Enter num botão ou link do topo (Sair, Silenciar) é para ele, não para o
        // minijogo: senão silenciar pelo teclado também cortaria, mexeria ou serviria
        if ((e.key === " " || e.key === "Enter") && e.target.closest?.("button, a, input, select, textarea")) return;
        inst.key(e, down);
      };
      const kd = onKey(true), ku = onKey(false);
      window.addEventListener("keydown", kd);
      window.addEventListener("keyup", ku);
      offs.add(() => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); });

      const res = await guard(result);
      live = false;
      world.input = null;
      offs.forEach((off) => off()); offs.clear();

      // sobra de tempo só vale na medida da nota: terminar cedo e mal não dá bônus
      let score = res.score, spare = Math.max(0, Math.floor(left * (score ?? 0)));
      if (res.timeout) {
        cb.current.say("Deixa que eu ajudo!", "sad");
        sfx.fail();
        rescuing = true;
        setView((v) => ({ ...v, stage: "rescue" }));
        await guard(inst.rescue());
        score = RESCUE_SCORE; spare = 0;
      }
      const grade = stepGrade(score);
      setView((v) => ({ ...v, stage: "stamp" }));
      setStamp(grade);
      sfx.stamp(grade.key);
      cb.current.say(res.timeout ? "Terminei para você. Na próxima vai!" : grade.label, grade.key === "oops" ? "sad" : "happy");
      cb.current.onStep({ title: mg.title, score, spare });
      await guard(world.wait(1.2));
      // carimbo e cartão saem juntos, com o último gesto do minijogo, antes de a câmera andar
      setStamp((s) => ({ ...s, out: true }));
      setView((v) => ({ ...v, stage: "leave" }));
      await guard(Promise.all([inst.outro?.(), world.wait(LEAVE)]));
      setStamp(null);
      inst.finish();
      finished = true;
      // etapa que termina o prato: a câmera chega perto do que ficou pronto
      if (spec.hero) {
        const h = hero(world, spec.hero);
        await guard((await travelTo(h.shot, 1.4)).arrived);
        await guard(h.show());
      }
    }

    (async () => {
      for (const [i, spec] of specs.entries()) await play(spec, i);
      cb.current.onDone();
    })().catch((e) => { if (e !== CANCEL) throw e; });

    return () => {
      cancelled = true;
      offs.forEach((off) => off());
      world.input = null;
      if (inst && !finished) inst.finish();
    };
  }, [world, specs, game]);

  if (!view) return null;
  const { mg, spec, stage, i } = view;
  // a partida é toda em português: texto da receita e lista vêm da tradução, não da API
  const pt = localize(recipe, "pt");
  const ptIngredient = (api) => pt.ingredients[recipe.ingredients.indexOf(api)] ?? api;
  const recipeText = spec.step != null
    ? pt.instructions[spec.step]
    : spec.items?.map((id) => ptIngredient(game.ingredients.find((x) => x.id === id).api)).join(" · ");
  const low = stage === "live" && hud.left <= 5;

  return (
    <div className="mg" data-stage={stage}>
      <section className="step-card" aria-live="polite">
        <GestureIcon kind={mg.gesture} />
        <Clock left={hud.left} total={hud.total} low={low} />
        <div className="step-text">
          <p className="step-count">Etapa {i + 1} de {specs.length}</p>
          <h2 className="step-title">{mg.title}</h2>
          <p className="step-how">{mg.how}</p>
          <p className="step-keys">{mg.keys}</p>
          {recipeText && <p className="step-en">{recipeText}</p>}
          <span className="bar-progress" aria-hidden="true"><i style={{ width: `${hud.progress * 100}%` }} /></span>
        </div>
        {combo > 1 && <p className="step-combo" key={combo}>Combo x{combo}</p>}
      </section>

      {hud.list && (
        <section className="shop-list" aria-label="Lista de compras">
          <h3>Lista de compras</h3>
          <ul>
            {hud.list.map((it) => (
              <li key={it.id} data-got={it.got || undefined}>
                <span className="check" aria-hidden="true">{it.got ? "✓" : ""}</span>
                <span>{ptIngredient(it.text)}</span>
                <span className="visually-hidden">{it.got ? " (na cesta)" : " (falta)"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hud.gauge?.kind === "band" && <BandGauge {...hud.gauge} />}
      {hud.gauge?.kind === "beats" && <BeatsGauge {...hud.gauge} />}

      <Guide world={world} guide={guide} show={stage === "card" || stage === "go" || stage === "live"} faded={stage === "live" && hud.progress > 0} />
      {stage === "go" && <p className="go-banner" aria-hidden="true">Já!</p>}
      {stamp && <p className="stamp" data-grade={stamp.key} data-out={stamp.out || undefined} role="status">{stamp.label}</p>}
      {wipe && <div className="wipe" data-state={wipe} aria-hidden="true"><span className="wipe-heart" /></div>}
    </div>
  );
}

// Timer de cozinha: a fatia laranja é o tempo que sobra.
function Clock({ left, total, low }) {
  return (
    <div className="clock" data-low={low || undefined} style={{ "--t": left / total }} aria-hidden="true">
      <span className="clock-num">{Math.ceil(left)}</span>
    </div>
  );
}

// Medidor de despejo: a faixa verde é a medida certa.
function BandGauge({ level, lo, hi, label }) {
  const pct = (x) => `${Math.min(1, x) * 100}%`;
  return (
    <div className="gauge-band" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
      <span className="gauge-name">{label}</span>
      <div className="gauge-tube">
        <span className="gauge-zone" style={{ bottom: pct(lo), height: pct(hi - lo) }} />
        <span className="gauge-fill" style={{ height: pct(level) }} />
        <span className="gauge-mark" style={{ bottom: pct(level) }} />
      </div>
    </div>
  );
}

// Linha do tempo do ritmo: as bolinhas andam até a linha; toque quando encostar.
const SPAN = 3; // segundos visíveis à frente
function BeatsGauge({ beats, now, window, hits }) {
  const x = (t) => 14 + ((t - now) / SPAN) * 80;
  return (
    <div className="gauge-beats" aria-hidden="true">
      <span className="beat-line" style={{ left: "14%" }} />
      {beats.map((t, i) => {
        const pos = x(t);
        if (pos < -6 || pos > 104) return null;
        const hit = hits[i];
        return <span key={i} className="beat" data-state={hit == null ? "wait" : hit > 0 ? "hit" : "miss"} data-near={Math.abs(t - now) <= window || undefined} style={{ left: `${pos}%` }} />;
      })}
    </div>
  );
}
