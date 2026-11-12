// Despensa: os ingredientes de todas as receitas e o que cada um vira quando cai num
// copo, vai para a tábua ou é despejado. Mesmo estilo do kit: formas cheinhas, sem contorno.
import {
  THREE, RoundedBoxGeometry, mergeGeometries, build, bottle, labelTexture, mesh, food, glossy, metal,
  paint, canvasTex, tex, rgb, mix, fbm, sstep, seeded, V2, castAll,
} from "./kit.js";

const cache = {};
const once = (key, make) => cache[key] ??= make();
const C = (hex) => new THREE.Color(hex);

/* ---------- Texturas ---------- */
const mangoTex = () => once("mango", () => {
  const green = rgb("#8fbf3a"), yellow = rgb("#ffc42e"), red = rgb("#ee4f2c");
  return paint(128, (u, v) => {
    const c = mix(green, yellow, sstep(0.05, 0.45, v + (fbm(u * 6, v * 6) - 0.5) * 0.3));
    const blush = sstep(0.35, 0.85, 0.5 + 0.5 * Math.sin(u * Math.PI * 2)) * sstep(0.15, 0.7, v);
    return mix(c, red, blush * 0.85);
  });
});
const onionTex = () => once("onion", () => {
  const a = rgb("#7a1f52"), b = rgb("#b5477f"), paper = rgb("#d9b48a");
  return paint(128, (u, v) => mix(mix(a, b, fbm(u * 34, v * 2.5, 3)), paper, sstep(0.82, 0.95, v)));
});
export const chickenTex = (k) => once(`chicken-${k}`, () => {
  if (k === "raw") {
    const a = rgb("#f8cbbd"), b = rgb("#ec9f90"), fat = rgb("#fff3e6");
    return paint(256, (u, v) => mix(mix(a, b, fbm(u * 5, v * 5)), fat, (1 - sstep(0.01, 0.05, Math.abs(fbm(u * 3 + 4, v * 6, 4) - 0.5))) * 0.5), { repeat: 0.6 });
  }
  const lo = rgb("#a85a1c"), mid = rgb("#d99444"), hi = rgb("#f2c878");
  return paint(256, (u, v) => {
    const n = fbm(u * 6, v * 6), c = n < 0.5 ? mix(lo, mid, n * 2) : mix(mid, hi, (n - 0.5) * 2);
    const bar = (u * 4) % 1; // marcas da grelha: riscos retos, iguais mesmo com a textura espelhada
    return mix(c, rgb("#3a1a08"), (1 - sstep(0.05, 0.12, Math.abs(bar - 0.5))) * 0.85);
  }, { repeat: 0.6 });
});
function packTex(text, bg, band) { // embalagem de papel: faixa colorida com o nome
  return canvasTex(256, 256, (x) => {
    x.fillStyle = bg; x.fillRect(0, 0, 256, 256);
    x.fillStyle = band; x.fillRect(0, 78, 256, 84);
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `400 ${text.length > 6 ? 40 : 52}px "Lilita One", sans-serif`;
    x.fillText(text, 128, 122);
    x.fillStyle = band; x.globalAlpha = 0.35;
    for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(64 + i * 64, 208, 12, 0, Math.PI * 2); x.fill(); }
  });
}

/* ---------- Formas de base ---------- */
// esfera calombenta: massa, colheradas, frango
function lumpGeo(r, seed, amount = 0.08) {
  const geo = new THREE.SphereGeometry(r, 28, 18), p = geo.attributes.position, o = seed * 1.7;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + amount * Math.sin(x / r * 4 + o) * Math.sin(y / r * 5 + o * 2) * Math.sin(z / r * 4 + o);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  geo.computeVertexNormals();
  return geo;
}
// colherada macia (iogurte, mascarpone, mel…)
function dollop(color, o = {}) {
  const m = mesh(lumpGeo(0.3, 3), food({ color, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.2, ...o }));
  m.scale.y = 0.75;
  return m;
}
// punhado de cubinhos
function cubes(colors, n = 5, size = 0.19, seed = 5) {
  const g = new THREE.Group(), rand = seeded(seed), geo = new RoundedBoxGeometry(size, size, size, 2, size * 0.22);
  for (let i = 0; i < n; i++) {
    const c = mesh(geo, food({ color: colors[i % colors.length], roughness: 0.35, clearcoat: 0.8 }));
    c.position.set((rand() - 0.5) * size * 2, (rand() - 0.5) * size * 1.6, (rand() - 0.5) * size * 2);
    c.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    g.add(c);
  }
  return g;
}
// maço de ervas: talos amarrados e folhas em tufo
function bunch(leafGeo, color, n, seed) {
  const g = new THREE.Group(), rand = seeded(seed);
  const stalk = food({ color: "#8fbf5a", roughness: 0.5 }), leaf = food({ color, roughness: 0.4, clearcoat: 0.6, sheen: 0.4, sheenColor: C("#d8ffb0") });
  for (let i = 0; i < 7; i++) {
    const s = mesh(new THREE.CylinderGeometry(0.02, 0.028, 1.1, 6), stalk);
    s.position.set((rand() - 0.5) * 0.14, 0.55, (rand() - 0.5) * 0.14);
    s.rotation.set((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3);
    g.add(s);
  }
  const tie = mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 20), glossy({ color: "#e5484d" }));
  tie.rotation.x = Math.PI / 2; tie.position.y = 0.4;
  g.add(tie);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 0.42, l = mesh(leafGeo, leaf);
    l.position.set(Math.cos(a) * r, 0.95 + rand() * 0.6 - r * 0.5, Math.sin(a) * r);
    l.rotation.set(rand() * 0.9 - 0.2, a, rand() * 0.8 - 0.4);
    g.add(l);
  }
  return g;
}
const BASIL_LEAF = () => once("basilLeaf", () => {
  const geo = new THREE.SphereGeometry(1, 14, 8).scale(0.2, 0.045, 0.32), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + (p.getX(i) ** 2) * 1.6 - (p.getZ(i) ** 2) * 0.5); // folha em concha
  geo.computeVertexNormals();
  return geo;
});
const CILANTRO_LEAF = () => once("cilantroLeaf", () => new THREE.SphereGeometry(1, 8, 6).scale(0.12, 0.03, 0.14));

function tub(text, band, lid) { // pote de plástico com tampa de alumínio
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.48, 0), V2(0.52, 0.04), V2(0.62, 0.84), V2(0.67, 0.86), V2(0.67, 0.92), V2(0, 0.92)], 40), glossy({ color: "#fffdf8", roughness: 0.3 })));
  const label = mesh(new THREE.CylinderGeometry(0.606, 0.546, 0.52, 40, 1, true, -1.7, 3.4), new THREE.MeshStandardMaterial({ map: labelTexture(text, band, band), roughness: 0.6 }));
  label.position.y = 0.46;
  const foil = mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.035, 40), metal({ color: lid, roughness: 0.35 }));
  foil.position.y = 0.935;
  g.add(label, foil);
  return g;
}
function carton(text, band, cap) { // caixa de leite com telhadinho
  const g = new THREE.Group(), map = packTex(text, "#fffaf0", band);
  const body = mesh(new RoundedBoxGeometry(0.78, 1.15, 0.78, 3, 0.05), new THREE.MeshStandardMaterial({ map, roughness: 0.45 }));
  body.position.y = 0.575;
  const tri = new THREE.Shape([V2(-0.38, 0), V2(0.38, 0), V2(0, 0.3)]);
  const roof = mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.76, bevelEnabled: false }).translate(0, 1.15, -0.38), glossy({ color: band, roughness: 0.4 }));
  const fin = mesh(new RoundedBoxGeometry(0.05, 0.16, 0.76, 1, 0.02), glossy({ color: "#fffaf0" }));
  fin.position.y = 1.5;
  const lid = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20), glossy({ color: cap }));
  lid.position.set(0.2, 1.33, 0.12); lid.rotation.z = -0.9;
  g.add(body, roof, fin, lid);
  return g;
}
function sack(text, band) { // saco de papel dobrado em cima
  const g = new THREE.Group();
  const body = mesh(new RoundedBoxGeometry(0.95, 1.1, 0.62, 4, 0.14), new THREE.MeshStandardMaterial({ map: packTex(text, "#fff6e6", band), roughness: 0.8 }));
  body.position.y = 0.55;
  const fold = mesh(new RoundedBoxGeometry(0.9, 0.2, 0.3, 3, 0.08), food({ color: "#f3e3c8", roughness: 0.85, clearcoat: 0 }));
  fold.position.set(0, 1.14, 0.02); fold.rotation.x = 0.25;
  g.add(body, fold);
  return g;
}
function tin(text, band, body) { // lata com tampa de metal
  const g = new THREE.Group();
  const can = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 40), glossy({ color: body, roughness: 0.3 }));
  can.position.y = 0.5;
  const label = mesh(new THREE.CylinderGeometry(0.426, 0.426, 0.62, 40, 1, true, -1.7, 3.4), new THREE.MeshStandardMaterial({ map: labelTexture(text, band, band), roughness: 0.6 }));
  label.position.y = 0.48;
  const lid = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.09, 40), metal({ color: "#e6ebf0", roughness: 0.25 }));
  lid.position.y = 1.03;
  g.add(can, label, lid);
  return g;
}
function shaker(body, band) { // saleiro de cerâmica com tampa furadinha
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.22, 0), V2(0.25, 0.04), V2(0.2, 0.5), V2(0.24, 0.62)], 28), glossy({ color: body })));
  const stripe = mesh(new THREE.CylinderGeometry(0.228, 0.24, 0.1, 28, 1, true), glossy({ color: band }));
  stripe.position.y = 0.2;
  g.add(stripe, mesh(new THREE.LatheGeometry([V2(0.24, 0.62), V2(0.23, 0.74), V2(0.13, 0.83), V2(0, 0.84)], 28), metal({ color: "#e6ebf0", roughness: 0.25 })));
  return g;
}

/* ---------- Ingredientes ---------- */
export function mango() {
  const geo = new THREE.LatheGeometry([V2(0, 0), V2(0.3, 0.04), V2(0.56, 0.3), V2(0.68, 0.7), V2(0.62, 1.1), V2(0.4, 1.4), V2(0.15, 1.52), V2(0, 1.54)], 40);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + 0.13 * Math.sin(p.getY(i) / 1.54 * Math.PI)); // barriguinha para um lado
  geo.computeVertexNormals();
  const g = new THREE.Group();
  g.add(mesh(geo, food({ map: mangoTex(), roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.25 })));
  const stem = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 8), food({ color: "#6a4a2a" }));
  stem.position.set(0.02, 1.58, 0);
  g.add(stem);
  g.rotation.z = -1.2; // deitada
  return g;
}
function citrus(color, pointed) {
  const g = new THREE.Group(), skin = food({ color, roughness: 0.45, clearcoat: 0.7, bumpMap: tex("speckle"), bumpScale: 0.5 });
  const prof = pointed
    ? [V2(0, -0.66), V2(0.08, -0.6), V2(0.32, -0.42), V2(0.46, -0.14), V2(0.48, 0.1), V2(0.4, 0.38), V2(0.2, 0.56), V2(0.07, 0.63), V2(0, 0.65)]
    : [V2(0, -0.44), V2(0.2, -0.41), V2(0.4, -0.24), V2(0.47, 0), V2(0.4, 0.24), V2(0.2, 0.41), V2(0.05, 0.45), V2(0, 0.46)];
  const fruit = mesh(new THREE.LatheGeometry(prof, 36), skin);
  fruit.rotation.z = Math.PI / 2; fruit.position.y = 0.47;
  g.add(fruit);
  return g;
}
export const lime = () => citrus("#6cba2c", false);
export const lemon = () => citrus("#ffd53a", true);
// gomo de limão: casca por fora, polpa clara nos dois cortes
export function limeWedge() {
  const g = new THREE.Group(), r = 0.42, a = 1.05;
  const rind = mesh(new THREE.SphereGeometry(r, 14, 16, 0, a), food({ color: "#5fae22", roughness: 0.45, clearcoat: 0.6 }));
  const flesh = food({ color: "#e2f4a6", roughness: 0.25, clearcoat: 1, emissive: "#9ac43a", emissiveIntensity: 0.12 });
  const cut = new THREE.CircleGeometry(r * 0.94, 20, Math.PI / 2, Math.PI);
  const f1 = mesh(cut, flesh), f2 = mesh(cut, flesh);
  f2.rotation.y = a;
  g.add(rind, f1, f2);
  g.rotation.set(0.3, -a / 2, Math.PI / 2); // deitado, com a polpa para cima
  const w = new THREE.Group(); w.add(g);
  return w;
}
export function redOnion() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.25, 0.02), V2(0.5, 0.2), V2(0.6, 0.5), V2(0.52, 0.8), V2(0.3, 1.0), V2(0.12, 1.12), V2(0.05, 1.3), V2(0, 1.32)], 40),
    food({ map: onionTex(), roughness: 0.3, clearcoat: 0.8, sheen: 0.5, sheenColor: C("#ffd0e8") })));
  return g;
}
export const basil = () => bunch(BASIL_LEAF(), "#2f9a3a", 16, 5);
export const cilantro = () => bunch(CILANTRO_LEAF(), "#55b53c", 46, 9);
export function basilLeaf() {
  const l = mesh(BASIL_LEAF(), food({ color: "#2f9a3a", roughness: 0.4, clearcoat: 0.6, sheen: 0.4, sheenColor: C("#d8ffb0") }));
  l.scale.setScalar(1.25); l.position.y = 0.03;
  const w = new THREE.Group(); w.add(l);
  return w;
}
export function jalapeno() {
  const g = new THREE.Group();
  const body = mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.1, 0.04), V2(0.2, 0.4), V2(0.25, 0.9), V2(0.22, 1.18), V2(0.1, 1.28), V2(0, 1.29)], 28), glossy({ color: "#2f8f2c", roughness: 0.25 }));
  const p = body.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + 0.1 * Math.sin(p.getY(i) * 1.6)); // curvinha
  body.geometry.computeVertexNormals();
  const stem = mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.3, 10), food({ color: "#5a7a2a" }));
  stem.position.set(0.1, 1.4, 0); stem.rotation.z = -0.4;
  g.add(body, stem);
  g.rotation.z = -Math.PI / 2 + 0.1;
  return g;
}

// Meia sobrecoxa: a grelha empilha duas metades para dourar um lado de cada vez.
export const chickenGeo = () => once("chickenGeo", () => {
  const s = new THREE.Shape();
  s.moveTo(-0.55, 0);
  s.bezierCurveTo(-0.6, 0.38, -0.1, 0.5, 0.2, 0.4);
  s.bezierCurveTo(0.6, 0.42, 0.72, 0.1, 0.62, -0.12);
  s.bezierCurveTo(0.5, -0.42, 0, -0.4, -0.2, -0.34);
  s.bezierCurveTo(-0.5, -0.36, -0.56, -0.2, -0.55, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.06, bevelSegments: 5, curveSegments: 24 });
  return geo.rotateX(-Math.PI / 2).translate(0, -0.01, 0);
});
export const chickenMat = (k) => food({ map: chickenTex(k), bumpMap: chickenTex(k), bumpScale: 1.5, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.3 });
export function chicken(k = "raw") { // sobrecoxa inteira (crua ou grelhada)
  const m = mesh(chickenGeo(), chickenMat(k));
  m.scale.set(1.5, 2.6, 1.5); m.position.y = 0.16;
  const g = new THREE.Group(); g.add(m);
  return g;
}
function chickenTray() {
  const g = new THREE.Group();
  const tray = mesh(new RoundedBoxGeometry(2.3, 0.2, 1.5, 3, 0.08), glossy({ color: "#fff3df", roughness: 0.5 }));
  tray.position.y = 0.1;
  g.add(tray);
  for (const [x, r] of [[-0.5, 0.2], [0.55, -0.3]]) {
    const c = chicken(); c.scale.setScalar(0.7); c.position.set(x, 0.2, 0); c.rotation.y = r;
    g.add(c);
  }
  return g;
}

export function iceCube() {
  return mesh(new RoundedBoxGeometry(0.36, 0.36, 0.36, 3, 0.08), new THREE.MeshPhysicalMaterial({ color: "#dff4ff", roughness: 0.06, clearcoat: 1, transparent: true, opacity: 0.6 }));
}
function icePile() {
  const g = new THREE.Group(), rand = seeded(4);
  for (let i = 0; i < 7; i++) {
    const c = iceCube();
    c.position.set((i % 3 - 1) * 0.4 + rand() * 0.1, 0.18 + Math.floor(i / 3) * 0.34, (rand() - 0.5) * 0.5);
    c.rotation.set(rand() * 0.5, rand() * 3, rand() * 0.5);
    g.add(c);
  }
  return g;
}

// Xícara de café com pires; `userData.surface` é a altura do café.
export function espresso() {
  const g = new THREE.Group(), china = glossy({ color: "#fffdf8", roughness: 0.2 });
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.52, 0), V2(0.9, 0.08), V2(0.93, 0.11), V2(0.5, 0.05), V2(0, 0.05)], 48), china));
  const cup = mesh(new THREE.LatheGeometry([V2(0, 0.05), V2(0.3, 0.05), V2(0.34, 0.1), V2(0.56, 0.66), V2(0.58, 0.68), V2(0.54, 0.66), V2(0.31, 0.15), V2(0, 0.13)], 48), china);
  const coffee = mesh(new THREE.CircleGeometry(0.51, 40), glossy({ color: "#2e1508", roughness: 0.06, side: THREE.FrontSide }));
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.58;
  const crema = mesh(new THREE.RingGeometry(0.4, 0.51, 40), food({ color: "#b8823c", roughness: 0.4, side: THREE.FrontSide }));
  crema.rotation.x = -Math.PI / 2; crema.position.y = 0.583;
  const handle = mesh(new THREE.TorusGeometry(0.17, 0.045, 10, 24), china);
  handle.position.set(0.64, 0.36, 0);
  g.add(cup, coffee, crema, handle);
  g.userData.surface = 0.58;
  return g;
}

export function ladyfinger() { // biscoito champanhe, com material próprio (ele escurece no café)
  const m = mesh(new THREE.CapsuleGeometry(0.15, 0.72, 6, 14).rotateZ(Math.PI / 2).scale(1, 0.6, 1),
    food({ color: "#f2d28c", roughness: 0.85, clearcoat: 0, bumpMap: tex("powder"), bumpScale: 2 }));
  m.position.y = 0.09;
  const g = new THREE.Group(); g.add(m);
  g.userData.mat = m.material;
  return g;
}
function ladyfingerPack() {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const b = ladyfinger(); b.position.set(0, Math.floor(i / 3) * 0.19, (i % 3 - 1) * 0.33);
    g.add(b);
  }
  const band = mesh(new RoundedBoxGeometry(0.4, 0.44, 1.08, 2, 0.04), glossy({ color: "#2a8199", roughness: 0.5 }));
  band.position.y = 0.2;
  g.add(band);
  return g;
}

export function doughBall() {
  const m = mesh(lumpGeo(0.62, 2, 0.05), food({ color: "#f5e3b9", roughness: 0.85, clearcoat: 0.05, bumpMap: tex("powder"), bumpScale: 1 }));
  m.scale.y = 0.72; m.position.y = 0.44;
  const g = new THREE.Group(); g.add(m);
  return g;
}
function mozzarella() {
  const g = new THREE.Group(), mat = food({ color: "#fffdf5", roughness: 0.22, clearcoat: 1, sheen: 0.6, sheenColor: C("#fff") });
  for (const [x, z, r] of [[0, 0, 0.46], [0.62, 0.2, 0.3]]) {
    const b = mesh(new THREE.SphereGeometry(r, 32, 20), mat);
    b.scale.y = 0.86; b.position.set(x, r * 0.86, z);
    g.add(b);
  }
  return g;
}
export function mozzaSlice() { // rodela de muçarela, com material próprio (ela derrete no forno)
  const m = mesh(new THREE.LatheGeometry([V2(0, 0.075), V2(0.25, 0.075), V2(0.33, 0.045), V2(0.33, 0), V2(0, 0)], 28),
    food({ color: "#fffdf5", roughness: 0.25, clearcoat: 1, sheen: 0.6, sheenColor: C("#fff") }));
  const g = new THREE.Group(); g.add(m);
  g.userData.mat = m.material;
  return g;
}
function saltPepper() {
  const g = new THREE.Group(), salt = shaker("#fffaf0", "#2a8199"), pepper = shaker("#4a3a32", "#e5484d");
  salt.position.x = -0.32; pepper.position.x = 0.32;
  g.add(salt, pepper);
  return g;
}
function cheddar() {
  const tri = new THREE.Shape([V2(0, 0), V2(1.2, 0), V2(0, 0.7)]);
  const m = mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4 }), food({ color: "#ffab1f", roughness: 0.4, clearcoat: 0.6 }));
  m.rotation.x = -Math.PI / 2; m.position.set(-0.5, 0.05, 0.3);
  const g = new THREE.Group(); g.add(m);
  return g;
}
function cornstarchBox() { // caixa de amido com rótulo
  const box = mesh(new RoundedBoxGeometry(1, 1.4, 0.6, 3, 0.06), new THREE.MeshStandardMaterial({ map: packTex("AMIDO", "#ffd23f", "#2a8199"), roughness: 0.5 }));
  box.position.y = 0.7;
  const g = new THREE.Group(); g.add(box);
  return g;
}

const BOTTLES = {
  oliveOil: () => bottle({ r: 0.36, shoulder: 1.15, neckR: 0.1, neckTop: 1.95, glass: "#9aa83a", amber: "#c2b52a", cap: "#2a1a10", text: "AZEITE", band: "#4a6a1a", ink: "#3a4a1a" }),
  cachaca: () => bottle({ r: 0.4, shoulder: 1.05, neckR: 0.12, neckTop: 1.85, glass: "#e6f4e0", amber: "#f6f2cc", cap: "#2a8199", text: "CACHAÇA", band: "#2f7a44", ink: "#2f5a3a" }),
  honey: () => bottle({ r: 0.46, shoulder: 0.72, neckR: 0.3, neckTop: 1.08, glass: "#f0b040", amber: "#e89a10", cap: "#ffd23f", text: "MEL", band: "#b86a10", ink: "#7a4a10" }),
  ketchup: () => bottle({ r: 0.38, shoulder: 0.95, neckR: 0.14, neckTop: 1.6, glass: "#c8201a", cap: "#fffaf0", text: "KETCHUP", band: "#7a1410", ink: "#7a1410" }),
  tomato: () => bottle({ r: 0.5, shoulder: 0.78, neckR: 0.36, neckTop: 1.12, glass: "#f0705a", amber: "#d02a1c", cap: "#d9b46a", text: "MOLHO", band: "#2f7a44", ink: "#7a2a1a" }),
  cardamom: () => bottle({ r: 0.32, shoulder: 0.6, neckR: 0.22, neckTop: 0.92, glass: "#dff0cc", amber: "#93b060", cap: "#3a7a4a", text: "CARDAMOMO", band: "#3a7a4a", ink: "#3a5a2a" }),
};

/* ---------- A despensa ----------
   `model`: como aparece na feira e na bancada. `tint`: a cor que dá ao que cai ou é despejado.
   `piece`: o que cai no copo ou na tigela (padrão: uma colherada da cor). `chop`: como vai para a tábua.
   `solid`: o pedaço fica inteiro lá dentro em vez de virar líquido. `melts`: some ao mexer ou socar. */
const drop = (tint, o) => () => dollop(tint, o);
export const PANTRY = {
  // carne com brócolis
  beef: { model: () => build.steak(), tint: "#bf2f3c" },
  broccoli: { model: build.broccoli, tint: "#4cae3a" },
  soy: { model: build.soy, tint: "#3a1a0a" },
  oyster: { model: build.oyster, tint: "#5e3416" },
  sesame: { model: build.sesame, tint: "#d8952a" },
  garlic: { model: build.garlic, tint: "#fbf3dc", chop: { model: build.cloves, size: 1.25, colors: ["#fbf3dc", "#f1e2b8", "#fffaf0"] } },
  ginger: { model: build.ginger, tint: "#f6dc86", chop: { size: 1.35, colors: ["#f6dc86", "#e9c45c", "#fff1b8"] } },
  cornstarch: { model: cornstarchBox, tint: "#fffdf6" },
  rice: { model: () => build.rice({ sticks: false }), tint: "#fffcf4" },
  shrimp: { model: build.shrimp }, tofu: { model: build.tofu }, carrot: { model: build.carrot },
  mushroom: { model: build.mushroom }, teriyaki: { model: build.teriyaki },
  // pizza
  dough: { model: doughBall, tint: "#f5e3b9" },
  tomato: { model: BOTTLES.tomato, tint: "#d02a1c" },
  mozzarella: { model: mozzarella, tint: "#fffdf5", piece: mozzaSlice },
  basil: { model: basil, tint: "#2f9a3a", piece: basilLeaf },
  oliveOil: { model: BOTTLES.oliveOil, tint: "#c2b52a" },
  seasoning: { model: saltPepper, tint: "#fffaf0" },
  cheddar: { model: cheddar }, ketchup: { model: BOTTLES.ketchup },
  // frango com salsa de manga
  chicken: { model: chickenTray, tint: "#f0a898" },
  mango: { model: mango, tint: "#ffb52e", solid: true, piece: () => cubes(["#ffb52e", "#ffc94a", "#f79a1a"]), chop: { size: 1.5, colors: ["#ffb52e", "#ffc94a", "#f79a1a"] } },
  onion: { model: redOnion, tint: "#b5477f", solid: true, piece: () => cubes(["#c8689a", "#f6e6f0", "#a03a72"], 6, 0.13), chop: { size: 1.15, colors: ["#c8689a", "#f6e6f0", "#a03a72"] } },
  cilantro: { model: cilantro, tint: "#55b53c", solid: true, piece: () => cubes(["#55b53c", "#3f9a34", "#7fd060"], 8, 0.09), chop: { size: 1.35, colors: ["#55b53c", "#3f9a34", "#7fd060"] } },
  lime: { model: lime, tint: "#cfe88a", solid: true, piece: limeWedge },
  jalapeno: { model: jalapeno, tint: "#2f8f2c", solid: true, piece: () => cubes(["#2f8f2c", "#57b64a", "#e9f4c0"], 6, 0.1), chop: { size: 1.4, colors: ["#2f8f2c", "#57b64a", "#e9f4c0"] } },
  lemon: { model: lemon },
  // lassi de manga
  yogurt: { model: () => tub("IOGURTE", "#2a8199", "#bfe6f7"), tint: "#fffbf0" },
  milk: { model: () => carton("LEITE", "#3f8fd0", "#3f8fd0"), tint: "#ffffff" },
  honey: { model: BOTTLES.honey, tint: "#e89a10", piece: drop("#f0a818", { emissive: "#c87a00", emissiveIntensity: 0.25 }) },
  cardamom: { model: BOTTLES.cardamom, tint: "#93b060" },
  ice: { model: icePile, tint: "#dff4ff", solid: true, piece: iceCube },
  // tiramisù
  espresso: { model: espresso, tint: "#2e1508" },
  ladyfingers: { model: ladyfingerPack, tint: "#f2d28c" },
  mascarpone: { model: () => tub("MASCARPONE", "#c8352a", "#f2c14a"), tint: "#fff6dc" },
  cream: { model: () => carton("CREME", "#e5484d", "#e5484d"), tint: "#fffaf0" },
  sugar: { model: () => sack("AÇÚCAR", "#e5484d"), tint: "#ffffff", solid: true, melts: true, piece: drop("#ffffff", { roughness: 1, clearcoat: 0, bumpMap: tex("powder"), bumpScale: 3 }) },
  cocoa: { model: () => tin("CACAU", "#5a2a12", "#7a3a1a"), tint: "#5a2a12" },
  // caipirinha
  cachaca: { model: BOTTLES.cachaca, tint: "#f6f2cc" },
};

// O ingrediente `id` como modelo de feira, com sombra.
export function stock(id) {
  const entry = PANTRY[id];
  if (!entry) throw new Error(`Ingrediente sem modelo: ${id}`);
  const m = entry.model();
  castAll(m);
  return m;
}
// O que cai quando o ingrediente vai para o copo, a tigela ou o liquidificador.
export function piece(id) {
  const m = (PANTRY[id].piece ?? drop(PANTRY[id].tint))();
  castAll(m);
  return m;
}

/* ---------- Pizza ----------
   Um modelo só, da bola de massa à pizza assada: `flatten`, `cook` e as camadas por cima. */
export function pizza() {
  const g = new THREE.Group(), R = 1.3;
  const doughMat = food({ color: "#f5e3b9", roughness: 0.85, clearcoat: 0.05, bumpMap: tex("powder"), bumpScale: 1 });
  const base = mesh(new THREE.LatheGeometry([V2(0, 0), V2(R * 0.96, 0), V2(R, 0.05), V2(R, 0.11), V2(R * 0.95, 0.17), V2(R * 0.86, 0.16), V2(R * 0.8, 0.09), V2(0, 0.08)], 64), doughMat);
  base.receiveShadow = true;
  const top = new THREE.Group(); // molho, queijo, folhas e cortes
  g.add(base, top);
  const raw = C("#f5e3b9"), gold = C("#e3a64e"), burnt = C("#5a3418"), cheese = [];
  Object.assign(g.userData, {
    R, top, cheese,
    face: { y: 0.092, r: R * 0.8 }, // onde o molho e a cobertura encostam
    // 0 = bola de massa, 1 = disco aberto
    // devolve a altura da massa, para o rolo apoiar em cima
    flatten(k) {
      const w = 0.42 + 0.58 * k, h = 1 + 4.6 * (1 - k) ** 1.5;
      base.scale.set(w, h, w);
      top.visible = k > 0.99;
      return 0.17 * h;
    },
    // 0 = crua, 1 = no ponto, acima disso vai queimando
    ready(k) {
      const over = Math.max(0, k - 1) * 2.5;
      doughMat.color.copy(raw).lerp(gold, Math.min(1, k)).lerp(burnt, Math.min(1, over));
      doughMat.clearcoat = 0.05 + Math.min(1, k) * 0.35;
      base.scale.y = 1 + Math.min(1, k) * 0.3; // a borda cresce
      for (const c of cheese) { // a muçarela derrete e doura
        const m = Math.min(1, k);
        c.scale.set(1 + m * 0.22, 1 - m * 0.55, 1 + m * 0.22); // espalha pouco: o molho continua aparecendo
        c.userData.mat.color.set("#fffdf5").lerp(C("#ffe9a8"), m).lerp(burnt, Math.min(1, over) * 0.7);
      }
    },
  });
  return g;
}
