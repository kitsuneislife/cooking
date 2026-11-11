// Ingredientes. Luz do alto à esquerda; contorno num tom escuro da própria cor.
import { el, pol, f, rand, setSeed, grad, vertical, horizontal, clip, shine, finish, plate, bowl } from "./svg.js";

/* ---------- Contrafilé ---------- */
export function beef(svg) {
  const g = plate(svg);
  setSeed(21);
  const top = "M 44 104 C 40 86 58 74 86 74 C 104 74 118 68 138 68 C 160 68 172 86 166 106 C 160 124 138 134 106 134 C 74 134 48 124 44 104 Z";
  // espessura do bife
  el(g, "path", { d: top, transform: "translate(0 9)", fill: horizontal(svg, [[0, "#7a1626"], [0.8, "#8e1e2e"], [0.84, "#e6cfb2"], [1, "#c9ab88"]]) });
  el(g, "path", { d: top, fill: grad(svg, "radial", [[0, "#e8606a"], [0.55, "#bf2f3c"], [1, "#7e1626"]], { cx: 0.36, cy: 0.3, r: 0.85 }) });
  const c = el(g, "g", { "clip-path": clip(svg, "path", { d: top }) });
  // marmoreio: pontinhos e veios suaves de gordura, desfocados
  const fat = el(c, "g", { filter: "url(#blur1)" });
  for (let i = 0; i < 90; i++) {
    const x = 50 + rand() * 104, y = 78 + rand() * 54;
    el(fat, "ellipse", { cx: x, cy: y, rx: 1 + rand() * 3.2, ry: 0.7 + rand() * 1.2, transform: `rotate(${(rand() * 60 - 30).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`, fill: "#ffdcd4", opacity: 0.25 + rand() * 0.35 });
  }
  for (let i = 0; i < 6; i++) {
    const x = 60 + rand() * 80, y = 88 + rand() * 34;
    el(fat, "path", { d: `M ${x} ${y} q ${8 + rand() * 8} ${rand() * 8 - 4} ${16 + rand() * 10} ${rand() * 10 - 5}`, stroke: "#ffe2da", "stroke-width": 2.4, fill: "none", opacity: 0.35, "stroke-linecap": "round" });
  }
  // capa de gordura: faixa creme na borda de trás e da direita
  el(c, "path", { d: "M 100 72 C 126 68 150 68 160 80 C 170 94 168 112 158 124", stroke: "#f9eedb", "stroke-width": 18, fill: "none", "stroke-linecap": "round" });
  el(c, "path", { d: "M 100 81 C 124 77 145 77 153 86 C 160 96 159 110 151 120", stroke: "#e2a596", "stroke-width": 2.2, fill: "none", opacity: 0.9 });
  el(c, "path", { d: top, fill: grad(svg, "linear", [[0.45, "#4a0a12", 0], [1, "#4a0a12", 0.38]], { x1: 0, y1: 0, x2: 0.6, y2: 1 }) });
  el(g, "path", { d: top, fill: "none", stroke: "#6e1420", "stroke-width": 1.2, opacity: 0.6 });
  shine(g, "M 60 94 Q 78 84 100 84", 3, 0.5);
  shine(g, "M 120 70 Q 140 68 154 76", 2, 0.7);
  finish(g);
}

/* ---------- Brócolis ---------- */
export function broccoli(svg) {
  const g = plate(svg);
  setSeed(33);
  for (const [x2, y2, w] of [[76, 90, 7], [124, 92, 7], [100, 80, 9]]) {
    el(g, "path", { d: `M 100 128 Q ${(100 + x2) / 2} ${(128 + y2) / 2 + 6} ${x2} ${y2}`, stroke: "#86b45a", "stroke-width": w, fill: "none", "stroke-linecap": "round" });
  }
  el(g, "path", {
    d: "M 88 142 C 92 128 92 116 88 104 L 112 104 C 108 116 108 128 112 142 C 104 146 96 146 88 142 Z",
    fill: horizontal(svg, [[0, "#a7cf7a"], [0.4, "#dcf0b8"], [1, "#78a64c"]]), stroke: "#5f8a3a", "stroke-width": 0.9, "stroke-opacity": 0.6,
  });
  el(g, "ellipse", { cx: 100, cy: 142.5, rx: 12, ry: 3, fill: "#eaf5cc", stroke: "#7aa84e", "stroke-width": 0.7 });
  // cabeça: lobos de trás (mais escuros) para a frente (mais claros)
  const lobes = [[104, 56, 24, 0], [80, 68, 24, 0], [128, 72, 22, 0], [64, 92, 18, 1], [138, 96, 17, 1], [92, 84, 26, 1], [118, 90, 22, 1]];
  for (const [cx, cy, r, front] of lobes) {
    el(g, "circle", {
      cx, cy, r, stroke: "#1f4f22", "stroke-width": 0.9, "stroke-opacity": 0.5,
      fill: grad(svg, "radial", [[0, front ? "#a8dc7a" : "#86bf5e"], [0.6, "#4f973a"], [1, "#22592a"]], { cx: 0.38, cy: 0.32, r: 0.75 }),
    });
    const bumps = el(g, "g", { "clip-path": clip(svg, "circle", { cx, cy, r }) });
    for (let i = 0; i < Math.round(r * 2); i++) {
      const a = rand() * Math.PI * 2, t = Math.sqrt(rand()) * r;
      const x = cx + Math.cos(a) * t, y = cy + Math.sin(a) * t;
      const lit = x - cx + (y - cy) < -r * 0.2;
      el(bumps, "circle", { cx: x, cy: y, r: 1.5 + rand() * 1.7, fill: lit ? "#c8ee92" : "#2a662b", opacity: lit ? 0.6 : 0.4 });
    }
    shine(g, `M ${cx - r * 0.62} ${cy - r * 0.15} Q ${cx - r * 0.55} ${cy - r * 0.68} ${cx - r * 0.05} ${cy - r * 0.8}`, 1.6, 0.4);
  }
  finish(g);
}

/* ---------- Gengibre ---------- */
export function ginger(svg) {
  const g = plate(svg);
  setSeed(45);
  const parts = [
    { cx: 96, cy: 118, rx: 44, ry: 18, rot: -8 },
    { cx: 68, cy: 94, rx: 12, ry: 24, rot: -22 },
    { cx: 112, cy: 92, rx: 11, ry: 22, rot: 14 },
    { cx: 140, cy: 112, rx: 18, ry: 14, rot: 0 },
    { cx: 52, cy: 124, rx: 16, ry: 12, rot: 0 },
    { cx: 90, cy: 84, rx: 9, ry: 14, rot: -4 },
  ];
  const shape = (p) => ({ cx: p.cx, cy: p.cy, rx: p.rx, ry: p.ry, transform: `rotate(${p.rot} ${p.cx} ${p.cy})` });
  // contorno de todas as partes primeiro, depois o preenchimento por cima: vira uma forma só
  for (const p of parts) el(g, "ellipse", { ...shape(p), fill: "none", stroke: "#8a5a2c", "stroke-width": 2.4, opacity: 0.7 });
  for (const p of parts) {
    el(g, "ellipse", { ...shape(p), fill: grad(svg, "radial", [[0, "#f5dcaa"], [0.55, "#d9a868"], [1, "#a0703c"]], { cx: 0.38, cy: 0.32, r: 0.8 }) });
  }
  // anéis da casca
  for (const p of parts) {
    const ring = el(g, "g", { transform: `rotate(${p.rot} ${p.cx} ${p.cy})` });
    const long = p.rx > p.ry;
    const n = Math.max(2, Math.round((long ? p.rx : p.ry) / 7));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n * 2 - 1 + (rand() - 0.5) * 0.15;
      const w = (long ? p.ry : p.rx) * Math.sqrt(1 - t * t) * 0.85;
      const d = long
        ? `M ${p.cx + t * p.rx} ${p.cy - w} Q ${p.cx + t * p.rx + 3} ${p.cy} ${p.cx + t * p.rx} ${p.cy + w}`
        : `M ${p.cx - w} ${p.cy + t * p.ry} Q ${p.cx} ${p.cy + t * p.ry + 3} ${p.cx + w} ${p.cy + t * p.ry}`;
      el(ring, "path", { d, stroke: "#94632f", "stroke-width": 0.8, fill: "none", opacity: 0.55 });
    }
  }
  // pontas cortadas mostrando a polpa amarela
  for (const [x, y, rot] of [[59, 72, -22], [117, 71, 14]]) {
    el(g, "ellipse", { cx: x, cy: y, rx: 8, ry: 4, transform: `rotate(${rot} ${x} ${y})`, fill: "#f8e39a", stroke: "#c4974a", "stroke-width": 0.9 });
    el(g, "ellipse", { cx: x - 1, cy: y - 0.6, rx: 3.5, ry: 1.6, transform: `rotate(${rot} ${x} ${y})`, fill: "#fff6cf", opacity: 0.8 });
  }
  el(g, "ellipse", { ...shape(parts[0]), fill: grad(svg, "linear", [[0.5, "#5a3210", 0], [1, "#5a3210", 0.3]], { x1: 0, y1: 0, x2: 0.4, y2: 1 }) });
  shine(g, "M 64 110 Q 86 102 112 104", 2.4, 0.5);
  shine(g, "M 62 84 Q 62 96 66 104", 1.8, 0.5);
  finish(g);
}

/* ---------- Garrafas (shoyu, molho de ostra, óleo de gergelim, teriyaki) ---------- */
function bottle(svg, { hw, sh, nk, glass, liquid, cap, label, band, text, ink }) {
  const g = plate(svg);
  const L = 100 - hw, R = 100 + hw;
  const body = `M ${L} 140 Q ${L} 144 ${L + 5} 144 L ${R - 5} 144 Q ${R} 144 ${R} 140 L ${R} ${sh}
    C ${R} ${sh - 12} 108 ${sh - 16} 108 ${sh - 26} L 108 ${nk} L 92 ${nk} L 92 ${sh - 26} C 92 ${sh - 16} ${L} ${sh - 12} ${L} ${sh} Z`;
  el(g, "path", { d: body, fill: horizontal(svg, glass) });
  const inside = el(g, "g", { "clip-path": clip(svg, "path", { d: body }) });
  if (liquid) {
    el(inside, "rect", { x: L - 2, y: liquid.level, width: hw * 2 + 4, height: 150 - liquid.level, fill: horizontal(svg, liquid.stops) });
    el(inside, "ellipse", { cx: 100, cy: liquid.level, rx: hw, ry: 2.4, fill: liquid.top, opacity: 0.9 });
  }
  el(inside, "rect", { x: R - hw * 0.45, y: sh - 30, width: hw * 0.45, height: 120, fill: "#000", opacity: 0.18 });
  // rótulo
  const ly = sh + 10, lh = Math.min(38, 134 - ly), lx = L + 3, lw = hw * 2 - 6;
  el(g, "rect", { x: lx, y: ly, width: lw, height: lh, rx: 2, fill: horizontal(svg, [[0, label[1]], [0.45, label[0]], [1, label[1]]]) });
  el(g, "rect", { x: lx, y: ly + 4, width: lw, height: 9, fill: band });
  el(g, "text", { x: 100, y: ly + 11, "text-anchor": "middle", "font-family": "Fredoka, sans-serif", "font-weight": 600, "font-size": text.length > 6 ? 6 : 7.5, fill: "#fff", "letter-spacing": 0.4 }).textContent = text;
  for (let i = 0; i < 3; i++) el(g, "rect", { x: lx + 6, y: ly + 19 + i * 5, width: lw - 12 - i * 6, height: 1.6, rx: 0.8, fill: ink, opacity: 0.45 });
  el(g, "path", { d: body, fill: "none", stroke: glass[glass.length - 1][1], "stroke-width": 1, opacity: 0.7 });
  // tampa
  el(g, "rect", { x: 90, y: nk - 15, width: 20, height: 17, rx: 3, fill: horizontal(svg, cap), stroke: cap[cap.length - 1][1], "stroke-width": 0.8 });
  for (let x = 93; x <= 107; x += 3) el(g, "line", { x1: x, y1: nk - 13, x2: x, y2: nk, stroke: "#000", "stroke-width": 0.6, opacity: 0.2 });
  shine(g, `M 93 ${nk - 12} L 93 ${nk - 2}`, 1.6, 0.6);
  // brilho do vidro
  shine(g, `M ${L + 5} ${sh + 4} L ${L + 5} ${ly - 3}`, 3, 0.55);
  shine(g, `M ${L + 5} ${ly + lh + 4} L ${L + 5} 138`, 3, 0.4);
  shine(g, `M 95 ${nk + 4} L 95 ${sh - 24}`, 1.6, 0.5);
  finish(g);
}

const darkGlass = [[0, "#170a05"], [0.25, "#4a2c19"], [0.5, "#2c180c"], [1, "#0c0502"]];

export const soy = (svg) => bottle(svg, {
  hw: 22, sh: 84, nk: 48, glass: darkGlass,
  cap: [[0, "#f4705d"], [0.5, "#d8392b"], [1, "#9a1f15"]],
  label: ["#fffdf6", "#e6dcc8"], band: "#c8352a", text: "SHOYU", ink: "#5a2a1a",
});

export const oyster = (svg) => bottle(svg, {
  hw: 28, sh: 98, nk: 68,
  glass: [[0, "#24140a"], [0.25, "#6a4220"], [0.5, "#3e2412"], [1, "#160b04"]],
  cap: [[0, "#5aa36a"], [0.5, "#2f7a44"], [1, "#1c4f2b"]],
  label: ["#fbf3e2", "#e2d4b8"], band: "#2f5f8a", text: "OSTRA", ink: "#2f3f5a",
});

export const sesame = (svg) => bottle(svg, {
  hw: 18, sh: 80, nk: 42,
  glass: [[0, "#c98a2c", 0.55], [0.4, "#ffe2a0", 0.35], [1, "#a4661a", 0.6]],
  liquid: { level: 70, top: "#ffd97a", stops: [[0, "#b8731c"], [0.4, "#f2b84a"], [1, "#9a5a12"]] },
  cap: [[0, "#ffe08a"], [0.5, "#d4a73a"], [1, "#94701c"]],
  label: ["#fffaf0", "#eadfca"], band: "#7a2a1a", text: "GERGELIM", ink: "#7a4a1a",
});

export const teriyaki = (svg) => bottle(svg, {
  hw: 24, sh: 90, nk: 56, glass: darkGlass,
  cap: [[0, "#ffb060"], [0.5, "#ea7a24"], [1, "#a8501a"]],
  label: ["#2a2420", "#16120f"], band: "#ea7a24", text: "TERIYAKI", ink: "#f4c890",
});

/* ---------- Amido de milho (tigela com pó e colher) ---------- */
export function cornstarch(svg) {
  const g = plate(svg);
  setSeed(51);
  bowl(svg, g, { rimY: 102, rx: 48, depth: 38, outer: ["#fffaf0", "#efe4cf", "#b9a682"], inner: ["#e9dcc4", "#c9b796"] }, (inner) => {
    const heap = "M 56 104 C 68 92 84 70 100 69 C 116 70 132 92 144 104 Z";
    el(inner, "path", { d: heap, fill: grad(svg, "radial", [[0, "#ffffff"], [0.6, "#f4f1ea"], [1, "#d6d0c4"]], { cx: 0.4, cy: 0.3, r: 0.8 }) });
    const dust = el(inner, "g", { "clip-path": clip(svg, "path", { d: heap }) });
    for (let i = 0; i < 70; i++) el(dust, "circle", { cx: 56 + rand() * 88, cy: 70 + rand() * 34, r: 0.4 + rand() * 0.8, fill: "#a89f90", opacity: 0.25 + rand() * 0.3 });
    el(dust, "path", { d: heap, fill: grad(svg, "linear", [[0.5, "#8a8070", 0], [1, "#8a8070", 0.3]], { x1: 0, y1: 0, x2: 1, y2: 0.3 }) });
    // colher de pau enterrada no pó
    el(inner, "path", { d: "M 112 82 L 152 44", stroke: "#8a5a2a", "stroke-width": 6, "stroke-linecap": "round" });
    el(inner, "path", { d: "M 112 82 L 152 44", stroke: "#d9a462", "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0.8 });
    el(inner, "ellipse", { cx: 110, cy: 86, rx: 12, ry: 5, transform: "rotate(-30 110 86)", fill: "#f8f5ef" });
  });
  // pó espalhado no prato
  for (let i = 0; i < 18; i++) el(g, "circle", { cx: 54 + rand() * 30, cy: 146 + rand() * 6, r: 0.6 + rand() * 1.2, fill: "#fff", opacity: 0.9 });
  finish(g);
}

/* ---------- Arroz cozido ---------- */
export function rice(svg) {
  const g = plate(svg);
  setSeed(61);
  const body = bowl(svg, g, { rimY: 100, rx: 50, depth: 40, outer: ["#f6fbff", "#dbe6f0", "#8ea4ba"], inner: ["#e4ecf3", "#b7c7d6"] }, (inner) => {
    const heap = "M 54 102 C 62 82 80 66 100 65 C 120 66 138 82 146 102 Z";
    el(inner, "path", { d: heap, fill: grad(svg, "radial", [[0, "#ffffff"], [0.7, "#f1f0ea"], [1, "#d3d0c6"]], { cx: 0.4, cy: 0.3, r: 0.8 }) });
    const grains = el(inner, "g", { "clip-path": clip(svg, "path", { d: heap }) });
    for (let i = 0; i < 150; i++) {
      const x = 54 + rand() * 92, y = 64 + rand() * 40;
      el(grains, "ellipse", { cx: x, cy: y, rx: 2.8, ry: 1.3, transform: `rotate(${rand() * 180} ${x} ${y})`, fill: "#fffefa", stroke: "#bdb7a8", "stroke-width": 0.4 });
    }
    el(grains, "path", { d: heap, fill: grad(svg, "linear", [[0.45, "#7a7464", 0], [1, "#7a7464", 0.3]], { x1: 0, y1: 0, x2: 1, y2: 0.4 }) });
  });
  // faixa azul da porcelana
  const deco = el(g, "g", { "clip-path": clip(svg, "path", { d: body }) });
  el(deco, "path", { d: "M 48 112 Q 100 128 152 112", stroke: "#2f5f9a", "stroke-width": 2.4, fill: "none", opacity: 0.8 });
  for (let x = 58; x <= 142; x += 12) el(deco, "circle", { cx: x, cy: 118 + Math.sin((x - 58) / 84 * Math.PI) * 6, r: 2.2, fill: "none", stroke: "#2f5f9a", "stroke-width": 1, opacity: 0.8 });
  el(deco, "path", { d: "M 56 126 Q 100 140 144 126", stroke: "#2f5f9a", "stroke-width": 1.2, fill: "none", opacity: 0.6 });
  // hashis apoiados na borda
  for (const [dy, c] of [[0, "#3a2416"], [5, "#5a3a24"]]) {
    el(g, "path", { d: `M 44 ${88 + dy} L 170 ${56 + dy}`, stroke: c, "stroke-width": 3.4, "stroke-linecap": "round" });
    shine(g, `M 60 ${83 + dy} L 160 ${58 + dy}`, 0.8, 0.35);
  }
  finish(g);
}

/* ---------- Tofu ---------- */
export function tofu(svg) {
  const g = plate(svg);
  setSeed(71);
  const top = "M 100 62 L 150 82 L 100 102 L 50 82 Z";
  const left = "M 50 82 L 100 102 L 100 140 L 50 120 Z";
  const right = "M 100 102 L 150 82 L 150 120 L 100 140 Z";
  const faces = [
    [left, vertical(svg, [[0, "#f5efdc"], [1, "#ddd2b4"]])],
    [right, vertical(svg, [[0, "#ddd2b2"], [1, "#bfb291"]])],
    [top, grad(svg, "radial", [[0, "#ffffff"], [1, "#f1ead5"]], { cx: 0.4, cy: 0.3, r: 0.8 })],
  ];
  for (const [d, fill] of faces) {
    el(g, "path", { d, fill, stroke: "#b3a37e", "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-opacity": 0.55 });
    const pores = el(g, "g", { "clip-path": clip(svg, "path", { d }) });
    for (let i = 0; i < 40; i++) el(pores, "circle", { cx: 50 + rand() * 100, cy: 62 + rand() * 78, r: 0.4 + rand() * 0.7, fill: "#9a8a62", opacity: 0.25 });
  }
  shine(g, "M 56 82 L 98 66", 2.4, 0.8);
  shine(g, "M 54 88 L 54 114", 2, 0.5);
  // gotinhas de água
  for (const [x, y] of [[120, 78], [84, 112]]) {
    el(g, "ellipse", { cx: x, cy: y, rx: 2.6, ry: 1.8, fill: "#cfe4ef", opacity: 0.8 });
    el(g, "circle", { cx: x - 0.8, cy: y - 0.6, r: 0.7, fill: "#fff" });
  }
  finish(g);
}

/* ---------- Cenoura ---------- */
export function carrot(svg) {
  const g = plate(svg);
  setSeed(81);
  // folhas
  // rama: talos com folhinhas dos dois lados, as de trás mais escuras
  const tops = el(g, "g", { "stroke-linecap": "round" });
  for (const [x2, y2, c] of [[16, 62, "#2f7a34"], [24, 36, "#3f8a3a"], [44, 24, "#4f9e42"], [64, 30, "#5aa648"], [36, 48, "#62b04c"]]) {
    el(tops, "path", { d: `M 56 84 L ${x2} ${y2}`, stroke: c, "stroke-width": 2.4, fill: "none" });
    const ang = (Math.atan2(y2 - 84, x2 - 56) * 180) / Math.PI;
    for (let t = 0.3; t <= 1; t += 0.12) {
      const x = 56 + (x2 - 56) * t, y = 84 + (y2 - 84) * t;
      for (const side of [-1, 1]) {
        el(tops, "path", {
          d: "M 0 0 Q 5 -3.4 12 0 Q 5 3.4 0 0 Z",
          transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang + side * 48).toFixed(0)}) scale(${(1.15 - t * 0.45).toFixed(2)})`,
          fill: c,
        });
      }
    }
  }
  const body = "M 50 84 C 56 72 76 72 88 80 L 160 128 C 166 133 162 140 156 137 L 64 104 C 50 99 44 92 50 84 Z";
  el(g, "path", { d: body, fill: grad(svg, "linear", [[0, "#ffb15a"], [0.45, "#f07a1e"], [1, "#b5480e"]], { x1: 0.3, y1: 0, x2: 0.6, y2: 1 }), stroke: "#a84410", "stroke-width": 1, "stroke-opacity": 0.6 });
  const rings = el(g, "g", { "clip-path": clip(svg, "path", { d: body }) });
  for (let i = 0; i < 12; i++) {
    const t = 0.08 + i / 12 * 0.86 + (rand() - 0.5) * 0.04;
    const x = 52 + (158 - 52) * t, y = 82 + (134 - 82) * t;
    el(rings, "path", { d: `M ${x - 4} ${y - 12} q ${3 + rand() * 3} 6 ${2} ${8 + rand() * 4}`, stroke: "#a8450e", "stroke-width": 0.9, fill: "none", opacity: 0.55 });
  }
  shine(g, "M 60 80 Q 90 84 130 108", 2.6, 0.55);
  finish(g);
}

/* ---------- Camarão, shiitake e alho (da referência da skill) ---------- */
export function shrimp(svg) {
  const g = plate(svg);
  const C = [100, 92], R = 48, N = 7, A0 = 152, A1 = 392;
  const ang = (k) => A0 + (k * (A1 - A0)) / N;
  const thick = (k) => 30 - 17 * (k / N);
  const legs = el(g, "g", { stroke: "#f39a78", "stroke-width": 2.2, "stroke-linecap": "round", fill: "none" });
  for (let k = 1; k < 6; k++) {
    const a = ang(k) + 16, r = R - thick(k);
    el(legs, "path", { d: `M ${f(pol(...C, r + 2, a))} Q ${f(pol(...C, r - 6, a - 4))} ${f(pol(...C, r - 10, a + 6))}` });
  }
  const P = pol(...C, R - 8, A1 - 2);
  const tail = el(g, "g", { transform: `translate(${f(P)}) rotate(${A1 - 50})` });
  for (const [rot, s] of [[-34, 0.85], [34, 0.85], [-13, 1], [13, 1]]) {
    const fin = el(tail, "g", { transform: `rotate(${rot}) scale(${s * 1.15})` });
    el(fin, "path", { d: "M 0 0 C -8 5 -9 18 -2 27 C 2 29 6 27 7 23 C 9 14 6 5 0 0 Z", fill: "url(#tailFin)", stroke: "#9c2e1c", "stroke-width": 0.7 });
    el(fin, "path", { d: "M 0 3 Q 1 14 2 24", stroke: "#ffcdb5", "stroke-width": 0.8, fill: "none", opacity: 0.7 });
  }
  for (let k = N - 1; k >= 0; k--) {
    const a0 = ang(k), a1 = ang(k + 1) + 5;
    const r0 = R - thick(k), r1 = R - thick(k + 1);
    const d = `M ${f(pol(...C, R, a0))} A ${R} ${R} 0 0 1 ${f(pol(...C, R, a1))}
      L ${f(pol(...C, r1, a1))} A ${(r0 + r1) / 2} ${(r0 + r1) / 2} 0 0 0 ${f(pol(...C, r0, a0))} Z`;
    el(g, "path", { d, fill: "url(#shrimpBody)", stroke: "#b23c27", "stroke-width": 1, "stroke-opacity": 0.45, "stroke-linejoin": "round" });
    el(g, "path", { d: `M ${f(pol(...C, R - 2, a0 + 3))} A ${R - 2} ${R - 2} 0 0 1 ${f(pol(...C, R - 2, a1 - 6))}`, stroke: "#c2402a", "stroke-width": 3, fill: "none", opacity: 0.35, "stroke-linecap": "round" });
  }
  shine(g, `M ${f(pol(...C, R - 7, ang(1)))} A ${R - 7} ${R - 7} 0 0 1 ${f(pol(...C, R - 7, ang(5)))}`, 3, 0.55);
  const H = pol(...C, R - 14, A0 - 8);
  const head = el(g, "g", { transform: `translate(${f(H)}) rotate(${A0 - 8 + 90})` });
  const ant = el(g, "g", { fill: "none", stroke: "#d4553a", "stroke-linecap": "round" });
  const tip = pol(...C, R - 10, A0 - 26);
  el(ant, "path", { d: `M ${f(tip)} C ${tip[0] - 40} ${tip[1] - 10}, ${tip[0] - 30} ${tip[1] - 70}, ${tip[0] + 20} ${tip[1] - 92}`, "stroke-width": 1.4 });
  el(ant, "path", { d: `M ${f(tip)} C ${tip[0] - 25} ${tip[1] + 4}, ${tip[0] - 52} ${tip[1] - 40}, ${tip[0] - 38} ${tip[1] - 84}`, "stroke-width": 1.1 });
  el(head, "path", { d: "M -16 6 C -18 -14 -4 -26 10 -24 C 20 -18 20 4 14 12 C 4 16 -8 14 -16 6 Z", fill: "url(#shrimpBody)", stroke: "#b23c27", "stroke-width": 1, "stroke-opacity": 0.5 });
  el(head, "path", { d: "M 6 -23 L 2 -38 L 12 -24 Z", fill: "#e9603f" });
  const E = pol(...C, R - 9, A0 - 18);
  el(g, "circle", { cx: E[0], cy: E[1], r: 3.6, fill: "#2a1712" });
  el(g, "circle", { cx: E[0] - 1, cy: E[1] - 1.2, r: 1.1, fill: "#fff" });
  finish(g);
}

export function mushroom(svg) {
  const g = plate(svg);
  setSeed(11);
  const s = el(g, "g", { transform: "translate(146 132) rotate(-18) scale(.6)" });
  el(s, "ellipse", { cx: 0, cy: -4, rx: 44, ry: 19, fill: "url(#cap)" });
  el(s, "ellipse", { cx: 0, cy: 0, rx: 40, ry: 16, fill: "url(#gills)", stroke: "#e8d8b6", "stroke-width": 1.5 });
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    el(s, "line", { x1: Math.cos(a) * 6, y1: Math.sin(a) * 2.6, x2: Math.cos(a) * 39, y2: Math.sin(a) * 15.5, stroke: "#b89d76", "stroke-width": i % 2 ? 0.5 : 0.9, opacity: 0.8 });
  }
  el(s, "ellipse", { cx: 0, cy: 0, rx: 8, ry: 4, fill: "#e8d8ba", stroke: "#bfa47c" });
  el(g, "path", { d: "M 86 100 C 84 116 82 128 80 138 C 92 143 108 143 118 138 C 116 128 114 116 114 100 Z", fill: "url(#stem)", stroke: "#a88c64", "stroke-width": 0.8 });
  el(g, "ellipse", { cx: 100, cy: 101, rx: 26, ry: 6, fill: "#6b3a1c", opacity: 0.5 });
  el(g, "ellipse", { cx: 100, cy: 98, rx: 60, ry: 9, fill: "#eadbbd", stroke: "#c2a67c", "stroke-width": 0.8 });
  for (let i = 0; i <= 40; i++) {
    const x = 44 + i * 2.8;
    el(g, "line", { x1: x, y1: 98, x2: 100 + (x - 100) * 0.55, y2: 104, stroke: "#b89a70", "stroke-width": 0.5, opacity: 0.7 });
  }
  const capD = "M 36 98 C 30 60 68 38 100 38 C 132 38 170 60 164 98 C 146 92 54 92 36 98 Z";
  el(g, "path", { d: capD, fill: "url(#cap)" });
  const cr = el(g, "g", { "clip-path": clip(svg, "path", { d: capD }) });
  for (let i = 0; i < 18; i++) {
    el(cr, "ellipse", { cx: 40 + rand() * 120, cy: 44 + rand() * 50, rx: 6 + rand() * 10, ry: 3 + rand() * 5, fill: "#3e1d0b", opacity: 0.12 + rand() * 0.12 });
  }
  for (let i = 0; i < 110; i++) {
    const t = Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    let x = 100 + Math.cos(a) * t * 64, y = 70 + Math.sin(a) * t * 30;
    let dir = rand() * Math.PI * 2;
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const steps = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < steps; k++) {
      dir += (rand() - 0.5) * 1.4;
      x += Math.cos(dir) * (2 + rand() * 3.5);
      y += Math.sin(dir) * (1.2 + rand() * 2);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    el(cr, "path", { d, fill: "none", stroke: "#efd9b0", "stroke-width": 0.7 + rand() * 1.5 * t, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.45 + rand() * 0.45 });
  }
  el(cr, "ellipse", { cx: 80, cy: 50, rx: 14, ry: 4, fill: "#fff", opacity: 0.22 });
  el(cr, "path", { d: "M 36 98 C 54 92 146 92 164 98 L 164 86 C 146 80 54 80 36 86 Z", fill: "#2b1205", opacity: 0.25 });
  el(g, "path", { d: "M 37 97 C 55 91 145 91 163 97", stroke: "#f2e2c2", "stroke-width": 2.4, fill: "none", "stroke-linecap": "round", opacity: 0.95 });
  el(g, "path", { d: capD, fill: "none", stroke: "#3c1d0a", "stroke-width": 1, opacity: 0.5 });
  finish(g);
}

export function garlic(svg) {
  const g = plate(svg);
  const roots = el(g, "g", { stroke: "#b49a72", "stroke-width": 0.8, fill: "none", "stroke-linecap": "round" });
  for (let i = 0; i < 14; i++) {
    const x = 90 + i * 1.5, dx = (i - 7) * 2.2;
    el(roots, "path", { d: `M ${x} 140 q ${dx * 0.4} 4 ${dx} ${5 + (i % 3) * 2}` });
  }
  const bulb = "M 100 66 C 132 64 154 86 152 110 C 150 132 128 142 100 142 C 72 142 50 132 48 110 C 46 86 68 64 100 66 Z";
  el(g, "path", { d: bulb, fill: "url(#clove)", stroke: "#a98ba0", "stroke-width": 1 });
  for (const k of [-0.78, -0.42, 0, 0.42, 0.78]) {
    const xt = 100 + k * 12, xm = 100 + k * 54, xb = 100 + k * 26;
    el(g, "path", { d: `M ${xt} 70 C ${xm} 84 ${xm} 124 ${xb} 141`, stroke: "#9c7a93", "stroke-width": 1.3, fill: "none", opacity: 0.55 });
    el(g, "path", { d: `M ${xt + 2} 72 C ${xm + 3} 86 ${xm + 3} 122 ${xb + 2} 139`, stroke: "#fff", "stroke-width": 1.2, fill: "none", opacity: 0.6 });
  }
  setSeed(5);
  for (let i = 0; i < 16; i++) {
    const k = rand() * 2 - 1, xm = 100 + k * 50;
    el(g, "path", { d: `M ${100 + k * 14} ${78 + rand() * 8} C ${xm} 92 ${xm} 118 ${100 + k * 28} ${128 + rand() * 8}`, stroke: "#8e4f86", "stroke-width": 0.6 + rand() * 0.8, fill: "none", opacity: 0.12 + rand() * 0.2 });
  }
  el(g, "path", { d: bulb, fill: "url(#bulbShade)" });
  el(g, "path", { d: "M 140 92 C 152 100 156 114 150 126 C 148 116 144 106 136 100 Z", fill: "#f4ece0", stroke: "#cdb9a2", "stroke-width": 0.7, opacity: 0.9 });
  el(g, "path", { d: "M 86 72 C 92 60 94 48 96 34 C 97 30 103 29 104 33 C 105 46 108 60 114 72 C 105 67 95 67 86 72 Z", fill: "url(#paper)", stroke: "#b5a07c", "stroke-width": 0.8 });
  for (const x of [92, 98, 104, 109]) el(g, "path", { d: `M ${x} 70 Q ${100 + (x - 100) * 0.4 - 3} 52 ${100 + (x - 100) * 0.2} 34`, stroke: "#bfa680", "stroke-width": 0.6, fill: "none" });
  shine(g, "M 70 86 Q 60 104 66 124", 3.5, 0.65);
  shine(g, "M 94 78 Q 90 92 92 104", 2, 0.6);
  const c = el(g, "g", { transform: "translate(156 136) rotate(-58)" });
  el(c, "path", { d: "M 0 -17 C 9 -12 13 6 3 13 C -6 15 -12 8 -9 -4 C -7 -11 -4 -15 0 -17 Z", fill: "url(#clove)", stroke: "#a98ba0", "stroke-width": 0.9 });
  shine(c, "M -5 -6 Q -6 2 -3 8", 1.8, 0.8);
  finish(g);
}
