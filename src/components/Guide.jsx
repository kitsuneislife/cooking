import { useEffect, useRef } from "react";
import { THREE } from "../three/kit";

// Guia em cima do alimento, como as setas e a mãozinha de Cooking Mama: mostra o gesto
// no lugar onde ele acontece. O minijogo descreve o guia com `ctx.guide({ kind, at, r, dir })`:
// `kind` e `at` podem ser funções (lidas a cada quadro; `null` esconde), `r` é o raio em
// unidades da cena e `dir` a direção do gesto no mundo (zigue-zague e risco).
// Tudo é escrito direto no DOM a cada quadro: nada de re-render do React no laço.
export const GUIDE_FOR = {
  tap: "tap", rapid: "rapid", rhythm: "rhythm", hold: "hold", timing: "timing",
  swipe: "swipe", zigzag: "zigzag", circle: "circle", plate: "drop",
};

const HAND = "M16 4c2.5 0 4 1.8 4 4.2V20l9.6 1.7c3.2.6 5.2 3.6 4.6 6.7L32 40c-.6 3.4-3.6 6-7 6H18c-2.4 0-4.6-1.2-5.9-3.2L5.4 32.6c-1.2-1.8-.7-4.2 1.1-5.4 1.6-1.1 3.8-.8 5.1.7l.4.5V8.2C12 5.8 13.5 4 16 4z";
const read = (x) => (typeof x === "function" ? x() : x);

export default function Guide({ world, guide, show, faded }) {
  const el = useRef(null);

  useEffect(() => {
    const right = new THREE.Vector3(), tip = new THREE.Vector3();
    let kind = null;
    return world.every(() => {
      const node = el.current, g = guide.current;
      if (!node) return;
      const k = g && show ? read(g.kind) : null, p = k ? read(g.at) : null;
      if (k !== kind) { kind = k; node.dataset.kind = k ?? ""; }
      if (!p) { node.style.visibility = "hidden"; return; }
      node.style.visibility = "";
      const c = world.toScreen(p);
      right.setFromMatrixColumn(world.camera.matrixWorld, 0);
      const e = world.toScreen(tip.copy(p).addScaledVector(right, g.r ?? 1));
      const rpx = Math.min(230, Math.max(46, Math.hypot(e.x - c.x, e.y - c.y)));
      let a = 0;
      const dir = read(g.dir);
      if (dir) { const d = world.toScreen(tip.copy(p).add(dir)); a = Math.atan2(d.y - c.y, d.x - c.x); }
      node.style.transform = `translate(${c.x}px, ${c.y}px)`;
      node.style.setProperty("--r", `${rpx}px`);
      node.style.setProperty("--a", `${a}rad`);
    });
  }, [world, guide, show]);

  return (
    <div ref={el} className="guide" data-kind="" data-faded={faded || undefined} aria-hidden="true">
      <svg className="guide-ring" viewBox="-100 -100 200 200">
        <circle r="84" className="guide-ring-line" />
        <path className="guide-head" d="M84 34 L110 -2 L58 -2 Z" />
        <path className="guide-head" d="M-84 -34 L-110 2 L-58 2 Z" />
      </svg>
      <div className="guide-axis">
        <span className="guide-track" />
        <svg className="guide-arrow guide-arrow-a" viewBox="0 0 60 60"><path d="M6 14 L40 14 L40 2 L58 30 L40 58 L40 46 L6 46 Z" /></svg>
        <svg className="guide-arrow guide-arrow-b" viewBox="0 0 60 60"><path d="M6 14 L40 14 L40 2 L58 30 L40 58 L40 46 L6 46 Z" /></svg>
        <span className="guide-chev" /><span className="guide-chev" /><span className="guide-chev" />
      </div>
      <span className="guide-pulse" /><span className="guide-pulse" />
      <span className="guide-fill" />
      <svg className="guide-hand" viewBox="0 0 40 48"><path d={HAND} /></svg>
    </div>
  );
}
