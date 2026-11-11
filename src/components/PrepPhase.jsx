import { useRef, useState } from "react";
import Illustration from "./Illustration";
import DragGhost from "./DragGhost";
import CutIcon from "./CutIcon";
import { usePickDrop } from "../hooks/usePickDrop";
import { CUTS } from "../data/games";
import { sfx } from "../game/sound";
import { burst, fly, itemEl } from "../game/fx";

const CHOPS = 5;

// Fase 2: levar à tábua o que pede corte, escolher o corte que a API pede e cortar.
export default function PrepPhase({ game, good, bad, say, onDone }) {
  const toCut = game.ingredients.filter((i) => i.cut);
  const [onBoard, setOnBoard] = useState(null);
  const [chops, setChops] = useState(null); // null: o corte ainda não foi escolhido
  const [done, setDone] = useState([]);
  const [wrongCut, setWrongCut] = useState(null);
  const board = useRef(null);
  const byId = (id) => toCut.find((i) => i.id === id);
  const current = byId(onBoard);
  const waiting = toCut.filter((i) => !done.includes(i.id) && i.id !== onBoard);

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
    setChops(0);
    board.current.focus();
    say("Isso! Agora toque na tábua para cortar.", "happy");
  }

  function chop() {
    sfx.chop();
    burst(board.current, ["#ffffff", "#f6e3bf", "#d9964d"], 6);
    if (chops + 1 < CHOPS) return setChops(chops + 1);
    const next = [...done, current.id];
    setDone(next);
    setOnBoard(null);
    setChops(null);
    good(board.current, next.length === toCut.length ? "Tudo cortado!" : `${current.name}: ${current.cut.toLowerCase()}!`);
    if (next.length === toCut.length) setTimeout(onDone, 1300);
  }

  const chopping = chops != null;
  const zone = zoneProps("board");

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
          aria-label={!current ? "Tábua vazia" : chopping ? `Cortar ${current.name}: faltam ${CHOPS - chops} toques` : `Tábua com ${current.name}`}
          {...zone}
          onClick={chopping ? chop : zone.onClick}
        >
          <Illustration name="board" className="art" />
          {current && (
            <span className="on-board" aria-hidden="true">
              <Illustration name={current.id} className="art bare" />
              {/* cada corte abre uma fenda da cor da tábua */}
              {chopping && Array.from({ length: chops }, (_, i) => (
                <i key={i} className="slit" style={{ left: `${((i + 1) / (CHOPS + 1)) * 100}%` }} />
              ))}
            </span>
          )}
          {chopping && (
            <svg key={chops} className="knife" viewBox="0 0 120 40" aria-hidden="true">
              <path d="M2 24 Q34 2 80 8 L80 25 Z" fill="#e6ebef" stroke="#7b8791" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 21 Q40 8 76 11" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <rect x="78" y="7" width="40" height="15" rx="6" fill="#4a2a14" stroke="#2a1608" strokeWidth="1.5" />
            </svg>
          )}
          {chopping && (
            <span className="pips" aria-hidden="true">
              {Array.from({ length: CHOPS }, (_, i) => <i key={i} className={i < chops ? "on" : ""} />)}
            </span>
          )}
        </button>

        <fieldset className="cuts" disabled={!current || chopping}>
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
        <ul>
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
