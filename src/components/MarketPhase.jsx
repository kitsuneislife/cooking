import { useState } from "react";
import Illustration from "./Illustration";
import DragGhost from "./DragGhost";
import { usePickDrop } from "../hooks/usePickDrop";
import { shuffle } from "../game/rules";
import { fly, itemEl, zoneEl } from "../game/fx";

// Fase 1: mandar para a cesta só os ingredientes da receita.
export default function MarketPhase({ game, good, bad, onDone }) {
  const [items] = useState(() =>
    shuffle([
      ...game.ingredients.map((i) => ({ ...i, belongs: true })),
      ...game.intruders.map((i) => ({ ...i, belongs: false })),
    ]),
  );
  const [basket, setBasket] = useState([]);
  const [shake, setShake] = useState(null);
  const total = game.ingredients.length;

  const { drag, itemProps, zoneProps } = usePickDrop({
    tapZone: "basket",
    onDrop: (id, zone, point) => {
      const item = items.find((i) => i.id === id);
      const card = itemEl(id);
      if (!item.belongs) {
        setShake(id);
        setTimeout(() => setShake(null), 600);
        bad(`${item.name} não está na lista de compras!`, card);
        return;
      }
      fly(point ?? card, zoneEl("basket"), card.querySelector("svg"));
      const next = [...basket, id];
      setBasket(next);
      good(zoneEl("basket"), next.length === total ? "Compras feitas!" : `${item.name} na cesta! ${next.length} de ${total}.`);
      if (next.length === total) setTimeout(onDone, 1300);
    },
  });

  return (
    <section className="phase market" aria-labelledby="phase-title">
      <h2 id="phase-title" tabIndex={-1} className="visually-hidden">Fase 1: Mercado</h2>

      <div className="stall">
        <div className="awning" aria-hidden="true" />
        <ul className="shelf" aria-label="Banca do mercado">
          {items.map((item, n) => basket.includes(item.id) ? (
            // a vaga fica vazia para os outros itens não mudarem de lugar
            <li key={item.id} className="empty-slot" aria-hidden="true" />
          ) : (
            <li key={item.id}>
              <button
                type="button"
                className={`crate${shake === item.id ? " shake" : ""}`}
                style={{ "--d": `${(-n * 0.37).toFixed(2)}s` }}
                {...itemProps(item.id)}
              >
                <Illustration name={item.id} className="art bare" />
                <span className="crate-name">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="market-side">
        <section className="ticket" aria-labelledby="list-title">
          <h3 id="list-title">Lista de compras</h3>
          <ul className="checklist">
            {game.ingredients.map((i) => (
              <li key={i.id} className={basket.includes(i.id) ? "got" : ""} lang="en">
                {i.api}
                {basket.includes(i.id) && <span className="visually-hidden" lang="pt-BR"> (na cesta)</span>}
              </li>
            ))}
          </ul>
        </section>

        <div className="basket" aria-label={`Cesta, ${basket.length} de ${total} ingredientes`} role="img" {...zoneProps("basket")} onClick={undefined}>
          <span className="basket-items" aria-hidden="true">
            {basket.map((id) => <Illustration key={id} name={id} className="art bare mini" />)}
          </span>
          <Illustration name="basket" className="art" />
          <span className="badge" key={basket.length}>{basket.length}/{total}</span>
        </div>
      </aside>

      {drag && <DragGhost drag={drag}><Illustration name={drag.id} className="art bare" /></DragGhost>}
    </section>
  );
}
