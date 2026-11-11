import { useEffect, useRef, useState } from "react";

// Pegar e soltar com mouse, toque ou teclado.
// - Arrastar: segura o item e solta em cima de um elemento com data-zone.
// - Teclado ou clique: Enter/Espaço pega o item, Enter/Espaço numa zona solta, Esc cancela.
// - `tapZone`: quando só existe um destino, um toque no item já manda para ele.
// onDrop(id, zone, point): `point` é onde o arrasto terminou; não vem no clique/teclado.
export function usePickDrop({ onDrop, onPick, tapZone }) {
  const [held, setHeld] = useState(null);
  const [drag, setDrag] = useState(null); // { id, x, y, over }
  const start = useRef(null);
  const moved = useRef(false);
  const handlers = useRef({ onDrop, onPick });
  handlers.current = { onDrop, onPick };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setHeld((current) => {
        if (current != null) handlers.current.onPick?.(null);
        return null;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const zoneAt = (x, y) => document.elementFromPoint(x, y)?.closest("[data-zone]")?.dataset.zone ?? null;

  function onPointerDown(id, e) {
    if (e.button !== 0) return;
    start.current = { id, x: e.clientX, y: e.clientY };
    moved.current = false;

    const move = (ev) => {
      if (!moved.current && Math.hypot(ev.clientX - start.current.x, ev.clientY - start.current.y) < 6) return;
      moved.current = true;
      setDrag({ id, x: ev.clientX, y: ev.clientY, over: zoneAt(ev.clientX, ev.clientY) });
    };
    const stop = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      if (!moved.current) return;
      // o navegador dispara o clique logo após o pointerup; depois disso, cliques voltam a valer
      setTimeout(() => { moved.current = false; }, 0);
      setDrag(null);
      setHeld(null);
      const zone = ev.type === "pointerup" ? zoneAt(ev.clientX, ev.clientY) : null;
      if (zone) handlers.current.onDrop(id, zone, { x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  const itemProps = (id) => ({
    onPointerDown: (e) => onPointerDown(id, e),
    onClick: () => {
      // o clique que vem logo depois de um arrasto não conta
      if (moved.current) return;
      if (tapZone) return handlers.current.onDrop(id, tapZone);
      const next = held === id ? null : id;
      setHeld(next);
      handlers.current.onPick?.(next);
    },
    "aria-pressed": tapZone ? undefined : held === id,
    "data-item": id,
    "data-dragging": drag?.id === id || undefined,
  });

  const zoneProps = (zone) => ({
    "data-zone": zone,
    "data-over": drag?.over === zone || undefined,
    "data-ready": (held != null && !drag) || undefined,
    onClick: () => {
      if (moved.current) return;
      if (held == null) return handlers.current.onPick?.(undefined);
      const id = held;
      setHeld(null);
      handlers.current.onDrop(id, zone);
    },
  });

  return { held, drag, itemProps, zoneProps };
}
