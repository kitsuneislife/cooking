// Produtos: o que sai pronto de um passo e volta para a bandeja (campo `makes` em data/games.js).
import { el, rand, setSeed, grad, vertical, shine, finish, plate, bowl } from "./svg.js";

const meat = (svg) => vertical(svg, [[0, "#b06a3c"], [0.5, "#7a3a1e"], [1, "#4a1e0c"]]);
const green = (svg) => grad(svg, "radial", [[0, "#a8dc7a"], [0.6, "#4f973a"], [1, "#22592a"]], { cx: 0.38, cy: 0.32, r: 0.75 });

// Tira de carne dourada, com marcas de chapa.
function strip(g, fill, x, y, rot, length = 40) {
  const s = el(g, "g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})` });
  el(s, "rect", { x: -length / 2, y: -6, width: length, height: 12, rx: 5, fill, stroke: "#3a1608", "stroke-width": 0.8, "stroke-opacity": 0.6 });
  for (const dx of [-length / 4, 0, length / 4]) el(s, "line", { x1: dx - 2, y1: -5, x2: dx + 2, y2: 5, stroke: "#2a0e04", "stroke-width": 1.6, opacity: 0.5 });
  shine(s, `M ${-length / 2 + 5} -3 L ${length / 4} -3`, 1.4, 0.4);
}

/* ---------- Molho (tigelinha) ---------- */
export function sauce(svg) {
  const g = plate(svg);
  bowl(svg, g, { rimY: 102, rx: 46, depth: 38, outer: ["#ffffff", "#e8edf2", "#9aa9b8"], inner: ["#e4ecf3", "#b7c7d6"] }, (inner) => {
    el(inner, "ellipse", { cx: 100, cy: 105, rx: 40, ry: 7.5, fill: grad(svg, "radial", [[0, "#b06a32"], [0.7, "#7a3e16"], [1, "#4f240a"]], { cx: 0.4, cy: 0.35, r: 0.7 }) });
    shine(inner, "M 74 103 Q 90 99 106 100", 2, 0.5);
    el(inner, "path", { d: "M 118 104 L 156 62", stroke: "#8a5a2a", "stroke-width": 6, "stroke-linecap": "round" });
    el(inner, "path", { d: "M 118 104 L 156 62", stroke: "#d9a462", "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0.8 });
  });
  finish(g);
}

/* ---------- Carne selada ---------- */
export function seared(svg) {
  const g = plate(svg);
  setSeed(27);
  const fill = meat(svg);
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3), col = i % 3;
    strip(g, fill, 66 + col * 32 + rand() * 8, 106 + row * 13 - (col === 1 ? 7 : 0), rand() * 50 - 25);
  }
  finish(g);
}

/* ---------- Refogado (carne, brócolis e molho) ---------- */
export function stirfry(svg) {
  const g = plate(svg);
  setSeed(39);
  el(g, "ellipse", { cx: 100, cy: 134, rx: 58, ry: 13, fill: "#6a3410", opacity: 0.85 });
  const meatFill = meat(svg), greenFill = green(svg);
  // monte: quanto mais ao centro, mais alto; desenha de trás para a frente
  const bits = [];
  for (let i = 0; i < 24; i++) {
    const angle = rand() * Math.PI * 2, far = Math.sqrt(rand());
    bits.push({ x: 100 + Math.cos(angle) * far * 44, y: 122 - (1 - far) * 30 + Math.sin(angle) * far * 9, floret: i % 2 });
  }
  bits.sort((a, b) => a.y - b.y);
  for (const { x, y, floret } of bits) {
    if (!floret) { strip(g, meatFill, x, y, rand() * 70 - 35, 30); continue; }
    el(g, "rect", { x: x - 3, y, width: 6, height: 11, rx: 2, fill: "#b7d98a", stroke: "#5f8a3a", "stroke-width": 0.6 });
    for (const [dx, dy, r] of [[-6, -2, 6.5], [6, -2, 6.5], [0, -7, 8]]) {
      el(g, "circle", { cx: x + dx, cy: y + dy, r, fill: greenFill, stroke: "#1f4f22", "stroke-width": 0.7, "stroke-opacity": 0.5 });
    }
  }
  shine(g, "M 70 104 Q 92 88 118 96", 2.6, 0.45);
  finish(g);
}
