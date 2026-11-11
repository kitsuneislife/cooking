// Kit de modelos 3D: comida, utensílios e estações, no estilo "brinquedo macio".
// Regras do estilo: sem contorno, formas cheinhas, textura pintada leve,
// comida com brilho úmido, metal e esmalte com reflexo limpo.
// Tudo é gerado em código (sem arquivos de modelo): texturas pintadas num <canvas>.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export { THREE, RoundedBoxGeometry, mergeGeometries };

/* ---------- Ruído e texturas pintadas ---------- */
export function hash(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, oct = 4) {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f); n += a; f *= 2.03; a *= 0.5; }
  return s / n;
}
export const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
// Gerador pseudoaleatório com semente: o mesmo modelo sai sempre igual.
export const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export function paint(size, px, { srgb = true, repeat = 1 } = {}) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const ctx = c.getContext("2d"), img = ctx.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const p = px(i / size, j / size), k = (j * size + i) * 4;
    img.data[k] = p[0]; img.data[k + 1] = p[1]; img.data[k + 2] = p[2]; img.data[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

const TEX = {
  rawBeef: () => {
    const lo = rgb("#b5202f"), hi = rgb("#e9586a"), fat = rgb("#ffe0da");
    return paint(256, (u, v) => {
      let c = mix(lo, hi, fbm(u * 5, v * 5));
      const m = Math.abs(fbm(u * 3 + 7, v * 7, 5) - 0.5); // veios de gordura
      c = mix(c, fat, (1 - sstep(0.008, 0.05, m)) * 0.45);
      c = mix(c, fat, sstep(0.82, 0.9, fbm(u * 22, v * 22, 2)) * 0.5); // pintinhas
      return c;
    }, { repeat: 0.42 });
  },
  searedBeef: () => {
    const lo = rgb("#5e2614"), mid = rgb("#9a4a26"), hi = rgb("#c77a45");
    return paint(256, (u, v) => {
      const n = fbm(u * 6, v * 6);
      let c = n < 0.5 ? mix(lo, mid, n * 2) : mix(mid, hi, (n - 0.5) * 2);
      const grill = (((u + v) * 4.2) % 1 + 1) % 1; // marcas da chapa
      return mix(c, rgb("#3a160a"), (1 - sstep(0.06, 0.13, Math.abs(grill - 0.5))) * 0.8);
    }, { repeat: 0.42 });
  },
  floret: () => {
    const a = rgb("#2d7a26"), b = rgb("#6cc24a"), dark = rgb("#1f5419");
    return paint(256, (u, v) => mix(mix(a, b, fbm(u * 8, v * 8)), dark, sstep(0.6, 0.75, fbm(u * 40, v * 40, 2)) * 0.6));
  },
  stem: () => paint(128, (u, v) => mix(rgb("#9ccc63"), rgb("#d4ecaa"), fbm(u * 18, v * 2, 3))),
  wood: () => {
    const a = rgb("#b8723c"), b = rgb("#e9b27a");
    return paint(256, (u, v) => mix(a, b, 0.5 + 0.5 * Math.sin(v * 70 + fbm(u * 3, v * 3) * 9)));
  },
  speckle: () => {
    const a = rgb("#2b2733"), b = rgb("#4a4456");
    return paint(256, (u, v) => {
      const c = mix(a, b, fbm(u * 10, v * 10));
      return hash(Math.floor(u * 160), Math.floor(v * 160)) > 0.93 ? mix(c, rgb("#9a94a8"), 0.6) : c;
    });
  },
  brushed: () => paint(256, (u, v) => { const g = 120 + fbm(u * 2, v * 90, 3) * 90; return [g, g, g]; }, { srgb: false }),
  gingham: () => {
    const w = rgb("#fff1f0"), mid = rgb("#f7a9b4"), full = rgb("#ee7186");
    return paint(256, (u, v) => {
      const a = (u * 8) % 1 < 0.5, b = (v * 8) % 1 < 0.5;
      const c = a && b ? full : a || b ? mid : w;
      return mix(c, [255, 255, 255], (fbm(u * 120, v * 120, 2) - 0.5) * 0.25);
    });
  },
  ginger: () => {
    const a = rgb("#c08a4a"), b = rgb("#e8c08a"), ring = rgb("#8a5a2c");
    return paint(256, (u, v) => {
      const c = mix(a, b, fbm(u * 6, v * 6));
      const r = Math.abs(((v * 12 + fbm(u * 5, v * 5) * 2.5) % 1) - 0.5); // anéis da casca
      return mix(c, ring, (1 - sstep(0.01, 0.06, r)) * 0.3);
    });
  },
  garlic: () => {
    const w = rgb("#fbf5ea"), cream = rgb("#efe2c8"), purple = rgb("#c48aac");
    return paint(256, (u, v) => {
      const c = mix(w, cream, fbm(u * 12, v * 4) * 0.7);
      const streak = sstep(0.55, 0.75, fbm(u * 36, v * 2.5, 3)); // riscas roxas perto da base
      return mix(c, purple, streak * (1 - sstep(0.15, 0.6, v)) * 0.75);
    });
  },
  powder: () => paint(256, (u, v) => {
    const g = 238 + fbm(u * 14, v * 14) * 17 - (hash(Math.floor(u * 200), Math.floor(v * 200)) > 0.96 ? 30 : 0);
    return [g, g - 2, g - 6];
  }),
  weave: () => { // vime trançado: fileiras de tiras desencontradas
    const lo = rgb("#8a5426"), mid = rgb("#c98b45"), hi = rgb("#e8b878");
    return paint(256, (u, v) => {
      const row = Math.floor(v * 10), cx = (u * 16 + (row % 2) * 0.5) % 1, cy = (v * 10) % 1;
      const edge = Math.min(cx, 1 - cx, cy * 1.6, (1 - cy) * 1.6);
      const c = mix(lo, mix(mid, hi, Math.sin(cy * Math.PI)), sstep(0.02, 0.2, edge));
      return mix(c, lo, (fbm(u * 30, v * 30, 2) - 0.5) * 0.5);
    });
  },
  ridges: () => paint(64, (u) => { const g = 128 + 127 * Math.sin(u * Math.PI * 2 * 24); return [g, g, g]; }, { srgb: false }),
  shiitake: () => { // chapéu marrom com rachaduras claras
    const lo = rgb("#5a3218"), hi = rgb("#8a5530"), crack = rgb("#e8d2b0");
    return paint(256, (u, v) => {
      const c = mix(lo, hi, fbm(u * 6, v * 6));
      const m = Math.abs(fbm(u * 9 + 3, v * 9, 4) - 0.5);
      return mix(c, crack, (1 - sstep(0.01, 0.035, m)) * 0.7);
    });
  },
  shrimp: () => { // listras do camarão cozido
    const a = rgb("#ff8a5c"), b = rgb("#ffd0b0");
    return paint(256, (u, v) => mix(a, b, 0.35 + 0.35 * Math.sin(u * 60) + (fbm(u * 8, v * 8) - 0.5) * 0.4));
  },
  carrot: () => paint(128, (u, v) => {
    const c = mix(rgb("#f07a1a"), rgb("#ffa63d"), fbm(u * 4, v * 30, 3));
    return mix(c, rgb("#c85a0a"), (1 - sstep(0.02, 0.08, Math.abs(((v * 14) % 1) - 0.5))) * 0.35);
  }),
  riceBowl: () => canvasTex(512, 256, (x) => {
    const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#e3ebf3");
    x.fillStyle = gr; x.fillRect(0, 0, 512, 256);
    x.strokeStyle = "#2f5f9a"; x.lineWidth = 7;
    for (const y of [62, 132]) { x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke(); }
    x.lineWidth = 4;
    for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(21 + i * 42.67, 97, 14, 0, Math.PI * 2); x.stroke(); }
    x.lineWidth = 3; x.beginPath(); x.moveTo(0, 160); x.lineTo(512, 160); x.stroke();
  }),
};
const cache = {};
export const tex = (k) => cache[k] ??= TEX[k]();

function labelTexture(text, band, ink) {
  return canvasTex(512, 256, (x) => {
    const gr = x.createLinearGradient(0, 0, 512, 0);
    gr.addColorStop(0, "#e2d4ba"); gr.addColorStop(0.5, "#fffaf0"); gr.addColorStop(1, "#e2d4ba");
    x.fillStyle = gr; x.fillRect(0, 0, 512, 256);
    x.fillStyle = band; x.fillRect(0, 30, 512, 80);
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `400 ${text.length > 7 ? 50 : 60}px "Lilita One", sans-serif`;
    x.fillText(text, 256, 74);
    x.fillStyle = ink; x.globalAlpha = 0.45;
    for (let i = 0; i < 3; i++) { x.beginPath(); x.roundRect(120 + i * 22, 145 + i * 30, 272 - i * 44, 13, 6); x.fill(); }
  });
}

/* ---------- Materiais: macios, sem contorno ---------- */
export const food = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.4, side: THREE.DoubleSide, ...o });
export const glossy = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, side: THREE.DoubleSide, ...o });
export const metal = (o) => new THREE.MeshStandardMaterial({ metalness: 0.9, roughness: 0.28, side: THREE.DoubleSide, ...o });
export const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
export const V2 = (x, y) => new THREE.Vector2(x, y);
export const woodMat = () => food({ map: tex("wood"), roughness: 0.5, clearcoat: 0.3 });
export const rawBeefMat = () => food({ map: tex("rawBeef"), bumpMap: tex("rawBeef"), bumpScale: 1.5, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.3 });
export const searedMat = () => food({ map: tex("searedBeef"), bumpMap: tex("searedBeef"), bumpScale: 2, roughness: 0.4, clearcoat: 0.8 });

// Sombra em todos os pedaços (menos os marcados, como chamas).
export const castAll = (o) => o.traverse((c) => { if (c.isMesh && !c.userData.noShadow) c.castShadow = true; });

/* ---------- Peças reaproveitadas ---------- */
export function egg() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  for (let i = 0; i <= 40; i++) {
    const a = i / 40 * Math.PI * 2, r = 0.5 + Math.sin(a * 3) * 0.06 + Math.cos(a * 2) * 0.05;
    i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(r, 0);
  }
  const white = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.07, bevelSegments: 5, curveSegments: 6 });
  white.rotateX(-Math.PI / 2);
  g.add(mesh(white, food({ color: "#fffaf2", roughness: 0.4, sheen: 0.4 })));
  const yolk = mesh(new THREE.SphereGeometry(0.21, 32, 20), food({ color: "#ffad1f", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }));
  yolk.scale.y = 0.62; yolk.position.set(0.04, 0.08, 0.03);
  g.add(yolk);
  return g;
}

// Tigela de cerâmica: perfil único, borda arredondada.
export function bowlGeo(R, H) {
  return new THREE.LatheGeometry([V2(0, 0), V2(R * 0.45, 0), V2(R * 0.5, 0.05), V2(R * 0.86, H * 0.45), V2(R * 0.98, H * 0.88),
    V2(R, H), V2(R * 0.97, H + 0.03), V2(R * 0.93, H * 0.96), V2(R * 0.82, H * 0.5), V2(R * 0.42, H * 0.14), V2(0, H * 0.12)], 56);
}

// Prato branco com aba azul e filete dourado.
export function servingPlate() {
  const plate = new THREE.Group();
  const porcelain = new THREE.MeshPhysicalMaterial({ color: "#fdfcfa", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const well = mesh(new THREE.LatheGeometry([V2(0, 0.08), V2(1.15, 0.08), V2(1.3, 0.14)], 96), porcelain);
  const rim = mesh(new THREE.LatheGeometry([V2(1.3, 0.14), V2(1.6, 0.19), V2(1.9, 0.24), V2(1.97, 0.25)], 96), glossy({ color: "#3e4f8f", roughness: 0.25 }));
  const under = mesh(new THREE.LatheGeometry([V2(1.97, 0.25), V2(1.99, 0.22), V2(1.7, 0.1), V2(1.2, 0.02), V2(0, 0.02)], 96), porcelain);
  for (const m of [well, rim, under]) { m.receiveShadow = true; plate.add(m); }
  const gold = metal({ color: "#f0c060", roughness: 0.22 });
  for (const [r, y] of [[1.31, 0.143], [1.95, 0.25], [1.62, 0.193]]) {
    const t = mesh(new THREE.TorusGeometry(r, 0.016, 8, 128), gold);
    t.rotation.x = Math.PI / 2; t.position.y = y; plate.add(t);
  }
  return plate;
}

// Tirinha de carne: crua (lisa) ou selada (com marcas de chapa).
export function beefStrip(mat, seared = true) {
  const s = new THREE.Group();
  s.add(mesh(new RoundedBoxGeometry(0.85, 0.17, 0.3, 3, 0.08), mat));
  if (seared) {
    const mark = glossy({ color: "#2a0e04", roughness: 0.5 });
    for (const x of [-0.22, 0, 0.22]) {
      const m = mesh(new RoundedBoxGeometry(0.045, 0.012, 0.27, 1, 0.005), mark);
      m.position.set(x, 0.086, 0); m.rotation.y = 0.35;
      s.add(m);
    }
  }
  return s;
}

// Garrafa de vidro com rótulo de papel e tampa frisada.
function bottle({ r, shoulder, neckR, neckTop, glass, amber, cap, text, band, ink }) {
  const g = new THREE.Group();
  const prof = [V2(0, 0), V2(r - 0.06, 0), V2(r, 0.06), V2(r, shoulder), V2(r * 0.9, shoulder + 0.14),
    V2(neckR + 0.08, shoulder + 0.34), V2(neckR, shoulder + 0.46), V2(neckR, neckTop)];
  const glassMat = amber
    ? new THREE.MeshPhysicalMaterial({ color: glass, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide })
    : glossy({ color: glass, roughness: 0.08, clearcoatRoughness: 0.05 });
  g.add(mesh(new THREE.LatheGeometry(prof, 48), glassMat));
  if (amber) { // óleo dourado por dentro do vidro
    const level = shoulder + 0.05;
    const oil = [V2(0, 0.03), V2(r - 0.08, 0.03), V2(r - 0.04, 0.08), V2(r - 0.04, level), V2(0, level)];
    g.add(mesh(new THREE.LatheGeometry(oil, 48), glossy({ color: amber, roughness: 0.1, emissive: amber, emissiveIntensity: 0.18 })));
  }
  const arc = 3.4, h = shoulder * 0.7;
  const label = mesh(new THREE.CylinderGeometry(r + 0.006, r + 0.006, h, 40, 1, true, -arc / 2, arc),
    new THREE.MeshStandardMaterial({ map: labelTexture(text, band, ink), roughness: 0.6 }));
  label.position.y = shoulder * 0.5 + 0.03;
  g.add(label);
  const cr = neckR + 0.045;
  const capGeo = new THREE.LatheGeometry([V2(cr - 0.01, -0.01), V2(cr, 0), V2(cr, 0.26), V2(cr - 0.03, 0.3), V2(0, 0.3)], 40);
  const c = mesh(capGeo, glossy({ color: cap, bumpMap: tex("ridges"), bumpScale: 1.5 }));
  c.position.y = neckTop - 0.16;
  g.add(c);
  g.userData.mouth = new THREE.Vector3(0, neckTop, 0); // por onde o líquido sai
  return g;
}

function lumpyBlob(parts, rand, x, y, z, r) {
  const lumpy = (rr, ws, hs, px, py, pz) => { // esfera calombenta
    const geo = new THREE.SphereGeometry(rr, ws, hs), p = geo.attributes.position, o = rand() * 9;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
      const k = 1 + 0.07 * Math.sin(vx / rr * 7 + o) * Math.sin(vy / rr * 7) * Math.sin(vz / rr * 7 + o);
      p.setXYZ(i, vx * k, vy * k, vz * k);
    }
    geo.computeVertexNormals();
    parts.push(geo.translate(px, py, pz));
  };
  lumpy(r, 28, 18, x, y, z);
  for (let j = 0; j < 7; j++) {
    const th = j / 7 * Math.PI * 2 + rand(), ph = 0.45 + rand() * 0.6;
    lumpy(r * 0.45, 16, 12, x + Math.sin(ph) * Math.cos(th) * r * 0.75, y + Math.cos(ph) * r * 0.75, z + Math.sin(ph) * Math.sin(th) * r * 0.75);
  }
}

// Geometria do brócolis feita uma vez só: os floretes do wok e do prato reaproveitam.
let broccoliParts;
function broccoliGeos() {
  if (broccoliParts) return broccoliParts;
  const stem = new THREE.LatheGeometry([V2(0, -1.0), V2(0.3, -1.0), V2(0.36, -0.95), V2(0.33, -0.8), V2(0.27, -0.4), V2(0.3, 0.0), V2(0.55, 0.35), V2(0, 0.45)], 32);
  const rand = seeded(11), parts = [];
  lumpyBlob(parts, rand, 0, 1.0, 0, 0.5);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; lumpyBlob(parts, rand, Math.cos(a) * 0.55, 0.72, Math.sin(a) * 0.55, 0.4); }
  for (let i = 0; i < 6; i++) { const a = (i + 0.5) / 6 * Math.PI * 2; lumpyBlob(parts, rand, Math.cos(a) * 0.72, 0.42, Math.sin(a) * 0.72, 0.28); }
  const crown = mergeGeometries(parts);
  // oclusão pintada nos vértices: miolo e base mais escuros
  const p = crown.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const d = Math.hypot(p.getX(i), (p.getY(i) - 0.75) * 1.2, p.getZ(i));
    const ao = 0.45 + 0.55 * sstep(0.35, 1.15, d) * (0.6 + 0.4 * sstep(0.2, 1.4, p.getY(i)));
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = ao;
  }
  crown.setAttribute("color", new THREE.BufferAttribute(col, 3));
  broccoliParts = {
    stem, crown,
    stemMat: food({ map: tex("stem"), clearcoat: 0.2 }),
    crownMat: food({ map: tex("floret"), vertexColors: true, roughness: 0.6, clearcoat: 0.25, sheen: 0.5, sheenColor: new THREE.Color("#c8f0a0") }),
  };
  return broccoliParts;
}

/* ---------- Modelos ---------- */
export const build = {
  knife() {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(0, -0.15); s.lineTo(1.35, -0.15);
    s.quadraticCurveTo(2.2, -0.12, 2.55, 0.34);
    s.quadraticCurveTo(2.05, 0.5, 1.4, 0.52);
    s.lineTo(0, 0.52); s.closePath();
    const blade = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.04, bevelSegments: 6, curveSegments: 24 });
    blade.translate(0, 0, -0.025);
    const rough = tex("brushed").clone(); rough.repeat.set(1.2, 1.2); rough.needsUpdate = true;
    g.add(mesh(blade, metal({ color: "#eef2f7", roughnessMap: rough, roughness: 0.55 })));
    const bolster = mesh(new RoundedBoxGeometry(0.18, 0.7, 0.24, 4, 0.07), metal({ color: "#c9d1dc", roughness: 0.3 }));
    bolster.position.set(-0.07, 0.185, 0);
    g.add(bolster);
    const handle = mesh(new RoundedBoxGeometry(1.3, 0.5, 0.32, 8, 0.16), glossy({ color: "#e8453c" }));
    handle.position.set(-0.8, 0.17, 0);
    g.add(handle);
    for (const x of [-0.4, -0.8, -1.2]) for (const z of [0.16, -0.16]) {
      const r = mesh(new THREE.SphereGeometry(0.06, 16, 10), metal({ color: "#f2c45a", roughness: 0.25 }));
      r.position.set(x, 0.17, z); r.scale.z = 0.45;
      g.add(r);
    }
    g.rotation.x = -Math.PI / 2;
    g.position.y = 0.2;
    const w = new THREE.Group(); w.add(g);
    return w;
  },

  // Faca de pé, para os minijogos: o fio fica em y = 0, a ponta para -x, o cabo para +x.
  cleaver() {
    const g = new THREE.Group();
    const k = build.knife().children[0];
    k.rotation.set(0, Math.PI, 0); // lâmina vertical, ponta para a esquerda
    k.position.set(0.9, 0.15, 0);
    g.add(k);
    return g;
  },

  pan() {
    const g = new THREE.Group();
    const outer = [V2(0, 0), V2(0.9, 0), V2(1.0, 0.02), V2(1.08, 0.08), V2(1.13, 0.2), V2(1.18, 0.36), V2(1.22, 0.44), V2(1.25, 0.47)];
    const inner = [V2(1.25, 0.47), V2(1.21, 0.5), V2(1.14, 0.46), V2(1.07, 0.24), V2(1.01, 0.14), V2(0.9, 0.1), V2(0, 0.1)];
    g.add(mesh(new THREE.LatheGeometry(outer, 64), glossy({ color: "#22a58d" })));
    const inside = mesh(new THREE.LatheGeometry(inner, 64), new THREE.MeshPhysicalMaterial({ map: tex("speckle"), roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3, side: THREE.DoubleSide }));
    inside.receiveShadow = true;
    g.add(inside);
    const neck = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 20), metal({ color: "#c9d1dc" }));
    neck.rotation.z = Math.PI / 2 - 0.14; neck.position.set(1.3, 0.4, 0);
    const handle = mesh(new THREE.CapsuleGeometry(0.13, 1.25, 8, 20), woodMat());
    handle.rotation.z = Math.PI / 2 - 0.14; handle.position.set(2.05, 0.5, 0);
    g.add(neck, handle);
    return g;
  },

  broccoli() {
    const { stem, crown, stemMat, crownMat } = broccoliGeos();
    const g = new THREE.Group();
    g.add(mesh(stem, stemMat), mesh(crown, crownMat));
    g.rotation.z = 0.1;
    return g;
  },

  steak(cooked = false) {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(-1.2, 0);
    s.bezierCurveTo(-1.25, 0.7, -0.4, 0.95, 0.2, 0.75);
    s.bezierCurveTo(0.8, 0.95, 1.35, 0.6, 1.25, 0.0);
    s.bezierCurveTo(1.2, -0.7, 0.3, -0.85, -0.2, -0.7);
    s.bezierCurveTo(-0.8, -0.85, -1.15, -0.5, -1.2, 0);
    const meat = new THREE.ExtrudeGeometry(s, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.14, bevelSegments: 8, curveSegments: 40 });
    meat.rotateX(-Math.PI / 2);
    const m = cooked ? tex("searedBeef") : tex("rawBeef");
    g.add(mesh(meat, food({ map: m, bumpMap: m, bumpScale: cooked ? 3 : 1.5, roughness: cooked ? 0.5 : 0.4, clearcoat: cooked ? 0.6 : 0.8, clearcoatRoughness: 0.3 })));
    // capa de gordura na borda de trás e da direita
    const P = (x, y) => new THREE.Vector3(x, 0.13, -y);
    const path = new THREE.CatmullRomCurve3([P(-0.55, 0.9), P(0.2, 0.84), P(0.85, 0.99), P(1.28, 0.6), P(1.38, 0.0)]);
    const ends = [path.getPoint(0), path.getPoint(1)].map((p) => new THREE.SphereGeometry(0.2, 24, 16).translate(p.x, p.y, p.z));
    const fat = mergeGeometries([new THREE.TubeGeometry(path, 60, 0.2, 20, false), ...ends]);
    fat.scale(1, 1.15, 1);
    g.add(mesh(fat, food({ color: cooked ? "#e7b37a" : "#fbe9d6", roughness: 0.35, clearcoat: 0.7, sheen: 0.6, sheenColor: new THREE.Color("#fff") })));
    return g;
  },

  soy: () => bottle({ r: 0.42, shoulder: 1.0, neckR: 0.13, neckTop: 1.78, glass: "#2a160b", cap: "#d8392b", text: "SHOYU", band: "#c8352a", ink: "#5a2a1a" }),
  oyster: () => bottle({ r: 0.54, shoulder: 0.82, neckR: 0.2, neckTop: 1.42, glass: "#4a2a12", cap: "#2f7a44", text: "OSTRA", band: "#2f5f8a", ink: "#2f3f5a" }),
  sesame: () => bottle({ r: 0.34, shoulder: 1.08, neckR: 0.1, neckTop: 1.85, glass: "#e8b060", amber: "#e09a2a", cap: "#d4a73a", text: "GERGELIM", band: "#7a2a1a", ink: "#7a4a1a" }),
  teriyaki: () => bottle({ r: 0.4, shoulder: 1.1, neckR: 0.12, neckTop: 1.8, glass: "#1e1410", cap: "#f2c14a", text: "TERIYAKI", band: "#5a3a9a", ink: "#3a2a5a" }),

  garlic() {
    const g = new THREE.Group();
    const geo = new THREE.LatheGeometry([V2(0, 0.02), V2(0.35, 0), V2(0.62, 0.1), V2(0.8, 0.32), V2(0.83, 0.55), V2(0.68, 0.85),
      V2(0.38, 1.1), V2(0.14, 1.32), V2(0.06, 1.5), V2(0, 1.56)], 72);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { // gomos: vincos entre os dentes
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const w = sstep(0, 0.3, y) * (1 - sstep(1.0, 1.35, y));
      const k = 1 + (0.86 + 0.2 * Math.sqrt(Math.abs(Math.cos(Math.atan2(z, x) * 3.5))) - 1) * w;
      p.setXYZ(i, x * k, y, z * k);
    }
    geo.computeVertexNormals();
    const skin = food({ map: tex("garlic"), roughness: 0.45, clearcoat: 0.3, sheen: 0.6, sheenColor: new THREE.Color("#fff") });
    g.add(mesh(geo, skin));
    const tip = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.22, 10), food({ color: "#cdb48a" }));
    tip.position.y = 1.62;
    g.add(tip);
    for (let i = 0; i < 12; i++) { // raizinhas
      const a = i / 12 * Math.PI * 2, root = mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.16, 5), food({ color: "#d9c3a0" }));
      root.position.set(Math.cos(a) * 0.1, 0.0, Math.sin(a) * 0.1);
      root.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
      g.add(root);
    }
    return g;
  },

  // Dentes de alho descascados, prontos para picar.
  cloves() {
    const g = new THREE.Group();
    const geo = new THREE.LatheGeometry([V2(0, 0), V2(0.14, 0.04), V2(0.2, 0.18), V2(0.16, 0.36), V2(0.06, 0.5), V2(0, 0.55)], 24);
    const flesh = food({ color: "#fbf3dc", roughness: 0.35, clearcoat: 0.7, sheen: 0.5, sheenColor: new THREE.Color("#fff") });
    [[-0.3, 0.1, 0.4], [0.05, -0.12, -0.2], [0.38, 0.08, 0.9]].forEach(([x, z, r]) => {
      const c = mesh(geo, flesh);
      c.scale.set(1.2, 1.2, 0.9);
      c.rotation.set(0, r, -1.45);
      c.position.set(x, 0.17, z);
      g.add(c);
    });
    return g;
  },

  ginger() {
    const g = new THREE.Group();
    const lobes = [ // [x, y, z, sx, sy, sz, rotZ]
      [0, 0.36, 0, 0.9, 0.36, 0.44, 0],
      [-0.95, 0.32, -0.05, 0.32, 0.28, 0.32, 0.2],
      [0.85, 0.38, 0.08, 0.34, 0.3, 0.34, -0.2],
      [-0.5, 0.72, 0.04, 0.2, 0.42, 0.22, 0.45],
      [0.38, 0.74, -0.06, 0.19, 0.38, 0.2, -0.35],
      [-0.05, 0.66, 0.2, 0.15, 0.26, 0.16, 0.1],
    ];
    const geos = [], ends = [];
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (const [x, y, z, sx, sy, sz, rz] of lobes) {
      q.setFromEuler(e.set(0, 0, rz));
      geos.push(new THREE.SphereGeometry(1, 32, 20).applyMatrix4(m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sx, sy, sz))));
      if (sy > sx * 1.5) ends.push([x, y, z, sx, sy, rz]); // dedos com a ponta cortada
    }
    g.add(mesh(mergeGeometries(geos), food({ map: tex("ginger"), bumpMap: tex("ginger"), bumpScale: 2, roughness: 0.5, clearcoat: 0.35 })));
    for (const [x, y, z, sx, sy, rz] of ends) {
      const cut = mesh(new THREE.CylinderGeometry(sx * 0.75, sx * 0.75, 0.03, 24), food({ color: "#f6dc86", roughness: 0.3, clearcoat: 0.8 }));
      cut.rotation.z = rz;
      cut.position.set(x - Math.sin(rz) * sy * 0.93, y + Math.cos(rz) * sy * 0.93, z);
      g.add(cut);
    }
    return g;
  },

  cornstarch() {
    const g = new THREE.Group();
    g.add(mesh(bowlGeo(1.0, 0.62), glossy({ color: "#fbf3e2", roughness: 0.25 })));
    const heap = mesh(new THREE.LatheGeometry([V2(0, 1.02), V2(0.18, 0.99), V2(0.4, 0.86), V2(0.65, 0.68), V2(0.92, 0.56)], 48),
      food({ map: tex("powder"), roughness: 0.95, clearcoat: 0 }));
    heap.receiveShadow = true;
    g.add(heap);
    const spoon = build.spoon();
    spoon.rotation.set(0.15, 0, -0.95);
    spoon.position.set(0.3, 0.86, 0.05);
    g.add(spoon);
    return g;
  },

  spoon() {
    const wood = woodMat(), spoon = new THREE.Group();
    const handle = mesh(new THREE.CapsuleGeometry(0.05, 1.3, 6, 12), wood);
    handle.position.y = 0.75;
    const head = mesh(new THREE.SphereGeometry(0.2, 24, 12), wood);
    head.scale.set(1, 0.3, 1.35);
    spoon.add(handle, head);
    return spoon;
  },

  rice({ sticks = true } = {}) {
    const g = new THREE.Group();
    const outer = mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.42, 0), V2(0.46, 0.06), V2(0.8, 0.3), V2(0.97, 0.6), V2(1.0, 0.72)], 56),
      glossy({ map: tex("riceBowl"), roughness: 0.2 }));
    const inner = mesh(new THREE.LatheGeometry([V2(1.0, 0.72), V2(0.97, 0.75), V2(0.93, 0.7), V2(0.78, 0.38), V2(0.4, 0.14), V2(0, 0.12)], 56),
      glossy({ color: "#fbfdff", roughness: 0.2 }));
    g.add(outer, inner);
    const dome = (r) => 0.66 + 0.4 * (1 - (r / 0.92) ** 2);
    g.add(riceMound(dome, 0.92, 360, 5));
    if (sticks) for (const dz of [-0.05, 0.05]) { // hashis apoiados na borda
      const stick = mesh(new THREE.CylinderGeometry(0.022, 0.035, 2.2, 10), food({ color: "#4a2c1a", roughness: 0.35, clearcoat: 0.8 }));
      stick.rotation.set(0, 0.3 + dz, Math.PI / 2 - 0.12);
      stick.position.set(0.25, 0.86, 0.55 + dz * 3);
      g.add(stick);
    }
    return g;
  },

  board({ knife = true } = {}) {
    const g = new THREE.Group();
    const W = 1.5, H = 0.95, r = 0.25, s = new THREE.Shape();
    s.moveTo(-W + r, -H); s.lineTo(W - r, -H); s.quadraticCurveTo(W, -H, W, -H + r);
    s.lineTo(W, -0.3); s.quadraticCurveTo(W + 0.5, -0.32, W + 0.55, 0); s.quadraticCurveTo(W + 0.5, 0.32, W, 0.3); // alça
    s.lineTo(W, H - r); s.quadraticCurveTo(W, H, W - r, H); s.lineTo(-W + r, H); s.quadraticCurveTo(-W, H, -W, H - r);
    s.lineTo(-W, -H + r); s.quadraticCurveTo(-W, -H, -W + r, -H);
    const hole = new THREE.Path(); hole.absarc(W + 0.24, 0, 0.1, 0, Math.PI * 2, true); s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 5, curveSegments: 24 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0.06, 0);
    const grain = tex("wood").clone(); grain.repeat.set(0.35, 0.35); grain.needsUpdate = true;
    const top = mesh(geo, food({ map: grain, bumpMap: grain, bumpScale: 0.6, roughness: 0.55, clearcoat: 0.25 }));
    top.receiveShadow = true;
    g.add(top);
    if (knife) {
      const k = build.knife(); k.scale.setScalar(0.55); k.position.set(-0.2, 0.24, 0.35); k.rotation.y = 0.15;
      g.add(k);
    }
    g.userData.top = 0.26; // altura do tampo, onde a comida encosta
    return g;
  },

  whisk() {
    const loop = new THREE.CatmullRomCurve3([[0, 0], [0.12, -0.3], [0.28, -0.75], [0.3, -1.05], [0.18, -1.3], [0, -1.36],
      [-0.18, -1.3], [-0.3, -1.05], [-0.28, -0.75], [-0.12, -0.3], [0, 0]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
    const wires = [];
    for (let i = 0; i < 4; i++) wires.push(new THREE.TubeGeometry(loop, 80, 0.018, 6).rotateY(i / 4 * Math.PI));
    const whisk = new THREE.Group();
    whisk.add(mesh(mergeGeometries(wires), metal({ color: "#e4e9ee", roughness: 0.2 })));
    const ferrule = mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.16, 16), metal({ color: "#c9d1dc" }));
    ferrule.position.y = 0.05;
    const handle = mesh(new THREE.CapsuleGeometry(0.085, 0.8, 8, 16), glossy({ color: "#5a3420" }));
    handle.position.y = 0.55;
    whisk.add(ferrule, handle);
    return whisk; // a ponta do arame fica em y = -1.36
  },

  // Tigela de misturar vazia; `userData.fill(level, color)` sobe o líquido de dentro.
  mixingBowl({ whisk = false } = {}) {
    const g = new THREE.Group(), R = 1.1, H = 0.75;
    g.add(mesh(bowlGeo(R, H), glossy({ color: "#a8d4ec", roughness: 0.22 })));
    const liquid = mesh(new THREE.CircleGeometry(1, 48), glossy({ color: "#8a4a1e", roughness: 0.12, side: THREE.FrontSide }));
    liquid.rotation.x = -Math.PI / 2; liquid.receiveShadow = true; liquid.visible = false;
    g.add(liquid);
    // raio de dentro da tigela na altura y: interpola o perfil de dentro de bowlGeo
    const wall = [[H * 0.14, R * 0.42], [H * 0.5, R * 0.82], [H * 0.96, R * 0.93]];
    const innerR = (y) => {
      if (y <= wall[0][0]) return wall[0][1];
      for (let i = 1; i < wall.length; i++) {
        const [y0, r0] = wall[i - 1], [y1, r1] = wall[i];
        if (y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0);
      }
      return wall.at(-1)[1];
    };
    g.userData.liquid = liquid;
    g.userData.fill = (level) => { // 0 = vazia, 1 = quase na borda
      const y = 0.1 + level * 0.5;
      liquid.visible = level > 0.005;
      liquid.position.y = y;
      liquid.scale.setScalar(innerR(y) * 0.98);
    };
    if (whisk) {
      g.userData.fill(0.55);
      const w = build.whisk(); w.rotation.z = -0.6; w.position.set(0.45, 1.3, 0);
      g.add(w);
    }
    return g;
  },

  // Wok de ferro; `userData.floor(r)` dá a altura do fundo de dentro a cada raio.
  wok({ filled = false } = {}) {
    const g = new THREE.Group();
    const iron = metal({ color: "#3a3f46", metalness: 0.7, roughness: 0.35 });
    g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.4, 0), V2(0.8, 0.12), V2(1.15, 0.35), V2(1.4, 0.62), V2(1.48, 0.72), V2(1.5, 0.76), V2(1.46, 0.78)], 64), iron));
    const inside = mesh(new THREE.LatheGeometry([V2(1.46, 0.78), V2(1.12, 0.42), V2(0.78, 0.2), V2(0.4, 0.09), V2(0, 0.07)], 64),
      metal({ color: "#2a2e33", metalness: 0.6, roughness: 0.4 }));
    inside.receiveShadow = true;
    g.add(inside);
    const floor = (r) => 0.06 + 0.27 * r * r;
    g.userData.floor = floor;
    const prof = []; for (let i = 8; i >= 0; i--) { const r = i / 8 * 0.85; prof.push(V2(r, floor(r) + 0.04)); }
    const sauce = mesh(new THREE.LatheGeometry(prof, 48), glossy({ color: "#7a3e16", roughness: 0.12, transparent: true, opacity: 1 }));
    sauce.receiveShadow = true; sauce.visible = filled;
    g.userData.sauce = sauce;
    g.add(sauce);
    const neck = mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.4, 16), metal({ color: "#c9d1dc" }));
    neck.rotation.z = Math.PI / 2 - 0.16; neck.position.set(1.62, 0.76, 0);
    const handle = mesh(new THREE.CapsuleGeometry(0.12, 1.2, 8, 20), woodMat());
    handle.rotation.z = Math.PI / 2 - 0.16; handle.position.set(2.42, 0.89, 0);
    const helper = mesh(new THREE.TorusGeometry(0.2, 0.04, 10, 24, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2).translate(-1.48, 0.74, 0), iron);
    g.add(neck, handle, helper);
    if (filled) {
      const rand = seeded(7), beef = searedMat();
      for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2, r = 0.15 + rand() * 0.65;
        const strip = mesh(new RoundedBoxGeometry(0.42, 0.1, 0.16, 3, 0.045), beef);
        strip.position.set(Math.cos(a) * r, floor(r) + 0.09, Math.sin(a) * r);
        strip.rotation.set(rand() * 0.4 - 0.2, rand() * Math.PI, rand() * 0.4 - 0.2);
        g.add(strip);
      }
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2 + 0.4, r = i % 2 ? 0.55 : 0.3;
        const b = build.broccoli(); b.scale.setScalar(0.17); b.rotation.y = rand() * 6;
        b.position.set(Math.cos(a) * r, floor(r) + 0.2, Math.sin(a) * r);
        g.add(b);
      }
    }
    return g;
  },

  // Espátula de wok: concha rasa de aço com cabo de madeira. A ponta fica na origem.
  spatula() {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(-0.32, 0); s.quadraticCurveTo(-0.34, 0.5, -0.12, 0.62); s.lineTo(0.12, 0.62); s.quadraticCurveTo(0.34, 0.5, 0.32, 0);
    s.quadraticCurveTo(0, -0.06, -0.32, 0);
    const head = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 3, curveSegments: 16 });
    const p = head.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + p.getX(i) ** 2 * 0.6); // concha
    head.computeVertexNormals();
    g.add(mesh(head, metal({ color: "#e6ebf0", roughness: 0.22 })));
    const neck = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10), metal({ color: "#c9d1dc" }));
    neck.position.set(0, 0.95, 0.12); neck.rotation.x = -0.3;
    const handle = mesh(new THREE.CapsuleGeometry(0.08, 0.9, 6, 14), woodMat());
    handle.position.set(0, 1.7, 0.38); handle.rotation.x = -0.3;
    g.add(neck, handle);
    return g;
  },

  stove() {
    const g = new THREE.Group();
    const body = mesh(new RoundedBoxGeometry(3.2, 0.55, 2.6, 4, 0.12), metal({ color: "#d5dade", roughness: 0.3, roughnessMap: tex("brushed") }));
    body.position.y = 0.275;
    const glass = mesh(new RoundedBoxGeometry(2.9, 0.06, 2.1, 3, 0.03), glossy({ color: "#30353b", roughness: 0.15 }));
    glass.position.set(0, 0.56, -0.12); glass.receiveShadow = true;
    g.add(body, glass);
    const burner = mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.08, 40), metal({ color: "#2a2e33", roughness: 0.4 }));
    burner.position.set(0, 0.63, -0.12);
    const cap = mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.07, 40), metal({ color: "#1a1d21", roughness: 0.35 }));
    cap.position.set(0, 0.7, -0.12);
    g.add(burner, cap);
    const grate = metal({ color: "#1f2328", metalness: 0.5, roughness: 0.5 });
    for (let i = 0; i < 4; i++) { // trempe: quatro braços com pezinho
      const a = i / 4 * Math.PI * 2 + Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      const arm = mesh(new RoundedBoxGeometry(0.7, 0.08, 0.08, 2, 0.03), grate);
      arm.position.set(c * 0.78, 0.9, -0.12 + s * 0.78); arm.rotation.y = -a;
      const leg = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), grate);
      leg.position.set(c * 1.1, 0.74, -0.12 + s * 1.1);
      g.add(arm, leg);
    }
    const ring = mesh(new THREE.TorusGeometry(1.1, 0.04, 8, 64), grate);
    ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.9, -0.12);
    g.add(ring);
    // chamas azuis com miolo amarelo; não fazem sombra e brilham (bloom)
    const flameGeo = new THREE.LatheGeometry([V2(0, 0), V2(0.05, 0.03), V2(0.06, 0.1), V2(0.035, 0.2), V2(0, 0.28)], 12);
    const blue = new THREE.MeshBasicMaterial({ color: new THREE.Color("#4aa6ff").multiplyScalar(1.6), transparent: true, opacity: 0.85, depthWrite: false });
    const yellow = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd34a").multiplyScalar(1.8) });
    const flames = [];
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, f = new THREE.Group();
      const outer = mesh(flameGeo, blue), core = mesh(flameGeo, yellow);
      core.scale.setScalar(0.45);
      outer.userData.noShadow = core.userData.noShadow = true;
      f.add(outer, core);
      f.position.set(Math.cos(a) * 0.43, 0.64, -0.12 + Math.sin(a) * 0.43);
      f.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
      flames.push(f); g.add(f);
    }
    const knobs = [];
    for (const x of [-1.05, -0.35, 0.35, 1.05]) { // botões na frente
      const knob = new THREE.Group();
      const k = mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.12, 24), metal({ color: "#eef2f7", roughness: 0.2 }));
      k.rotation.x = Math.PI / 2;
      const mark = mesh(new RoundedBoxGeometry(0.035, 0.14, 0.03, 2, 0.012), glossy({ color: "#30353b" }));
      mark.position.set(0, 0.04, 0.07);
      knob.add(k, mark);
      knob.position.set(x, 0.28, 1.34);
      knobs.push(knob); g.add(knob);
    }
    g.userData.heat = 1; // 0 = apagado, 1 = normal, 2 = labareda
    g.userData.top = 0.9; // altura da trempe, onde a panela apoia
    g.userData.tick = (t) => flames.forEach((f, i) => {
      const h = g.userData.heat;
      f.visible = h > 0.05;
      f.scale.set(0.7 + h * 0.3, (0.6 + h * 0.5) * (1 + 0.2 * Math.sin(t * 13 + i * 2.1)), 0.7 + h * 0.3);
      knobs[1].rotation.z = -h * 1.2;
    });
    return g;
  },

  oven() {
    const g = new THREE.Group();
    const body = mesh(new RoundedBoxGeometry(2.4, 2.2, 2.0, 4, 0.16), metal({ color: "#e4e8ec", roughness: 0.3, roughnessMap: tex("brushed") }));
    body.position.y = 1.2;
    g.add(body);
    for (const x of [-0.95, 0.95]) for (const z of [-0.75, 0.75]) {
      const foot = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 12), glossy({ color: "#30353b" }));
      foot.position.set(x, 0.06, z); g.add(foot);
    }
    const panel = mesh(new RoundedBoxGeometry(2.24, 0.42, 0.08, 3, 0.03), glossy({ color: "#4a5058", roughness: 0.25 }));
    panel.position.set(0, 2.02, 0.98);
    g.add(panel);
    for (const x of [-0.85, -0.52, -0.19]) {
      const knob = mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.1, 24), metal({ color: "#f2f4f6", roughness: 0.2 }));
      knob.rotation.x = Math.PI / 2; knob.position.set(x, 2.02, 1.06);
      g.add(knob);
    }
    const display = canvasTex(256, 96, (x) => {
      x.fillStyle = "#16221a"; x.fillRect(0, 0, 256, 96);
      x.fillStyle = "#7dff9a"; x.font = '400 64px "Lilita One", sans-serif'; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText("180°", 128, 54);
    });
    const screen = mesh(new THREE.PlaneGeometry(0.62, 0.23), new THREE.MeshStandardMaterial({ map: display, emissiveMap: display, emissive: "#fff", emissiveIntensity: 0.6, roughness: 0.3 }));
    screen.position.set(0.62, 2.02, 1.025);
    g.add(screen);
    const handle = mesh(new THREE.CapsuleGeometry(0.06, 1.5, 6, 16), metal({ color: "#f2f4f6", roughness: 0.15 }));
    handle.rotation.z = Math.PI / 2; handle.position.set(0, 1.62, 1.2);
    g.add(handle);
    for (const x of [-0.72, 0.72]) {
      const post = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 10), metal({ color: "#c9d1dc" }));
      post.rotation.x = Math.PI / 2; post.position.set(x, 1.62, 1.1);
      g.add(post);
    }
    const frame = mesh(new RoundedBoxGeometry(1.9, 1.15, 0.06, 3, 0.03), glossy({ color: "#30353b", roughness: 0.2 }));
    frame.position.set(0, 0.92, 1.0);
    const glow = canvasTex(256, 160, (x) => { // janela: forno ligado, resistência vermelha e grades
      const gr = x.createRadialGradient(128, 92, 6, 128, 92, 150);
      gr.addColorStop(0, "#ffd884"); gr.addColorStop(0.55, "#e57a20"); gr.addColorStop(1, "#4a1c06");
      x.fillStyle = gr; x.fillRect(0, 0, 256, 160);
      x.strokeStyle = "#ff5a2a"; x.lineWidth = 5; x.beginPath();
      for (let i = 0; i <= 16; i++) x.lineTo(i * 16, i % 2 ? 26 : 14);
      x.stroke();
      x.strokeStyle = "rgba(42,18,6,.6)"; x.lineWidth = 3;
      for (const y of [100, 132]) { x.beginPath(); x.moveTo(0, y); x.lineTo(256, y); x.stroke(); }
    });
    const win = mesh(new THREE.PlaneGeometry(1.7, 0.95), new THREE.MeshPhysicalMaterial({ map: glow, emissiveMap: glow, emissive: "#fff", emissiveIntensity: 0.7, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }));
    win.position.set(0, 0.92, 1.035);
    g.add(frame, win);
    return g;
  },

  // Cúpula de servir, articulada na borda de trás: `userData.open(0..1)`.
  cloche() {
    const shine = metal({ color: "#eef2f6", roughness: 0.14 });
    const prof = [V2(1.62, 0), V2(1.6, 0.1)];
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; prof.push(V2(1.58 * Math.cos(a), 0.1 + 1.25 * Math.sin(a))); }
    const dome = new THREE.Group();
    dome.add(mesh(new THREE.LatheGeometry(prof, 72), shine));
    const lip = mesh(new THREE.TorusGeometry(1.61, 0.05, 10, 96), shine);
    lip.rotation.x = Math.PI / 2;
    const stem = mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 16), shine);
    stem.position.y = 1.42;
    const knob = mesh(new THREE.SphereGeometry(0.18, 24, 16), metal({ color: "#f0c060", roughness: 0.2 }));
    knob.scale.y = 0.6; knob.position.y = 1.54;
    dome.add(lip, stem, knob);
    dome.position.z = 1.6;
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.24, -1.6);
    hinge.add(dome);
    hinge.userData.open = (k) => { hinge.rotation.x = -k * 1.9; };
    return hinge;
  },

  serve() {
    const g = new THREE.Group();
    g.add(servingPlate());
    const steak = build.steak(true); steak.scale.setScalar(0.55); steak.position.set(0, 0.2, 0.1); steak.rotation.y = 0.3;
    const e = egg(); e.scale.setScalar(0.8); e.position.set(-0.1, 0.46, 0.1);
    const c = build.cloche(); c.userData.open(0.2);
    g.add(steak, e, c);
    return g;
  },

  basket({ filled = true } = {}) {
    const g = new THREE.Group();
    const wicker = food({ map: tex("weave"), bumpMap: tex("weave"), bumpScale: 2, roughness: 0.7, clearcoat: 0.1 });
    g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.85, 0), V2(0.95, 0.05), V2(1.25, 0.9), V2(1.3, 1.0)], 64), wicker));
    const inside = mesh(new THREE.LatheGeometry([V2(1.24, 1.0), V2(0.9, 0.14), V2(0, 0.12)], 64), food({ map: tex("weave"), color: "#b98a5a", roughness: 0.8, clearcoat: 0 }));
    inside.receiveShadow = true;
    g.add(inside);
    const rim = mesh(new THREE.TorusGeometry(1.28, 0.08, 12, 72), food({ color: "#9a6028", roughness: 0.5, clearcoat: 0.3 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = 1.0;
    g.add(rim);
    const arc = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
      const a = i / 12 * Math.PI; return new THREE.Vector3(Math.cos(a) * 1.27, 1.0 + Math.sin(a) * 1.25, 0);
    }));
    g.add(mesh(new THREE.TubeGeometry(arc, 64, 0.08, 12), woodMat()));
    if (filled) { // compras espiando pela borda
      const b = build.broccoli(); b.scale.setScalar(0.45); b.position.set(-0.4, 0.75, 0.1);
      const garlic = build.garlic(); garlic.scale.setScalar(0.5); garlic.position.set(0.45, 0.45, -0.3);
      const soy = build.soy(); soy.scale.setScalar(0.55); soy.position.set(0.25, 0.3, 0.45); soy.rotation.z = -0.25;
      g.add(b, garlic, soy);
    }
    return g;
  },

  sauce() {
    const g = new THREE.Group();
    g.add(mesh(bowlGeo(0.95, 0.62), glossy({ color: "#fdfcfa", roughness: 0.2 })));
    const pool = mesh(new THREE.LatheGeometry([V2(0, 0.42), V2(0.8, 0.41), V2(0.83, 0.39)], 48), glossy({ color: "#7a3e16", roughness: 0.1 }));
    pool.receiveShadow = true;
    g.add(pool);
    const spoon = build.spoon();
    spoon.rotation.set(0.1, 0, -0.75);
    spoon.position.set(0.2, 0.42, 0);
    g.add(spoon);
    return g;
  },

  seared() {
    const g = new THREE.Group();
    g.add(servingPlate());
    const mat = searedMat(), rand = seeded(27);
    for (let i = 0; i < 9; i++) { // três fileiras, a do meio um pouco por cima
      const row = Math.floor(i / 3) - 1, col = i % 3 - 1;
      const s = beefStrip(mat);
      s.position.set(col * 0.62 + rand() * 0.1, 0.17 + (col === 0 ? 0.06 : 0), row * 0.52);
      s.rotation.set(rand() * 0.12, Math.PI / 2 + rand() * 0.8 - 0.4, rand() * 0.12);
      g.add(s);
    }
    return g;
  },

  stirfry() {
    const g = new THREE.Group();
    g.add(servingPlate());
    const glaze = mesh(new THREE.CircleGeometry(1.15, 48), glossy({ color: "#6a3410", roughness: 0.1 }));
    glaze.rotation.x = -Math.PI / 2; glaze.position.y = 0.09; glaze.receiveShadow = true;
    g.add(glaze);
    const mat = searedMat(), rand = seeded(39);
    const mound = (r) => 0.14 + 0.7 * (1 - r / 1.05); // monte: mais alto no centro
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 1.0;
      const x = Math.cos(a) * r, z = Math.sin(a) * r, y = mound(r);
      if (i % 2) {
        const b = build.broccoli(); b.scale.setScalar(0.24);
        b.position.set(x, y - 0.05, z); b.rotation.set(rand() * 0.6 - 0.3, rand() * 6, rand() * 0.6 - 0.3);
        g.add(b);
      } else {
        const s = beefStrip(mat); s.scale.setScalar(0.7);
        s.position.set(x, y, z); s.rotation.set(rand() * 0.6 - 0.3, rand() * Math.PI, rand() * 0.6 - 0.3);
        g.add(s);
      }
    }
    return g;
  },

  /* ----- Intrusos do mercado ----- */
  shrimp() {
    const g = new THREE.Group(), mat = food({ map: tex("shrimp"), roughness: 0.35, clearcoat: 0.9 });
    const geos = [];
    for (let i = 0; i < 8; i++) { // gomos em arco de "C", afinando para a cauda
      const a = -0.3 + i / 7 * 3.4, r = 0.62, s = 0.36 - i * 0.032;
      geos.push(new THREE.SphereGeometry(s, 20, 14).scale(1, 0.9, 1.15).translate(Math.cos(a) * r, 0.35, Math.sin(a) * r));
    }
    g.add(mesh(mergeGeometries(geos), mat));
    const fan = mat.clone(); fan.color = new THREE.Color("#ff6a3a");
    for (const s of [-1, 1]) {
      const t = mesh(new THREE.ConeGeometry(0.16, 0.42, 12).scale(1, 1, 0.3), fan);
      const a = 3.25; t.position.set(Math.cos(a) * 0.62 + 0.05, 0.35, Math.sin(a) * 0.62 + s * 0.12);
      t.rotation.set(0, 0, Math.PI / 2 + 0.3); t.rotation.y = s * 0.5;
      g.add(t);
    }
    const eye = mesh(new THREE.SphereGeometry(0.05, 10, 8), glossy({ color: "#1a1010" }));
    eye.position.set(Math.cos(-0.3) * 0.62 + 0.18, 0.5, Math.sin(-0.3) * 0.62 - 0.22);
    g.add(eye);
    return g;
  },

  tofu() {
    const g = new THREE.Group();
    const tray = mesh(new RoundedBoxGeometry(1.8, 0.22, 1.3, 3, 0.08), glossy({ color: "#7cc0e8", roughness: 0.3 }));
    tray.position.y = 0.11;
    const block = mesh(new RoundedBoxGeometry(1.4, 0.75, 1.0, 4, 0.12), food({ color: "#fbf6e8", roughness: 0.6, clearcoat: 0.2, sheen: 0.5, sheenColor: new THREE.Color("#fff") }));
    block.position.y = 0.55;
    g.add(tray, block);
    return g;
  },

  carrot() {
    const g = new THREE.Group();
    const body = mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.08, 0.15), V2(0.2, 0.8), V2(0.3, 1.6), V2(0.32, 1.9), V2(0.25, 2.0), V2(0, 2.02)], 32),
      food({ map: tex("carrot"), roughness: 0.45, clearcoat: 0.4 }));
    body.rotation.z = Math.PI / 2; body.position.set(1, 0.32, 0);
    g.add(body);
    const leaf = food({ color: "#4cae3a", roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
      const l = mesh(new THREE.CapsuleGeometry(0.05, 0.8, 4, 8), leaf);
      l.position.set(-1.35, 0.4 + (i - 2) * 0.03, (i - 2) * 0.08);
      l.rotation.set((i - 2) * 0.3, 0, Math.PI / 2 + 0.3 + (i % 2) * 0.2);
      g.add(l);
    }
    return g;
  },

  mushroom() {
    const g = new THREE.Group();
    const cap = mesh(new THREE.LatheGeometry([V2(0, 0.95), V2(0.4, 0.92), V2(0.75, 0.8), V2(0.95, 0.58), V2(0.92, 0.5), V2(0.7, 0.52), V2(0, 0.55)], 48),
      food({ map: tex("shiitake"), roughness: 0.6, clearcoat: 0.2 }));
    const stem = mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.55, 20), food({ color: "#efe0c4", roughness: 0.6 }));
    stem.position.y = 0.28;
    g.add(cap, stem);
    return g;
  },
};

// Monte de arroz: domo liso coberto de grãos. `dome(r)` é a altura em cada raio.
export function riceMound(dome, R, n, seed) {
  const g = new THREE.Group();
  const prof = []; for (let i = 0; i <= 8; i++) { const r = i / 8 * R; prof.push(V2(r, dome(r))); }
  prof.reverse();
  const riceMat = food({ color: "#fffcf4", roughness: 0.45, clearcoat: 0.3, sheen: 0.5, sheenColor: new THREE.Color("#fff") });
  const mound = mesh(new THREE.LatheGeometry(prof, 48), riceMat);
  mound.receiveShadow = true;
  g.add(mound);
  const grains = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.028, 0.05, 3, 8), riceMat, n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), rand = seeded(seed);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * R * 0.96;
    q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
    grains.setMatrixAt(i, m.compose(new THREE.Vector3(Math.cos(a) * r, dome(r) + 0.005, Math.sin(a) * r), q, s));
  }
  g.add(grains);
  return g;
}

// Cabe o modelo numa caixa de `size` (maior lado), apoiado no chão e centrado.
export function fit(model, size) {
  const box = new THREE.Box3().setFromObject(model);
  const dim = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = size / Math.max(dim.x, dim.y, dim.z);
  model.scale.multiplyScalar(k);
  model.position.set(-c.x * k, -box.min.y * k, -c.z * k);
  const wrap = new THREE.Group(); wrap.add(model);
  return wrap;
}
