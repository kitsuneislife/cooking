import { useEffect, useRef, useState } from "react";
import Illustration from "./Illustration";
import DragGhost from "./DragGhost";
import CutIcon from "./CutIcon";
import { usePickDrop } from "../hooks/usePickDrop";
import { CUTS } from "../data/games";
import { nextCut } from "../game/rules";
import { sfx } from "../game/sound";
import { burst, fly, itemEl, pop, strike, thud } from "../game/fx";

// Quantos cortes cada tipo pede: quanto mais fino, mais cortes.
const CHOPS = { "Picado fino": 7, Picado: 6, "Em cubos": 6, Fatiado: 5, Ralado: 6 };
// Cor dos pedacinhos que espirram a cada corte.
const BITS = {
  beef: ["#bf2f3c", "#e8606a", "#f9eedb"],
  garlic: ["#ffffff", "#f3ead8", "#e4d9ee"],
  ginger: ["#f2d27a", "#d9a94a", "#fff3c4"],
};
const WOOD_BITS = ["#ffffff", "#f6e3bf", "#d9964d"];
// Até medir o desenho, supõe o ingrediente no meio da tábua (frações do desenho).
const DEFAULT_BOX = { lo: 0.2, hi: 0.8, top: 0.35, bottom: 0.78 };
// A ponta da faca, parada, já encosta no ingrediente (em % da altura do desenho).
const KNIFE_DIP = 6;

// Fase 2: levar à tábua o que pede corte, escolher o corte que a API pede e cortar.
export default function PrepPhase({ game, good, bad, say, onDone }) {
  const toCut = game.ingredients.filter((i) => i.cut);
  const [onBoard, setOnBoard] = useState(null);
  const [cuts, setCuts] = useState(null); // null: o corte ainda não foi escolhido; senão [{ at, perfect }]
  const [aim, setAim] = useState(null); // onde o ponteiro está, em fração do desenho
  const [box, setBox] = useState(DEFAULT_BOX);
  const [finishing, setFinishing] = useState(false);
  const [done, setDone] = useState([]);
  const [wrongCut, setWrongCut] = useState(null);
  const board = useRef(null);
  const food = useRef(null);
  const knife = useRef(null);
  const doneList = useRef(null);
  const byId = (id) => toCut.find((i) => i.id === id);
  const current = byId(onBoard);
  const waiting = toCut.filter((i) => !done.includes(i.id) && i.id !== onBoard);
  const total = current ? CHOPS[current.cut] : 0;
  const chopping = cuts != null && !finishing;

  // Mede onde o desenho do ingrediente começa e termina, para a guia cair em cima dele.
  useEffect(() => {
    const svg = food.current?.querySelector("svg");
    const drawn = svg?.querySelector(".food");
    if (!drawn) return;
    const b = drawn.getBBox(), v = svg.viewBox.baseVal;
    setBox({ lo: b.x / v.width, hi: (b.x + b.width) / v.width, top: b.y / v.height, bottom: (b.y + b.height) / v.height });
  }, [onBoard]);

  const { drag, itemProps, zoneProps } = usePickDrop({
    tapZone: "board",
    onDrop: (id, zone, point) => {
      if (current) return say("Termine este corte primeiro.");
      const card = itemEl(id);
      fly(point ?? card, board.current, card.querySelector("svg"));
      sfx.pick();
      setOnBoard(id);
      say(`A receita diz "${byId(id).api}". Qual é o corte?`);
    },
  });

  function chooseCut(cut) {
    if (cut !== current.cut) {
      setWrongCut(cut);
      bad(`${cut} não. A receita diz "${current.api}".`, board.current);
      return;
    }
    setWrongCut(null);
    setCuts([]);
    board.current.focus();
    say("Isso! Corte em cima da linha tracejada.", "happy");
  }

  const fraction = (clientX) => {
    const r = food.current.getBoundingClientRect();
    return (clientX - r.left) / r.width;
  };

  // Clique com o ponteiro mira onde tocou; Enter/Espaço (detail 0) corta na guia.
  function chop(e) {
    if (!chopping) return;
    const cut = nextCut(box, cuts.map((c) => c.at), total, e.detail === 0 ? null : fraction(e.clientX));
    const next = [...cuts, cut];
    setCuts(next);

    const r = food.current.getBoundingClientRect();
    const point = { x: r.left + cut.at * r.width, y: r.top + ((box.top + box.bottom) / 2) * r.height };
    sfx.chop(cut.perfect);
    strike(knife.current, `${cut.at * 100}%`, ((box.bottom - box.top) * 100 - KNIFE_DIP) / 100 * r.height + 4);
    thud(board.current);
    burst(point, BITS[current.id] ?? WOOD_BITS, cut.perfect ? 10 : 6);
    if (cut.perfect) pop({ x: point.x, y: r.top + box.top * r.height }, "Perfeito!");
    if (next.length < total) return;

    // deixa ver o corte pronto antes de mandar para a prateleira
    const item = current, finished = [...done, item.id];
    const clean = next.every((c) => c.perfect);
    setFinishing(true);
    setTimeout(() => {
      fly(food.current, doneList.current, food.current.querySelector("svg"));
      setDone(finished);
      setOnBoard(null);
      setCuts(null);
      setAim(null);
      setFinishing(false);
      const all = finished.length === toCut.length;
      good(doneList.current, all ? "Tudo cortado!" : `${item.name}: ${item.cut.toLowerCase()}${clean ? ", corte perfeito!" : "!"}`);
      if (all) setTimeout(onDone, 1300);
    }, 650);
  }

  const zone = zoneProps("board");
  const plan = cuts && !finishing ? nextCut(box, cuts.map((c) => c.at), total, aim) : null;
  // pedaços entre os cortes: cada um é o desenho inteiro recortado na sua faixa
  const edges = [0, ...(cuts ?? []).map((c) => c.at), 1];

  return (
    <section className="phase prep" aria-labelledby="phase-title">
      <h2 id="phase-title" tabIndex={-1} className="visually-hidden">Fase 2: Preparo</h2>

      <section className="side-shelf" aria-labelledby="queue-title">
        <h3 id="queue-title">Para cortar</h3>
        <ul>
          {waiting.map((item, n) => (
            <li key={item.id}>
              <button type="button" className="crate" style={{ "--d": `${-n * 0.6}s` }} aria-label={`${item.name}: ${item.api}`} {...itemProps(item.id)}>
                <Illustration name={item.id} className="art bare" />
                <span className="crate-name">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="board-area">
        <p className="ticket recipe-says">
          {current
            ? <>A receita diz: <strong lang="en">{current.api}</strong></>
            : "Toque num ingrediente para levar à tábua."}
        </p>

        <button
          type="button"
          ref={board}
          className="board-zone"
          data-chopping={chopping || undefined}
          aria-label={!current ? "Tábua vazia" : chopping ? `Cortar ${current.name}: faltam ${total - cuts.length} cortes` : `Tábua com ${current.name}`}
          {...zone}
          onClick={cuts ? chop : zone.onClick}
          onPointerMove={chopping ? (e) => setAim(fraction(e.clientX)) : undefined}
          onPointerLeave={() => setAim(null)}
        >
          <Illustration name="board" className="art" />
          {current && (
            <span ref={food} className="on-board" data-finished={finishing || undefined} aria-hidden="true">
              {edges.slice(1).map((right, k) => {
                const left = edges[k], last = k === edges.length - 2;
                return (
                  <span
                    key={k}
                    className={`piece${last && k > 0 && !finishing ? " fresh" : ""}`}
                    style={{
                      clipPath: `inset(-40% ${last ? -40 : (1 - right) * 100}% -40% ${k ? left * 100 : -40}%)`,
                      "--k": k - (edges.length - 2) / 2,
                    }}
                  >
                    <Illustration name={current.id} className="art bare" />
                  </span>
                );
              })}
              {plan && <i className="guide" style={{ left: `${plan.guide * 100}%`, top: `${box.top * 100}%`, height: `${(box.bottom - box.top) * 100}%` }} />}
              {cuts && (
                <>
                  <svg
                    ref={knife}
                    className="knife"
                    data-perfect={(aim != null && plan?.perfect) || undefined}
                    style={{ left: `${(plan?.at ?? cuts.at(-1).at) * 100}%`, bottom: `${(1 - box.top) * 100 - KNIFE_DIP}%` }}
                    viewBox="0 0 36 140"
                  >
                    <path d="M9 47 H27 Q29 92 18.5 137 Q9 100 9 47 Z" fill="#e6ebef" stroke="#7b8791" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M14 52 Q14 96 18 126" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="7" y="40" width="22" height="9" rx="2" fill="#9aa5ae" stroke="#6b747d" strokeWidth="1.2" />
                    <rect x="10" y="2" width="16" height="40" rx="6" fill="#4a2a14" stroke="#2a1608" strokeWidth="1.5" />
                    <circle cx="18" cy="14" r="2" fill="#d8dde2" />
                    <circle cx="18" cy="29" r="2" fill="#d8dde2" />
                  </svg>
                </>
              )}
            </span>
          )}
          {cuts && (
            <span className="pips" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => <i key={i} className={!cuts[i] ? "" : cuts[i].perfect ? "on gold" : "on"} />)}
            </span>
          )}
        </button>

        <fieldset className="cuts" disabled={!current || cuts != null}>
          <legend className="visually-hidden">{current ? `Como cortar ${current.name.toLowerCase()}?` : "Coloque um ingrediente na tábua"}</legend>
          {CUTS.map((cut) => (
            <button key={cut} type="button" className={`cut-btn${wrongCut === cut ? " shake wrong" : ""}`} onClick={() => chooseCut(cut)}>
              <CutIcon cut={cut} />
              {cut}
            </button>
          ))}
        </fieldset>
      </div>

      <section className="side-shelf" aria-labelledby="done-title">
        <h3 id="done-title">Prontos {done.length}/{toCut.length}</h3>
        <ul ref={doneList}>
          {done.map((id) => (
            <li key={id} className="crate done">
              <Illustration name={id} className="art bare" />
              <span className="crate-name">{byId(id).name}</span>
              <span className="chip chip-ok"><CutIcon cut={byId(id).cut} />{byId(id).cut}</span>
            </li>
          ))}
        </ul>
      </section>

      {drag && <DragGhost drag={drag}><Illustration name={drag.id} className="art bare" /></DragGhost>}
    </section>
  );
}
