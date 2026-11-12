// Despensa: os ingredientes de todas as receitas e o que cada um vira quando cai num
// copo, vai para a tábua ou é despejado. Mesmo estilo do kit: formas cheinhas, sem contorno.
import {
  THREE, RoundedBoxGeometry, mergeGeometries, build, bottle, saltPepper, labelTexture, mesh, food, glossy,
  paint, canvasTex, tex, rgb, mix, fbm, sstep, seeded, V2, castAll, hash, colorize, normals, limb,
} from "./kit.js";
import { model } from "./models.js";

const TAU = Math.PI * 2;

const cache = {};
const once = (key, make) => cache[key] ??= make();
const C = (hex) => new THREE.Color(hex);

/* ---------- Texturas ---------- */
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
export function packTex(text, bg, band) { // embalagem de papel: faixa colorida com o nome
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
// Folha de verdade (manjericão, hortelã): fina no pé, barriga a 40%, ponta fina; concha e arco.
// Nasce no pecíolo, em z = 0, e cresce para +z.
function leafGeo(L, W, cup, arch) {
  const geo = new THREE.PlaneGeometry(1, 1, 8, 18), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) * 2, v = p.getY(i) + 0.5;
    const w = W * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.75)), 0.8);
    p.setXYZ(i, u * w, cup * u * u * w + arch * L * (Math.sin(Math.PI * v) * 0.5 - v * v * 0.6), v * L);
  }
  return normals(geo);
}
// Nervura central e laterais: claras na cor, fundas no relevo (o "acolchoado" entre elas).
function veins(x, color, k) {
  x.strokeStyle = color; x.lineCap = "round";
  x.lineWidth = 5 * k; x.beginPath(); x.moveTo(64, 256); x.lineTo(64, 6); x.stroke();
  x.lineWidth = 2.2 * k; x.globalAlpha = k > 1 ? 0.85 : 0.45;
  for (let i = 0; i < 6; i++) {
    const y0 = 232 - i * 36;
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(64, y0); x.quadraticCurveTo(64 + s * 30, y0 - 20, 64 + s * 62, y0 - 50); x.stroke(); }
  }
  x.globalAlpha = 1;
}
const veinBump = () => once("veinBump", () => canvasTex(128, 256, (x) => {
  x.fillStyle = "#c8c8c8"; x.fillRect(0, 0, 128, 256);
  x.shadowColor = "#000"; x.shadowBlur = 6;
  veins(x, "#383838", 1.6);
}));
const leafMat = (base, tip, vein) => once(`leaf-${base}`, () => food({
  map: canvasTex(128, 256, (x) => {
    const gr = x.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, base); gr.addColorStop(1, tip);
    x.fillStyle = gr; x.fillRect(0, 0, 128, 256);
    const e = x.createLinearGradient(0, 0, 128, 0); // borda um pouco mais escura
    e.addColorStop(0, "rgba(10,50,10,.35)"); e.addColorStop(0.25, "rgba(10,50,10,0)"); e.addColorStop(0.75, "rgba(10,50,10,0)"); e.addColorStop(1, "rgba(10,50,10,.35)");
    x.fillStyle = e; x.fillRect(0, 0, 128, 256);
    veins(x, vein, 1);
  }),
  bumpMap: veinBump(), bumpScale: 1.4, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2,
}));
const BASIL = () => leafMat("#23802c", "#38a040", "#6cbf58");
const MINT = () => leafMat("#3caa48", "#62c456", "#8fd878");
const leaf = (L, mat) => mesh(once(`leafGeo${L}`, () => leafGeo(L, L * 0.36, 0.55, 0.12)), mat);
const CILANTRO_LEAF = () => once("cilantroLeaf", () => new THREE.SphereGeometry(1, 8, 6).scale(0.12, 0.03, 0.14));

// Embalagens do Blender (packs.glb, leva 7): o formato vem de lá, o rótulo é pintado aqui e as
// peças de `tints` (saem quase brancas do Blender) ganham a cor do ingrediente. Os materiais são
// feitos uma vez por ingrediente e divididos entre as cópias da feira.
function pack(kind, text, label, tints = {}) {
  const g = model("packs", (n) => n === kind || n.startsWith(`${kind}_`));
  const mats = once(`pack-${kind}-${text}`, () => {
    const map = label();
    map.flipY = false; // UV do glTF: v cresce para baixo
    const m = { [`${kind}_label`]: new THREE.MeshStandardMaterial({ map, roughness: 0.6 }) };
    for (const c of g.children) {
      if (!tints[c.name]) continue;
      m[c.name] = c.material.clone();
      m[c.name].color.set(tints[c.name]);
    }
    return m;
  });
  for (const c of g.children) if (mats[c.name]) c.material = mats[c.name];
  return g;
}
const tub = (text, band, lid) => pack("tub", text, () => labelTexture(text, band, band), { tub_lid: lid }); // pote com tampa de alumínio
const carton = (text, band) => pack("carton", text, () => packTex(text, "#fffaf0", band), { carton_roof: band }); // caixinha com telhadinho
const sack = (text, band) => pack("sack", text, () => packTex(text, "#fff6e6", band)); // saco de papel kraft
const tin = (text, band, body) => pack("tin", text, () => labelTexture(text, band, band), { tin: body }); // lata de tampa de alavanca

/* ---------- Ingredientes ---------- */
// Manga (inteira e a banda em cubinhos) e limão (inteiro e a metade) vêm do Blender, por
// ./models.js; os procedurais antigos estão em ./archive/procedural.js.
export const mango = () => model("mango");
export const lime = () => model("lime");
export function lemon() {
  const g = new THREE.Group(), skin = food({ color: "#ffd53a", roughness: 0.45, clearcoat: 0.7, bumpMap: tex("speckle"), bumpScale: 0.5 });
  const prof = [V2(0, -0.66), V2(0.08, -0.6), V2(0.32, -0.42), V2(0.46, -0.14), V2(0.48, 0.1), V2(0.4, 0.38), V2(0.2, 0.56), V2(0.07, 0.63), V2(0, 0.65)];
  const fruit = mesh(new THREE.LatheGeometry(prof, 36), skin);
  fruit.rotation.z = Math.PI / 2; fruit.position.y = 0.47;
  g.add(fruit);
  return g;
}
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
// Maço de manjericão: cada talo com um par de folhas grandes e um par menor cruzado em cima.
export function basil() {
  const g = new THREE.Group(), rand = seeded(5), stalk = food({ color: "#76ad4c", roughness: 0.5 });
  const add = (L, at, yaw, pitch) => {
    const l = leaf(L, BASIL()); l.position.copy(at); l.rotation.order = "YXZ"; l.rotation.set(-pitch, yaw, 0);
    g.add(l);
  };
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * TAU, base = new THREE.Vector3(Math.cos(a) * 0.06, 0, Math.sin(a) * 0.06);
    const top = new THREE.Vector3(Math.cos(a) * (0.22 + rand() * 0.12), 0.95 + rand() * 0.3, Math.sin(a) * (0.22 + rand() * 0.12));
    g.add(mesh(limb(base, top, 0.03, 0.022, 8), stalk));
    const twist = rand() * TAU, mid = base.clone().lerp(top, 0.72);
    for (const s of [0, Math.PI]) add(0.62, mid, twist + s, 0.35);
    for (const s of [0, Math.PI]) add(0.44, top, twist + Math.PI / 2 + s, 0.85);
    add(0.2, top.clone().add(new THREE.Vector3(0, 0.03, 0)), twist, 1.3); // brotinho
  }
  const tie = mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 20), glossy({ color: "#e5484d" }));
  tie.rotation.x = Math.PI / 2; tie.position.y = 0.35;
  g.add(tie);
  return g;
}
export const cilantro = () => bunch(CILANTRO_LEAF(), "#55b53c", 46, 9);
// Folha solta (vai para a pizza), centrada no próprio meio.
export function basilLeaf() {
  const l = leaf(0.62, BASIL()); l.position.set(0, 0.03, -0.31);
  const w = new THREE.Group(); w.add(l);
  return w;
}

// Cobertura do lassi, em raio 1 (o copo escala pela boca): espuma em espiral com pintas de
// açafrão e pistache, cubinhos de manga e um raminho de hortelã. `tint` puxa a espuma para a cor da bebida.
const foamTex = () => once("lassiFoam", () => paint(256, (u, v) => {
  const s = 0.5 + 0.5 * Math.sin(TAU * (u + v * 2.2)), a = [255, 236, 200], b = [255, 250, 236];
  const h = hash(Math.floor(u * 300), Math.floor(v * 90));
  if (h > 0.992) return [232, 104, 26]; // açafrão
  if (h > 0.982) return [122, 154, 58]; // pistache e cardamomo
  return a.map((x, i) => x + (b[i] - x) * sstep(0.3, 0.8, s));
}));
export function lassiTop() {
  const g = new THREE.Group(), foamMat = food({ map: foamTex(), roughness: 0.55, clearcoat: 0.3 });
  g.add(mesh(new THREE.LatheGeometry([V2(1, 0), V2(0.88, 0.12), V2(0.6, 0.26), V2(0.25, 0.34), V2(0, 0.35)], 48), foamMat));
  const mango = glossy({ color: "#ffb52e", roughness: 0.25 });
  [[0.32, 0.05, 0.14], [-0.05, 0.14, 0.32], [0.14, 0.3, 0.18]].forEach(([x, y, z], i) => {
    const m = mesh(new RoundedBoxGeometry(0.38, 0.38, 0.38, 3, 0.09), mango);
    m.position.set(x, 0.33 + y, z); m.rotation.set(i, i * 0.7, 0.3);
    g.add(m);
  });
  const mint = once("mintLeaf", () => leafGeo(0.75, 0.33, 0.6, 0.15));
  [0, 2.1, 4.2].forEach((yaw, i) => {
    const l = mesh(mint, MINT()); l.rotation.order = "YXZ"; l.rotation.set(-0.45, yaw + 0.5, 0);
    l.position.set(-0.28, 0.45 + i * 0.05, -0.1);
    g.add(l);
  });
  const white = C("#ffffff");
  g.userData.tint = (color) => foamMat.color.copy(white).lerp(color, 0.25);
  return g;
}

/* ---------- Tomate ----------
   Casca bem brilhante com gomos, cálice em estrela e a metade cortada com gel e sementes:
   é o corte que faz ler "tomate" de longe. */
function lobed(geo, R, ys) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = y / R, k = 1 + 0.035 * Math.cos(5 * Math.atan2(z, x)) * (1 - n * n);
    const d2 = (x * k) ** 2 + (z * k) ** 2;
    p.setXYZ(i, x * k, y * ys + (y > 0 ? -0.1 * Math.exp(-d2 / 0.04) : 0.05 * Math.exp(-d2 / 0.05)), z * k); // covinhas em cima e embaixo
  }
  const red = C("#e0301c"), orange = C("#f2662a"), dark = C("#b81f12");
  colorize(geo, (c, x, y, z) => {
    const n = y / (R * ys);
    c.copy(red).lerp(orange, sstep(0.55, 0.95, n) * 0.55).lerp(dark, sstep(-0.2, -0.95, n) * 0.35);
    c.multiplyScalar(0.92 + 0.16 * fbm(x * 4 + 3, z * 4 + y * 3));
  });
  return normals(geo);
}
function calyx() {
  const parts = [];
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.PlaneGeometry(1, 1, 2, 6), p = geo.attributes.position;
    for (let j = 0; j < p.count; j++) {
      const u = p.getX(j) * 2, v = p.getY(j) + 0.5, w = 0.07 * Math.pow(1 - v, 0.7) + 0.01;
      p.setXYZ(j, u * w, 0.02 - 0.14 * v * v + 0.02 * u * u, v * 0.32);
    }
    parts.push(geo.rotateY(i / 5 * TAU + 0.3));
  }
  const mat = food({ color: "#3d8a2e", roughness: 0.45, clearcoat: 0.5 }), g = new THREE.Group();
  g.add(mesh(normals(mergeGeometries(parts)), mat), mesh(limb(new THREE.Vector3(), new THREE.Vector3(0.03, 0.16, 0.01), 0.035, 0.025, 8), mat));
  return g;
}
const cutTex = () => once("tomatoCut", () => canvasTex(512, 512, (x) => {
  const c = 256, R = 250, rand = seeded(3);
  x.fillStyle = "#c92415"; x.beginPath(); x.arc(c, c, R, 0, TAU); x.fill(); // casca
  x.fillStyle = "#e8442a"; x.beginPath(); x.arc(c, c, R * 0.94, 0, TAU); x.fill(); // polpa
  for (let k = 0; k < 5; k++) { // lóculos com gel e sementes
    const a = (k + 0.5) / 5 * TAU, lx = c + Math.cos(a) * R * 0.5, ly = c + Math.sin(a) * R * 0.5;
    const gel = x.createRadialGradient(lx, ly, 4, lx, ly, R * 0.3);
    gel.addColorStop(0, "#ffc070"); gel.addColorStop(0.7, "#f79a48"); gel.addColorStop(1, "#ef6a36");
    x.fillStyle = gel; x.beginPath(); x.ellipse(lx, ly, R * 0.3, R * 0.2, a, 0, TAU); x.fill();
    x.fillStyle = "#f8e08e"; x.strokeStyle = "#d89a3e"; x.lineWidth = 2;
    for (let s = 0; s < 8; s++) {
      const t = rand() * TAU, d = Math.sqrt(rand()) * 0.75;
      x.beginPath(); x.ellipse(lx + Math.cos(t) * R * 0.22 * d, ly + Math.sin(t) * R * 0.13 * d, 9, 6, a + rand(), 0, TAU); x.fill(); x.stroke();
    }
  }
  const core = x.createRadialGradient(c, c, 0, c, c, R * 0.24); // miolo
  core.addColorStop(0, "#f8c8ac"); core.addColorStop(1, "rgba(236,90,60,0)");
  x.fillStyle = core; x.beginPath(); x.arc(c, c, R * 0.24, 0, TAU); x.fill();
}));
export function tomato() {
  const g = new THREE.Group(), R = 0.62, ys = 0.8, skin = food({ vertexColors: true, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 });
  const whole = mesh(lobed(new THREE.SphereGeometry(R, 72, 48), R, ys), skin);
  whole.position.set(-0.45, R * ys, 0);
  const cx = calyx(); cx.position.set(-0.45, R * ys * 2 - 0.08, 0);
  const r = 0.55, half = new THREE.Group(); // metade cortada, com o corte para cima
  const dome = mesh(lobed(new THREE.SphereGeometry(r, 64, 24, 0, TAU, 0, Math.PI / 2), r, ys), skin);
  dome.rotation.x = Math.PI;
  const face = mesh(new THREE.CircleGeometry(r, 64).rotateX(-Math.PI / 2), food({ map: cutTex(), roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }));
  face.position.y = 0.002;
  half.add(dome, face);
  half.rotation.set(0.35, 0.4, 0.25); half.position.set(0.75, r * ys * 0.95, 0.15);
  g.add(whole, cx, half);
  return g;
}
// Molho de tomate na feira: o vidro com um tomate e meio do lado, para ler o que tem dentro.
function tomatoSauce() {
  const g = new THREE.Group(), jar = BOTTLES.tomato(), t = tomato();
  t.scale.setScalar(0.55); t.position.set(0.95, 0, 0.35);
  g.add(jar, t);
  return g;
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
// Poça de muçarela: contorno irregular, borda amarelada e pintas tostadas pintadas na malha.
function mozzaPool(seed) {
  const geo = new THREE.SphereGeometry(0.3, 32, 16), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.5 * (fbm(x * 5 + seed, z * 5 - seed, 3) - 0.5);
    p.setXYZ(i, x * k, y < 0 ? y * 0.15 : y * 0.28, z * k);
  }
  const cream = C("#fff7e4"), brown = C("#e6ae52"), edge = C("#f6e2a6");
  colorize(geo, (c, x, y, z) => {
    c.copy(cream).lerp(edge, sstep(0.17, 0.34, Math.hypot(x, z)) * 0.6);
    c.lerp(brown, sstep(0.6, 0.72, fbm(x * 7 + seed, z * 7)) * sstep(0.02, 0.08, y) * 0.85);
  });
  return normals(geo);
}
let mozzaSeed = 0;
export function mozzaSlice() { // com material próprio: ela derrete no forno
  const m = mesh(mozzaPool((mozzaSeed++ % 7) * 3.1), food({ color: "#fffdf5", vertexColors: true, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.2, sheen: 0.5, sheenColor: C("#fff") }));
  const g = new THREE.Group(); g.add(m);
  g.userData.mat = m.material;
  return g;
}
function cheddar() {
  const tri = new THREE.Shape([V2(0, 0), V2(1.2, 0), V2(0, 0.7)]);
  const m = mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4 }), food({ color: "#ffab1f", roughness: 0.4, clearcoat: 0.6 }));
  m.rotation.x = -Math.PI / 2; m.position.set(-0.5, 0.05, 0.3);
  const g = new THREE.Group(); g.add(m);
  return g;
}

const BOTTLES = {
  oliveOil: () => bottle({ glass: "#c8dc8a", fill: "#c2b52a", cap: "#2a1a10", text: "AZEITE", band: "#4a6a1a", ink: "#3a4a1a" }),
  cachaca: () => bottle({ size: 0.97, glass: "#e6f4e0", fill: "#f6f2cc", cap: "#2a8199", text: "CACHAÇA", band: "#2f7a44", ink: "#2f5a3a" }),
  honey: () => bottle({ shape: "jar", size: 0.92, fill: "#e89a10", cap: "#ffd23f", text: "MEL", band: "#b86a10", ink: "#7a4a10" }),
  ketchup: () => bottle({ size: 0.88, fill: "#c8201a", cap: "#fffaf0", text: "KETCHUP", band: "#7a1410", ink: "#7a1410" }),
  tomato: () => bottle({ shape: "jar", fill: "#d02a1c", cap: "#d9b46a", text: "MOLHO", band: "#2f7a44", ink: "#7a2a1a" }),
  cardamom: () => bottle({ shape: "spice", fill: "#93b060", cap: "#3a7a4a", text: "CARDAMOMO", band: "#3a7a4a", ink: "#3a5a2a" }),
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
  garlic: { model: build.garlic, tint: "#fbf3dc", chop: { model: build.cloves, size: 1.25, colors: ["#fff1c4", "#f0d892", "#fffaf0"] } },
  ginger: { model: build.ginger, tint: "#f6dc86", chop: { size: 1.35, colors: ["#f6dc86", "#e9c45c", "#fff1b8"] } },
  cornstarch: { model: build.cornstarch, tint: "#fffdf6" }, // a mesma tigela da bancada
  rice: { model: () => build.rice(), tint: "#fffcf4" },
  shrimp: { model: build.shrimp }, tofu: { model: build.tofu }, carrot: { model: build.carrot },
  mushroom: { model: build.mushroom }, teriyaki: { model: build.teriyaki },
  // pizza
  dough: { model: doughBall, tint: "#f5e3b9" },
  tomato: { model: tomatoSauce, tint: "#d02a1c" },
  mozzarella: { model: mozzarella, tint: "#fffdf5", piece: mozzaSlice },
  basil: { model: basil, tint: "#2f9a3a", piece: basilLeaf },
  oliveOil: { model: BOTTLES.oliveOil, tint: "#c2b52a" },
  seasoning: { model: saltPepper, tint: "#fffaf0" },
  cheddar: { model: cheddar }, ketchup: { model: BOTTLES.ketchup },
  // frango com salsa de manga
  chicken: { model: chickenTray, tint: "#f0a898" },
  mango: { model: mango, tint: "#ffb52e", solid: true, piece: () => cubes(["#ffb52e", "#ffc94a", "#f79a1a"]), chop: { size: 1.5, colors: ["#ffb52e", "#ffc94a", "#f79a1a"], model: () => model("mango", (n) => !n.includes("cheek")) } },
  onion: { model: redOnion, tint: "#b5477f", solid: true, piece: () => cubes(["#c8689a", "#f6e6f0", "#a03a72"], 6, 0.13), chop: { size: 1.15, colors: ["#c8689a", "#f6e6f0", "#a03a72"] } },
  cilantro: { model: cilantro, tint: "#55b53c", solid: true, piece: () => cubes(["#55b53c", "#3f9a34", "#7fd060"], 8, 0.09), chop: { size: 1.35, colors: ["#55b53c", "#3f9a34", "#7fd060"] } },
  lime: { model: lime, tint: "#cfe88a", solid: true, piece: limeWedge },
  jalapeno: { model: jalapeno, tint: "#2f8f2c", solid: true, piece: () => cubes(["#2f8f2c", "#57b64a", "#e9f4c0"], 6, 0.1), chop: { size: 1.4, colors: ["#2f8f2c", "#57b64a", "#e9f4c0"] } },
  lemon: { model: lemon },
  // lassi de manga
  yogurt: { model: () => tub("IOGURTE", "#2a8199", "#bfe6f7"), tint: "#fffbf0" },
  milk: { model: () => carton("LEITE", "#3f8fd0"), tint: "#ffffff" },
  honey: { model: BOTTLES.honey, tint: "#e89a10", piece: drop("#f0a818", { emissive: "#c87a00", emissiveIntensity: 0.25 }) },
  cardamom: { model: BOTTLES.cardamom, tint: "#93b060" },
  ice: { model: icePile, tint: "#dff4ff", solid: true, piece: iceCube },
  // tiramisù
  espresso: { model: espresso, tint: "#2e1508" },
  ladyfingers: { model: ladyfingerPack, tint: "#f2d28c" },
  mascarpone: { model: () => tub("MASCARPONE", "#c8352a", "#f2c14a"), tint: "#fff6dc" },
  cream: { model: () => carton("CREME", "#e5484d"), tint: "#fffaf0" },
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
// Borda assada: dourada, com manchas de leopardo tostadas e pintinhas. Periódica em u, sem emenda.
const crustTex = () => once("crust", () => paint(512, (u, v) => {
  const cream = [244, 226, 180], gold = [224, 160, 76], toast = [176, 106, 44], char = [58, 28, 12];
  const zone = sstep(0.25, 0.35, v) * (1 - sstep(0.62, 0.72, v)); // só a borda; o fundo fica pálido
  const m = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
  let c = m(cream, gold, sstep(0.15, 0.45, v) * (1 - sstep(0.62, 0.78, v)));
  const n = fbm(Math.cos(TAU * u) * 10 + v * 13, Math.sin(TAU * u) * 10 - v * 7, 3);
  c = m(c, toast, sstep(0.58, 0.66, n) * zone);
  c = m(c, char, sstep(0.68, 0.73, n) * zone);
  if (hash(Math.floor(u * 260), Math.floor(v * 70)) > 0.982) c = m(c, char, 0.7 * zone);
  return c;
}));
// Disco com a borda estufada de forma irregular, como massa de verdade. Miolo em y = 0.08.
function crustGeo(R) {
  const geo = new THREE.LatheGeometry([V2(0, 0.08), V2(R * 0.76, 0.08), V2(R * 0.8, 0.095), V2(R * 0.84, 0.15), V2(R * 0.9, 0.21), V2(R * 0.96, 0.21),
    V2(R, 0.15), V2(R * 1.01, 0.07), V2(R * 0.98, 0.01), V2(R * 0.9, 0), V2(0, 0)], 160), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), th = Math.atan2(z, x), rim = sstep(R * 0.74, R * 0.86, Math.hypot(x, z));
    const b = fbm(Math.cos(th) * 4 + 9, Math.sin(th) * 4 + 9, 3) - 0.5, b2 = fbm(Math.cos(th) * 11 + 3, Math.sin(th) * 11 + 3, 2) - 0.5;
    const kr = 1 + rim * b * 0.05;
    p.setXYZ(i, x * kr, y * (1 + rim * (b * 1.1 + b2 * 0.6)), z * kr);
  }
  return normals(geo);
}
export function pizza() {
  const g = new THREE.Group(), R = 1.3, geo = crustGeo(R);
  const doughMat = food({ color: "#f5e3b9", roughness: 0.85, clearcoat: 0.05, bumpMap: tex("powder"), bumpScale: 1 });
  const base = mesh(geo, doughMat);
  base.receiveShadow = true;
  // O assado por cima da massa crua: aparece aos poucos no forno.
  const bakedMat = food({ map: crustTex(), bumpMap: crustTex(), bumpScale: 1.2, roughness: 0.75, clearcoat: 0.1, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  const baked = mesh(geo, bakedMat);
  baked.visible = false; baked.castShadow = false;
  base.add(baked);
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
      return 0.21 * h;
    },
    // 0 = crua, 1 = no ponto, acima disso vai queimando
    ready(k) {
      const over = Math.max(0, k - 1) * 2.5;
      doughMat.color.copy(raw).lerp(gold, Math.min(1, k)).lerp(burnt, Math.min(1, over));
      doughMat.clearcoat = 0.05 + Math.min(1, k) * 0.35;
      bakedMat.opacity = Math.min(1, k); baked.visible = k > 0.01;
      bakedMat.color.set("#ffffff").lerp(burnt, Math.min(1, over) * 0.8);
      base.scale.y = 1 + Math.min(1, k) * 0.3; // a borda cresce
      top.position.y = 0.08 * (base.scale.y - 1); // e a cobertura sobe junto com o miolo
      for (const c of cheese) { // a muçarela derrete e doura
        const m = Math.min(1, k);
        c.scale.set(1 + m * 0.22, 1 - m * 0.55, 1 + m * 0.22); // espalha pouco: o molho continua aparecendo
        c.userData.mat.color.set("#fffdf5").lerp(C("#ffe9a8"), m).lerp(burnt, Math.min(1, over) * 0.7);
      }
    },
  });
  return g;
}
