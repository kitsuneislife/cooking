// Ajudantes para desenhar em SVG por código (veja docs/skills/ilustracao-svg).
const NS = "http://www.w3.org/2000/svg";

export function el(parent, tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const key in attrs) node.setAttribute(key, attrs[key]);
  parent.appendChild(node);
  return node;
}

export const pol = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
export const f = (p) => p.map((v) => v.toFixed(1)).join(",");

// Aleatório com semente: o desenho sai igual em toda execução.
let seed = 7;
export const setSeed = (s) => { seed = s; };
export const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

let next = 0;
const uid = (prefix) => `${prefix}${++next}`;
const defs = (svg) => svg.querySelector("defs") || el(svg, "defs");

// Gradiente local ao desenho, com id único. stops: [offset, cor, opacidade?]
export function grad(svg, kind, stops, attrs = {}) {
  const id = uid("g");
  const node = el(defs(svg), kind === "radial" ? "radialGradient" : "linearGradient", { id, ...attrs });
  for (const [offset, color, opacity = 1] of stops) {
    el(node, "stop", { offset, "stop-color": color, "stop-opacity": opacity });
  }
  return `url(#${id})`;
}

export const vertical = (svg, stops) => grad(svg, "linear", stops, { x1: 0, y1: 0, x2: 0, y2: 1 });
export const horizontal = (svg, stops) => grad(svg, "linear", stops, { x1: 0, y1: 0, x2: 1, y2: 0 });

export function clip(svg, tag, attrs) {
  const id = uid("c");
  el(el(defs(svg), "clipPath", { id }), tag, attrs);
  return `url(#${id})`;
}

export function shine(g, d, width = 2.4, opacity = 0.6) {
  el(g, "path", { d, stroke: "#fff", "stroke-width": width, fill: "none", opacity, "stroke-linecap": "round" });
}

export function finish(g) {
  g.style.filter = "url(#grain) drop-shadow(0 2px 2px #3a241055)";
}

// Prato padrão dos ingredientes. Devolve o grupo animado da comida.
export function plate(svg) {
  svg.setAttribute("viewBox", "0 0 200 180");
  el(svg, "ellipse", { class: "shadow", cx: 100, cy: 156, rx: 78, ry: 14, fill: "#5a4220", opacity: 0.35, filter: "url(#soft)" });
  el(svg, "ellipse", { cx: 100, cy: 146, rx: 82, ry: 27, fill: "url(#plateRim)" });
  el(svg, "ellipse", { cx: 100, cy: 146, rx: 81, ry: 26, fill: "none", stroke: "#fff", "stroke-width": 1.5, opacity: 0.9 });
  el(svg, "ellipse", { cx: 100, cy: 147, rx: 60, ry: 18, fill: "url(#plateWell)" });
  el(svg, "path", { d: "M 42 141 Q 100 126 158 141", fill: "none", stroke: "#fff", "stroke-width": 2, opacity: 0.7, "stroke-linecap": "round" });
  return el(el(svg, "g", { class: "food" }), "g");
}

// Base das estações (sem prato).
export function stage(svg) {
  svg.setAttribute("viewBox", "0 0 200 150");
  el(svg, "ellipse", { cx: 100, cy: 136, rx: 82, ry: 10, fill: "#5a4220", opacity: 0.3, filter: "url(#soft)" });
  return el(svg, "g", { class: "station-art" });
}

// Tigela vista de lado. `contents` desenha o que fica dentro, entre a borda de trás e a frente.
export function bowl(svg, g, { cx = 100, rimY, rx, ry = rx * 0.22, depth, outer, inner }, contents) {
  el(g, "ellipse", { cx, cy: rimY + depth + 1, rx: rx * 0.38, ry: ry * 0.5, fill: outer[2] });
  el(g, "ellipse", { cx, cy: rimY, rx, ry, fill: vertical(svg, [[0, inner[1]], [1, inner[0]]]) });
  el(g, "path", { d: `M ${cx - rx} ${rimY} A ${rx} ${ry} 0 0 1 ${cx + rx} ${rimY}`, fill: "none", stroke: "#fff", "stroke-width": 2, opacity: 0.7 });
  contents?.(g);
  const body = `M ${cx - rx} ${rimY} C ${cx - rx + 2} ${rimY + depth * 0.8} ${cx - rx * 0.45} ${rimY + depth} ${cx} ${rimY + depth}
    C ${cx + rx * 0.45} ${rimY + depth} ${cx + rx - 2} ${rimY + depth * 0.8} ${cx + rx} ${rimY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${rimY} Z`;
  el(g, "path", {
    d: body,
    fill: grad(svg, "linear", [[0, outer[0]], [0.4, outer[1]], [1, outer[2]]], { x1: 0, y1: 0, x2: 1, y2: 0.5 }),
    stroke: outer[2], "stroke-width": 1, "stroke-opacity": 0.6,
  });
  el(g, "path", { d: `M ${cx + rx} ${rimY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${rimY}`, fill: "none", stroke: "#fff", "stroke-width": 2.6, opacity: 0.9 });
  shine(g, `M ${cx - rx * 0.8} ${rimY + ry + 4} Q ${cx - rx * 0.74} ${rimY + depth * 0.66} ${cx - rx * 0.38} ${rimY + depth * 0.9}`, 3, 0.5);
  return body;
}
