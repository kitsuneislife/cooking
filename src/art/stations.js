// Estações da cozinha e a cesta do mercado.
import { el, rand, setSeed, grad, vertical, horizontal, clip, shine, finish, stage, bowl } from "./svg.js";

/* ---------- Tábua ---------- */
export function board(svg) {
  const g = stage(svg);
  setSeed(3);
  const top = "M 26 84 Q 24 72 36 69 L 152 46 Q 166 43 170 55 L 178 98 Q 180 110 168 112 L 50 132 Q 38 134 34 122 Z";
  el(g, "path", { d: top, transform: "translate(0 7)", fill: "#7a4a22" });
  el(g, "path", { d: top, fill: grad(svg, "linear", [[0, "#ebbd7e"], [0.5, "#d39b5a"], [1, "#ad7334"]], { x1: 0, y1: 0, x2: 1, y2: 1 }) });
  const wood = el(g, "g", { "clip-path": clip(svg, "path", { d: top }) });
  for (let i = 0; i < 16; i++) {
    const y0 = 70 + i * 5.5;
    let d = `M 20 ${y0}`;
    for (let x = 36; x <= 188; x += 16) d += ` L ${x} ${(y0 - (x - 20) * 0.2 + (rand() - 0.5) * 2.6).toFixed(1)}`;
    el(wood, "path", { d, stroke: "#94602c", "stroke-width": 0.6 + rand() * 0.8, fill: "none", opacity: 0.35 });
  }
  el(g, "ellipse", { cx: 160, cy: 64, rx: 6, ry: 3.6, transform: "rotate(-12 160 64)", fill: "#6a3c18" });
  el(g, "path", { d: top, fill: "none", stroke: "#8a5626", "stroke-width": 1, opacity: 0.6 });
  shine(g, "M 34 80 L 150 54", 2.4, 0.5);
  // faca
  const knife = el(g, "g", { class: "board-knife", transform: "translate(76 106) rotate(-12)" });
  el(knife, "path", { d: "M 0 -1 L 62 -3 Q 74 -2 78 5 L 0 9 Z", fill: vertical(svg, [[0, "#ffffff"], [0.5, "#c6cdd5"], [1, "#8a949e"]]), stroke: "#6b747d", "stroke-width": 0.7 });
  el(knife, "rect", { x: -36, y: -1.5, width: 38, height: 11, rx: 4, fill: vertical(svg, [[0, "#5a3a24"], [1, "#24140a"]]) });
  for (const x of [-26, -14]) el(knife, "circle", { cx: x, cy: 4, r: 1.4, fill: "#d8dde2" });
  shine(knife, "M 4 1 L 60 -1", 1.2, 0.8);
  finish(g);
}

/* ---------- Tigela (com molho e batedor) ---------- */
export function mixingBowl(svg) {
  const g = stage(svg);
  bowl(svg, g, { rimY: 66, rx: 70, depth: 58, outer: ["#f3fbff", "#bcd9e8", "#5f8aa6"], inner: ["#dceaf2", "#9fbccd"] }, (inner) => {
    // o jogo esconde o molho (.bowl-sauce) enquanto a tigela está vazia
    const sauce = el(inner, "g", { class: "bowl-sauce" });
    el(sauce, "ellipse", { cx: 100, cy: 70, rx: 60, ry: 12, fill: grad(svg, "radial", [[0, "#b06a32"], [0.7, "#7a3e16"], [1, "#4f240a"]], { cx: 0.4, cy: 0.35, r: 0.7 }) });
    shine(sauce, "M 64 66 Q 84 61 104 62", 2, 0.5);
    // batedor
    for (const dx of [-7, 0, 7]) el(inner, "path", { d: `M 128 30 Q ${120 + dx} 50 ${112 + dx} 70`, stroke: "#c8ced4", "stroke-width": 1.3, fill: "none" });
    el(inner, "path", { d: "M 128 30 L 150 6", stroke: "#3a2416", "stroke-width": 6, "stroke-linecap": "round" });
    shine(inner, "M 131 25 L 146 9", 1.4, 0.6);
  });
  finish(g);
}

/* ---------- Fogão (boca acesa e wok) ---------- */
export function stove(svg) {
  const g = stage(svg);
  setSeed(13);
  el(g, "path", { d: "M 22 104 L 44 80 L 156 80 L 178 104 Z", fill: vertical(svg, [[0, "#6a7078"], [1, "#3a3f46"]]) });
  el(g, "rect", { x: 22, y: 104, width: 156, height: 30, rx: 3, fill: vertical(svg, [[0, "#e4e8ec"], [0.5, "#c3c9cf"], [1, "#8c949c"]]) });
  for (const x of [46, 74, 126, 154]) {
    el(g, "circle", { cx: x, cy: 119, r: 7, fill: grad(svg, "radial", [[0, "#fafafa"], [1, "#6a7078"]], { cx: 0.35, cy: 0.3, r: 0.8 }), stroke: "#4a5058", "stroke-width": 0.8 });
    el(g, "line", { x1: x, y1: 113, x2: x, y2: 117, stroke: "#30353b", "stroke-width": 1.6, "stroke-linecap": "round" });
  }
  el(g, "ellipse", { cx: 100, cy: 92, rx: 34, ry: 8, fill: "none", stroke: "#1f2328", "stroke-width": 3 });
  // chamas azuis com ponta amarela
  for (let i = 0; i < 11; i++) {
    const a = Math.PI * (i / 10);
    const x = 100 - Math.cos(a) * 30, y = 92 + Math.sin(a) * 6;
    const h = 9 + rand() * 6;
    el(g, "path", {
      class: "flame",
      d: `M ${x - 3} ${y} Q ${x - 3} ${y - h * 0.6} ${x} ${y - h} Q ${x + 3} ${y - h * 0.6} ${x + 3} ${y} Z`,
      fill: vertical(svg, [[0, "#ffd34a"], [0.45, "#4aa6ff"], [1, "#1d4fd8"]]), opacity: 0.9,
      style: `animation-delay: ${(-rand()).toFixed(2)}s`,
    });
  }
  // wok com carne e brócolis
  el(g, "path", { d: "M 148 52 L 192 36", stroke: "#2a2e33", "stroke-width": 5, "stroke-linecap": "round" });
  el(g, "path", { d: "M 160 48 L 192 36", stroke: "#6b3d1c", "stroke-width": 7, "stroke-linecap": "round" });
  shine(g, "M 166 45 L 188 37", 1.4, 0.5);
  el(g, "ellipse", { cx: 100, cy: 52, rx: 52, ry: 11, fill: vertical(svg, [[0, "#1a1d21"], [1, "#3c4148"]]) });
  // o jogo esconde a comida (.wok-food) enquanto o wok está vazio
  const food = el(g, "g", { class: "wok-food", "clip-path": clip(svg, "ellipse", { cx: 100, cy: 53, rx: 46, ry: 8 }) });
  for (let i = 0; i < 26; i++) {
    const x = 60 + rand() * 80, y = 47 + rand() * 12;
    if (rand() < 0.5) {
      el(food, "circle", { cx: x, cy: y, r: 2.6 + rand() * 1.5, fill: rand() < 0.5 ? "#4f973a" : "#79b84e", stroke: "#2c5e26", "stroke-width": 0.5 });
    } else {
      el(food, "rect", { x, y, width: 8 + rand() * 4, height: 3, rx: 1.4, transform: `rotate(${rand() * 60 - 30} ${x} ${y})`, fill: "#7a3a1e", stroke: "#4a1e0c", "stroke-width": 0.5 });
    }
  }
  el(g, "path", { d: "M 48 52 C 52 70 74 80 100 80 C 126 80 148 70 152 52 A 52 11 0 0 1 48 52 Z", fill: grad(svg, "linear", [[0, "#6a7078"], [0.35, "#30353b"], [1, "#0e1013"]], { x1: 0, y1: 0, x2: 1, y2: 0.4 }) });
  el(g, "path", { d: "M 152 52 A 52 11 0 0 1 48 52", fill: "none", stroke: "#8a9098", "stroke-width": 1.6 });
  shine(g, "M 58 62 Q 66 72 84 77", 2, 0.35);
  // vapor
  for (const [x, d] of [[84, 0], [102, -1.2], [120, -2.2]]) {
    el(g, "path", { class: "steam", d: `M ${x} 40 q -6 -8 0 -16 q 6 -8 0 -16`, stroke: "#fff", "stroke-width": 2.6, fill: "none", "stroke-linecap": "round", opacity: 0.7, style: `animation-delay: ${d}s` });
  }
  finish(g);
}

/* ---------- Forno ---------- */
export function oven(svg) {
  const g = stage(svg);
  el(g, "rect", { x: 34, y: 18, width: 132, height: 116, rx: 10, fill: horizontal(svg, [[0, "#c9ced4"], [0.35, "#f1f3f5"], [1, "#9aa1a9"]]), stroke: "#7a828a", "stroke-width": 1 });
  el(g, "path", { d: "M 34 42 L 34 28 Q 34 18 44 18 L 156 18 Q 166 18 166 28 L 166 42 Z", fill: vertical(svg, [[0, "#6a7078"], [1, "#454b52"]]) });
  for (const x of [52, 70, 88]) {
    el(g, "circle", { cx: x, cy: 30, r: 6, fill: grad(svg, "radial", [[0, "#ffffff"], [1, "#8a929a"]], { cx: 0.35, cy: 0.3, r: 0.8 }) });
    el(g, "line", { x1: x, y1: 25, x2: x, y2: 29, stroke: "#30353b", "stroke-width": 1.4, "stroke-linecap": "round" });
  }
  el(g, "rect", { x: 118, y: 24, width: 38, height: 12, rx: 3, fill: "#16221a" });
  el(g, "text", { x: 137, y: 33.5, "text-anchor": "middle", "font-family": "Fredoka, sans-serif", "font-size": 9, fill: "#7dff9a" }).textContent = "180°";
  el(g, "rect", { x: 54, y: 50, width: 92, height: 6, rx: 3, fill: vertical(svg, [[0, "#ffffff"], [1, "#8a929a"]]) });
  const win = { x: 52, y: 64, width: 96, height: 56, rx: 7 };
  el(g, "rect", { ...win, fill: grad(svg, "radial", [[0, "#ffd884"], [0.55, "#e57a20"], [1, "#4a1c06"]], { cx: 0.5, cy: 0.55, r: 0.65 }), stroke: "#30353b", "stroke-width": 3 });
  const inside = el(g, "g", { "clip-path": clip(svg, "rect", win) });
  el(inside, "path", { d: "M 52 70 L 60 74 L 68 70 L 76 74 L 84 70 L 92 74 L 100 70 L 108 74 L 116 70 L 124 74 L 132 70 L 140 74 L 148 70", stroke: "#ff5a2a", "stroke-width": 1.6, fill: "none", class: "glow" });
  for (const y of [96, 108]) el(inside, "line", { x1: 52, y1: y, x2: 148, y2: y, stroke: "#2a1206", "stroke-width": 1.2, opacity: 0.6 });
  el(inside, "path", { d: "M 60 64 L 82 64 L 52 112 L 52 84 Z", fill: "#fff", opacity: 0.16 });
  shine(g, "M 40 46 L 40 126", 2.4, 0.45);
  finish(g);
}

/* ---------- Servir (prato com cúpula) ---------- */
export function serve(svg) {
  const g = stage(svg);
  el(g, "ellipse", { cx: 100, cy: 120, rx: 80, ry: 16, fill: "url(#plateRim)" });
  el(g, "ellipse", { cx: 100, cy: 120, rx: 79, ry: 15, fill: "none", stroke: "#fff", "stroke-width": 1.5 });
  const dome = "M 36 118 C 36 70 66 44 100 44 C 134 44 164 70 164 118 Z";
  el(g, "path", { d: dome, fill: grad(svg, "radial", [[0, "#ffffff"], [0.45, "#d9dee3"], [1, "#7e8790"]], { cx: 0.35, cy: 0.25, r: 0.85 }), stroke: "#6e767e", "stroke-width": 1 });
  el(g, "ellipse", { cx: 100, cy: 118, rx: 64, ry: 6, fill: vertical(svg, [[0, "#b6bdc4"], [1, "#6e767e"]]) });
  el(g, "rect", { x: 96, y: 34, width: 8, height: 12, rx: 2, fill: "#9aa1a9" });
  el(g, "ellipse", { cx: 100, cy: 33, rx: 12, ry: 5, fill: vertical(svg, [[0, "#ffffff"], [1, "#8a929a"]]), stroke: "#6e767e", "stroke-width": 0.8 });
  shine(g, "M 52 100 Q 52 70 78 56", 4, 0.75);
  shine(g, "M 90 52 Q 98 50 106 51", 2, 0.6);
  for (const [x, y, s] of [[150, 46, 1], [168, 70, 0.7], [36, 54, 0.8]]) {
    el(g, "path", { class: "sparkle", d: `M ${x} ${y - 7 * s} L ${x + 2 * s} ${y - 2 * s} L ${x + 7 * s} ${y} L ${x + 2 * s} ${y + 2 * s} L ${x} ${y + 7 * s} L ${x - 2 * s} ${y + 2 * s} L ${x - 7 * s} ${y} L ${x - 2 * s} ${y - 2 * s} Z`, fill: "#fff6c8" });
  }
  finish(g);
}

/* ---------- Cesta do mercado ---------- */
export function basket(svg) {
  const g = stage(svg);
  setSeed(9);
  el(g, "path", { d: "M 44 70 C 44 10 156 10 156 70", stroke: "#7a4a1e", "stroke-width": 9, fill: "none", "stroke-linecap": "round" });
  el(g, "path", { d: "M 44 70 C 44 10 156 10 156 70", stroke: "#d9a462", "stroke-width": 3.5, fill: "none", "stroke-linecap": "round", opacity: 0.8 });
  el(g, "ellipse", { cx: 100, cy: 70, rx: 66, ry: 14, fill: "#4e2f12" });
  const body = "M 34 70 L 50 128 Q 52 134 60 134 L 140 134 Q 148 134 150 128 L 166 70 A 66 14 0 0 1 34 70 Z";
  el(g, "path", { d: body, fill: "#c98b45" });
  const weave = el(g, "g", { "clip-path": clip(svg, "path", { d: body }) });
  for (let row = 0; row < 8; row++) {
    for (let k = -1; k < 14; k++) {
      const x = 28 + k * 12 + (row % 2) * 6, y = 74 + row * 8;
      el(weave, "rect", { x, y, width: 11, height: 6.4, rx: 3, fill: "#e8b878", stroke: "#8a5426", "stroke-width": 0.8, opacity: 0.75 + rand() * 0.25 });
    }
  }
  el(weave, "path", { d: body, fill: grad(svg, "linear", [[0, "#fff", 0.2], [0.45, "#fff", 0], [1, "#3a1e06", 0.45]], { x1: 0, y1: 0, x2: 1, y2: 0.3 }) });
  el(g, "path", { d: "M 166 70 A 66 14 0 0 1 34 70", stroke: "#9a6028", "stroke-width": 7, fill: "none" });
  el(g, "path", { d: "M 166 70 A 66 14 0 0 1 34 70", stroke: "#e9b678", "stroke-width": 2.4, fill: "none" });
  finish(g);
}
