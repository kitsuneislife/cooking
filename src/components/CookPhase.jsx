import { useState } from "react";
import Illustration from "./Illustration";
import DragGhost from "./DragGhost";
import ActionControl from "./ActionControl";
import { usePickDrop } from "../hooks/usePickDrop";
import { STATIONS } from "../data/games";
import { sfx } from "../game/sound";
import { fly, itemEl, zoneEl } from "../game/fx";

// Fase 3: a cada passo, levar o que a receita pede para a estação certa e fazer a ação.
export default function CookPhase({ game, recipe, good, bad, say, onDone }) {
  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState([]);
  const [armed, setArmed] = useState(false); // a ação da estação está valendo
  const [finished, setFinished] = useState(false);
  const [tray, setTray] = useState(() => game.ingredients.map((i) => i.id));
  const [contents, setContents] = useState({}); // estação -> o que está dentro
  const step = game.steps[index];
  const total = game.steps.length;
  const missing = step.add.filter((id) => !added.includes(id));
  const busy = armed || finished;
  const nameOf = (id) => game.ingredients.find((i) => i.id === id)?.name ?? game.products[id];

  function complete() {
    const last = index === total - 1;
    good(zoneEl(step.station), last ? "Prato montado!" : step.makes ? `${game.products[step.makes]} pronto! Foi para a bandeja.` : `Passo ${index + 1} pronto!`);
    if (step.makes) {
      setContents((c) => ({ ...c, [step.station]: [] }));
      setTray((t) => [...t, step.makes]);
    }
    setArmed(false);
    setAdded([]);
    if (!last) return setIndex(index + 1);
    setFinished(true);
    setTimeout(onDone, 1400);
  }

  const { held, drag, itemProps, zoneProps } = usePickDrop({
    onPick: (id) => { if (id != null) sfx.pick(); },
    onDrop: (id, station, point) => {
      if (busy) return say("Termine a ação primeiro.");
      const zone = zoneEl(station);
      if (!missing.includes(id)) return bad(`${nameOf(id)} não entra neste passo.`, zone);
      if (station !== step.station) return bad(`Este passo não é na estação ${station}.`, zone);
      fly(point ?? itemEl(id), zone, itemEl(id).querySelector("svg"));
      setTray((t) => t.filter((x) => x !== id));
      setAdded([...added, id]);
      setContents((c) => ({ ...c, [station]: [...(c[station] ?? []), id] }));
      if (missing.length > 1) return good(zone, `${nameOf(id)} entrou!`);
      if (!step.action) return complete();
      setArmed(true);
      good(zone, `Tudo dentro. Agora: ${step.action.label.toLowerCase()}!`);
    },
  });

  // toque na estação sem nada na mão: só vale em passo que não leva ingrediente
  function tapStation(station) {
    if (busy) return;
    if (missing.length) return say("Pegue um ingrediente na bandeja primeiro.");
    if (station !== step.station) return bad(`Este passo não é na estação ${station}.`, zoneEl(station));
    sfx.pick();
    setArmed(true);
    say(`${step.action.label}!`);
  }

  return (
    <section className="phase cook" aria-labelledby="phase-title">
      <h2 id="phase-title" tabIndex={-1} className="visually-hidden">Fase 3: Fogão</h2>

      <section className="ticket step-ticket" aria-labelledby="step-title">
        <p className="step-num" aria-label={`Passo ${index + 1} de ${total}`}>{index + 1}<small>/{total}</small></p>
        <div>
          <h3 id="step-title">{step.text}</h3>
          <p className="step-api" lang="en">{recipe.instructions[index]}</p>
        </div>
        <p className="step-need">
          {finished ? "Pronto!" : armed ? step.action.label : missing.length ? `Faltam ${missing.length}` : "Toque na estação"}
        </p>
      </section>

      <ul className="stations" aria-label="Estações da cozinha">
        {Object.entries(STATIONS).map(([station, art]) => {
          const inside = contents[station] ?? [];
          const active = armed && station === step.station;
          const zone = zoneProps(station);
          return (
            <li key={station} className="station" data-filled={inside.length > 0 || undefined} data-armed={active || undefined}>
              <button
                type="button"
                className="station-zone"
                aria-label={inside.length ? `${station}, com ${inside.map(nameOf).join(", ")}` : station}
                {...zone}
                onClick={() => (held == null ? tapStation(station) : zone.onClick())}
              >
                <Illustration name={art} className="art" />
                <span className="station-items" aria-hidden="true">
                  {inside.map((id) => <Illustration key={id} name={id} className="art bare mini" />)}
                </span>
                <span className="station-name">{station}</span>
              </button>
              {active && (
                <ActionControl key={index} action={step.action} onDone={complete} onFail={(text) => bad(text, zoneEl(station))} />
              )}
            </li>
          );
        })}
      </ul>

      <section className="tray" aria-labelledby="tray-title">
        <h3 id="tray-title" className="visually-hidden">Bandeja de ingredientes</h3>
        <ul>
          {tray.map((id) => (
            <li key={id}>
              <button type="button" className="crate" {...itemProps(id)}>
                <Illustration name={id} className="art bare" />
                <span className="crate-name">{nameOf(id)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {drag && <DragGhost drag={drag}><Illustration name={drag.id} className="art bare" /></DragGhost>}
    </section>
  );
}
