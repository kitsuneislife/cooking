import { useEffect, useRef } from "react";
import { createWorld } from "../three/world";

// Palco 3D atrás da interface: monta a cozinha uma vez por partida e avisa quando ficou pronta.
export default function Stage3D({ onReady, onError }) {
  const host = useRef(null);
  const handlers = useRef({ onReady, onError });
  handlers.current = { onReady, onError };

  useEffect(() => {
    let alive = true, world = null;
    createWorld(host.current).then((w) => {
      // no StrictMode o efeito monta, desmonta e monta de novo: o primeiro mundo é descartado
      if (!alive) return w.dispose();
      world = w;
      handlers.current.onReady(w);
    }, (err) => { if (alive) handlers.current.onError(err); });
    return () => { alive = false; world?.dispose(); };
  }, []);

  return <div className="stage3d" ref={host} aria-hidden="true" />;
}
