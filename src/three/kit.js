// Kit de modelos 3D: comida, utensílios e estações, no estilo "brinquedo macio".
// Regras do estilo: sem contorno, formas cheinhas, textura pintada leve,
// comida com brilho úmido, metal e esmalte com reflexo limpo.
// Quase tudo é gerado em código, com texturas pintadas num <canvas>; os modelos já refeitos
// no Blender vêm de ./models.js (ver docs/cozinha/modelos-3d.md).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { model, part } from "./models.js";

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
// Ruído celular: distância ao centro de célula mais próximo (0 no centro). Vira bolhas e botõezinhos.
export function worley(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  let d = 9;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = xi + i + hash(xi + i, yi + j), cy = yi + j + hash(yi + j + 71, xi + i + 13);
    d = Math.min(d, Math.hypot(x - cx, y - cy));
  }
  return d;
}
// Cor por vértice a partir da posição: degradê e sombra pintados na malha, `fn(cor, x, y, z, i)`.
export function colorize(geo, fn) {
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { fn(c, p.getX(i), p.getY(i), p.getZ(i), i); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}
export const normals = (geo) => { geo.computeVertexNormals(); return geo; };
// Cilindro de `a` até `b` (talos, cabinhos).
export function limb(a, b, r0, r1, seg = 10) {
  const dir = new THREE.Vector3().subVectors(b, a), len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, seg, 3).translate(0, len / 2, 0);
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
  return geo.translate(a.x, a.y, a.z);
}

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
    // dourado de caramelo, não marrom-escuro: a carne selada tem de dar água na boca
    const lo = rgb("#7e3a1c"), mid = rgb("#b9652f"), hi = rgb("#e7a25e");
    return paint(256, (u, v) => {
      const n = fbm(u * 6, v * 6);
      let c = n < 0.5 ? mix(lo, mid, n * 2) : mix(mid, hi, (n - 0.5) * 2);
      const grill = (((u + v) * 4.2) % 1 + 1) % 1; // marcas da chapa
      return mix(c, rgb("#4a1d0c"), (1 - sstep(0.06, 0.13, Math.abs(grill - 0.5))) * 0.7);
    }, { repeat: 0.42 });
  },
  wood: () => { // veio de verdade: anéis deformados pelo ruído, fibras finas e um nó de vez em quando
    const a = rgb("#d9a066"), b = rgb("#f6d6a6"), fiber = rgb("#b87c44");
    return paint(256, (u, v) => {
      const warp = fbm(u * 2.5, v * 1.2, 4) * 6, knot = Math.exp(-((u - 0.7) ** 2 + (v - 0.35) ** 2) * 90) * 3;
      const ring = 0.5 + 0.5 * Math.sin((v * 9 + warp + knot) * Math.PI * 2);
      let c = mix(a, b, 0.35 + 0.5 * ring ** 1.6);
      c = mix(c, fiber, sstep(0.55, 0.85, fbm(u * 60, v * 5, 2)) * 0.3);
      return mix(c, b, (fbm(u * 8, v * 8, 2) - 0.5) * 0.4);
    });
  },
  speckle: () => {
    // esmalte cinza-azulado com pintinhas claras: o fundo da panela nunca fica preto
    const a = rgb("#56627a"), b = rgb("#6e7c95");
    return paint(256, (u, v) => {
      const c = mix(a, b, fbm(u * 10, v * 10));
      return hash(Math.floor(u * 160), Math.floor(v * 160)) > 0.93 ? mix(c, rgb("#e4e9f2"), 0.6) : c;
    });
  },
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
};
const cache = {};
export const tex = (k) => cache[k] ??= TEX[k]();
// pinta todas de uma vez (na abertura), para nenhuma etapa parar no meio pintando textura
export const paintAll = () => Object.keys(TEX).forEach(tex);

export function labelTexture(text, band, ink) {
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

// Junta numa malha só as malhas paradas de `root` que dividem material e sombra. Cada malha
// custa uma chamada de desenho (duas, com a sombra), e é esse custo fixo, não o de pixel,
// que segura o quadro no ANGLE/Metal. `skip`: nós que se mexem, somem ou que o jogo usa
// depois; ficam como estão, com tudo o que tiverem dentro.
export function mergeStatic(root, skip = []) {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert(), skipSet = new Set(skip), buckets = new Map();
  const sig = (g) => Object.entries(g.attributes).map(([n, a]) => `${n}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}`).sort().join();
  const walk = (o) => {
    for (const c of o.children) {
      if (skipSet.has(c) || !c.visible) continue;
      walk(c);
      if (!c.isMesh || c.isInstancedMesh || c.isSkinnedMesh || c.children.length || Array.isArray(c.material)
        || c.geometry.morphAttributes.position || c.userData.tick) continue;
      const m = new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld);
      const key = [c.material.uuid, c.castShadow, c.receiveShadow, c.renderOrder, !!c.userData.noShadow,
        !!c.geometry.index, m.determinant() < 0, sig(c.geometry)].join("|");
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push([c, m]);
    }
  };
  walk(root);
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    const geo = mergeGeometries(list.map(([c, m]) => c.geometry.clone().applyMatrix4(m)));
    if (!geo) continue;
    const [first] = list[0], merged = new THREE.Mesh(geo, first.material);
    Object.assign(merged, { castShadow: first.castShadow, receiveShadow: first.receiveShadow, renderOrder: first.renderOrder });
    merged.userData.noShadow = first.userData.noShadow;
    for (const [c] of list) c.removeFromParent();
    root.add(merged);
  }
  return root;
}

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

// Louça, panelas e utensílios das estações vêm do Blender (tableware.glb e utensils.glb, cada
// peça no referencial do procedural antigo, que está em archive/station.js).
const group = (...objs) => { const g = new THREE.Group(); g.add(...objs); return g; };
const ware = (piece) => part("tableware", piece);
const tool = (piece) => part("utensils", piece);

// Prato branco com aba azul, filetes dourados e coroa de pintinhas.
export const servingPlate = () => group(ware("plate"));

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

// Vidros e garrafas vêm do Blender (bottles.glb, um formato por peça, base na origem; o
// procedural antigo está em archive/bottles.js). O vidro, o conteúdo e a cor da tampa mudam
// por ingrediente, e o rótulo continua aqui: `r` e `label` são o raio e a faixa reta do corpo
// em art/blender/models/bottles.py, `mouth` é o topo da tampa, por onde o líquido sai.
const SHAPES = {
  tall: { r: 0.4, label: [0.2, 0.86], mouth: 1.93, fill: "tall_liquid" }, // gargalo fino
  round: { r: 0.55, label: [0.18, 0.62], mouth: 1.456, fill: "round_liquid" }, // bojuda
  jar: { r: 0.52, label: [0.2, 0.7], mouth: 1.15, fill: "jar_fill" }, // boca larga
  spice: { r: 0.28, label: [0.12, 0.52], mouth: 0.955, fill: "spice_fill", powder: true }, // potinho
};
// Material e geometria divididos entre as garrafas iguais (a feira e a bancada repetem).
const shared = {};
const once = (key, make) => shared[key] ??= make();
export function bottle({ shape = "tall", size = 1, glass = "#eef6f2", fill, cap, text, band, ink }) {
  const s = SHAPES[shape], g = new THREE.Group();
  const piece = (name, mat) => { const m = part("bottles", name); m.material = mat(m.material); g.add(m); return m; };
  piece(`${shape}_glass`, () => once(`glass${glass}`, () => new THREE.MeshPhysicalMaterial({
    // base preta: o vidro só soma reflexo; branco por cima de líquido escuro vira cinza
    color: "#000000", specularColor: glass, roughness: 0.05, transparent: true, opacity: 0.2, depthWrite: false })));
  piece(s.fill, () => once(`fill${fill}${shape}`, () => s.powder
    ? food({ color: fill, roughness: 0.85, clearcoat: 0 })
    : food({ color: fill, roughness: 0.3, clearcoat: 0.3, emissive: fill, emissiveIntensity: 0.12 })));
  // a tampa vem assada quase branca, com os frisos no relevo: a cor multiplica por cima
  piece(`${shape}_cap`, (baked) => once(`cap${shape}${cap}`, () => { const m = baked.clone(); m.color.set(cap); return m; }));
  const [y0, y1] = s.label, h = y1 - y0, r = s.r + 0.006, arc = Math.min(3.4, 2 * h / r); // rótulo 2:1, como a textura
  const label = mesh(once(`label${shape}`, () => new THREE.CylinderGeometry(r, r, h, 32, 1, true, -arc / 2, arc)),
    once(`label${text}`, () => new THREE.MeshStandardMaterial({ map: labelTexture(text, band, ink), roughness: 0.6 })));
  label.position.y = (y0 + y1) / 2;
  g.add(label);
  g.scale.setScalar(size);
  g.userData.mouth = new THREE.Vector3(0, s.mouth, 0); // por onde o líquido sai
  return g;
}

// Saleiro e pimenteiro de porcelana, lado a lado, já pintados no Blender.
export function saltPepper() {
  const g = new THREE.Group(), salt = part("bottles", "shaker_salt"), pepper = part("bottles", "shaker_pepper");
  salt.position.x = -0.3; pepper.position.x = 0.3; pepper.rotation.y = -0.25; salt.rotation.y = 0.25;
  g.add(salt, pepper);
  return g;
}

/* ---------- Modelos ---------- */
export const build = {
  knife() { // lâmina no plano xy (ponta em +x), deitada na tábua
    const g = group(tool("knife_blade"), tool("knife_handle"));
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

  pan: (color = "teal") => group(ware(`pan_${color}`)), // frigideira de esmalte: "teal" ou "coral"

  // Do Blender (public/models/broccoli.glb, 3 mil triângulos). O .glb tem 1 de altura com a
  // base em y = 0; aqui volta ao tamanho do procedural antigo (y de -1 a 1,5), que todo
  // quem chama (wok, cesta, porção, feira) já escala.
  broccoli() {
    const m = model("broccoli");
    m.scale.setScalar(2.4); m.position.set(0.02, -1.05, -0.1);
    const g = new THREE.Group();
    g.add(m);
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
    // UV do extrude vai de -1.4 a 1.4: desloca para a textura (repeat 0.42) não espelhar no meio do bife
    const uv = meat.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.8 + 1.2, uv.getY(i) * 0.8 + 1.2);
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

  soy: () => bottle({ fill: "#3a1608", cap: "#d8392b", text: "SHOYU", band: "#c8352a", ink: "#5a2a1a" }),
  oyster: () => bottle({ shape: "round", size: 1.05, fill: "#4a2410", cap: "#2f7a44", text: "OSTRA", band: "#2f5f8a", ink: "#2f3f5a" }),
  sesame: () => bottle({ size: 0.95, glass: "#f6e2b8", fill: "#e09a2a", cap: "#d4a73a", text: "GERGELIM", band: "#7a2a1a", ink: "#7a4a1a" }),
  teriyaki: () => bottle({ fill: "#2a160c", cap: "#f2c14a", text: "TERIYAKI", band: "#5a3a9a", ink: "#3a2a5a" }),

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

  // tigela menta com o monte de amido e a colher de pau enterrada (uma malha só)
  cornstarch: () => group(ware("starch")),

  spoon: () => group(tool("spoon")), // colher de pau: concha na origem, abrindo para +z; cabo sobe em y

  // tigela de arroz com o monte por cima; `userData.rice` é o monte (o prato esconde ao servir)
  rice() {
    const rice = ware("rice"), g = group(ware("ricebowl"), rice);
    g.userData.rice = rice;
    return g;
  },

  board({ knife = true } = {}) {
    const g = group(ware("board"));
    if (knife) {
      const k = build.knife(); k.scale.setScalar(0.55); k.position.set(-0.2, 0.24, 0.35); k.rotation.y = 0.15;
      g.add(k);
    }
    g.userData.top = 0.26; // altura do tampo, onde a comida encosta
    return g;
  },

  whisk: () => group(tool("whisk_wire"), tool("whisk_handle")), // a ponta do arame fica em y = -1.36

  // Tigela de misturar vazia; `userData.fill(level, color)` sobe o líquido de dentro.
  mixingBowl({ whisk = false } = {}) {
    const g = group(ware("bowl")), R = 1.1, H = 0.75;
    const liquid = mesh(new THREE.CircleGeometry(1, 48), glossy({ color: "#8a4a1e", roughness: 0.12, side: THREE.FrontSide }));
    liquid.rotation.x = -Math.PI / 2; liquid.receiveShadow = true; liquid.visible = false;
    g.add(liquid);
    // raio de dentro da tigela na altura y: interpola o perfil de dentro da tigela (tableware.py)
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
    g.userData.rim = R * 0.9; // boca: o que cai dentro deste raio entra
    g.userData.top = H; // altura da borda
    g.userData.surface = () => liquid.position.y; // altura do líquido, para quem despeja ou mexe
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
    // esmalte azul-piscina por fora, aro de inox, antiaderente granito claro por dentro, cabo e alça
    const g = group(ware("wok"));
    const floor = (r) => 0.06 + 0.27 * r * r;
    g.userData.floor = floor;
    const prof = []; for (let i = 8; i >= 0; i--) { const r = i / 8 * 0.85; prof.push(V2(r, floor(r) + 0.04)); }
    const sauce = mesh(new THREE.LatheGeometry(prof, 48), glossy({ color: "#7a3e16", roughness: 0.12, transparent: true, opacity: 1 }));
    sauce.receiveShadow = true; sauce.visible = filled;
    g.userData.sauce = sauce;
    g.add(sauce);
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
  spatula: () => group(tool("spatula_head"), tool("spatula_handle")),

  stove() {
    const g = new THREE.Group();
    // fogareiro de brinquedo: corpo de esmalte branco, tampo creme, moldura e trempe coloridas
    const body = mesh(new RoundedBoxGeometry(3.2, 0.55, 2.6, 4, 0.12), glossy({ color: "#fffaf6", roughness: 0.25 }));
    body.position.y = 0.275;
    const glass = mesh(new RoundedBoxGeometry(2.9, 0.06, 2.1, 3, 0.03), glossy({ color: "#f3f6fb", roughness: 0.15 }));
    glass.position.set(0, 0.56, -0.12); glass.receiveShadow = true;
    const frame = mesh(new THREE.TorusGeometry(0.98, 0.05, 10, 4).rotateX(Math.PI / 2).rotateY(Math.PI / 4), glossy({ color: "#5ec7e6", roughness: 0.25 }));
    frame.scale.set(1.25, 1, 0.92); frame.position.set(0, 0.6, -0.12); // moldura quadrada em volta da boca
    g.add(body, glass, frame);
    const burner = mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.08, 40), metal({ color: "#8a93a3", roughness: 0.35 }));
    burner.position.set(0, 0.63, -0.12);
    const cap = mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.07, 40), metal({ color: "#5a6170", roughness: 0.35 }));
    cap.position.set(0, 0.7, -0.12);
    g.add(burner, cap);
    const grate = glossy({ color: "#ffb347", roughness: 0.3 });
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
    // as 16 chamas viram duas malhas instanciadas (casca azul e miolo amarelo): 2 desenhos, não 32
    const N = 16, outer = new THREE.InstancedMesh(flameGeo, blue, N), core = new THREE.InstancedMesh(flameGeo, yellow, N);
    outer.userData.noShadow = core.userData.noShadow = true;
    outer.frustumCulled = core.frustumCulled = false; // a caixa da geometria base não cobre o anel
    const base = Array.from({ length: N }, (_, i) => {
      const a = i / N * Math.PI * 2;
      return { p: new THREE.Vector3(Math.cos(a) * 0.43, 0.64, -0.12 + Math.sin(a) * 0.43), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35)) };
    });
    const fm = new THREE.Matrix4(), cm = new THREE.Matrix4(), sc = new THREE.Vector3(), half = new THREE.Matrix4().makeScale(0.45, 0.45, 0.45);
    g.add(outer, core);
    const knobs = [], knobMat = glossy({ color: "#f483a6", roughness: 0.25 }), markMat = glossy({ color: "#fffaf5" });
    const knobGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.12, 24), markGeo = new RoundedBoxGeometry(0.035, 0.14, 0.03, 2, 0.012);
    for (const x of [-1.05, -0.35, 0.35, 1.05]) { // botões na frente
      const knob = new THREE.Group();
      const k = mesh(knobGeo, knobMat);
      k.rotation.x = Math.PI / 2;
      const mark = mesh(markGeo, markMat);
      mark.position.set(0, 0.04, 0.07);
      knob.add(k, mark);
      knob.position.set(x, 0.28, 1.34);
      knobs.push(knob); g.add(knob);
    }
    g.userData.heat = 1; // 0 = apagado, 1 = normal, 2 = labareda
    g.userData.top = 0.9; // altura da trempe, onde a panela apoia
    g.userData.tick = (t) => {
      const h = g.userData.heat;
      outer.visible = core.visible = h > 0.05;
      knobs[1].rotation.z = -h * 1.2;
      if (!outer.visible) return;
      for (let i = 0; i < N; i++) {
        sc.set(0.7 + h * 0.3, (0.6 + h * 0.5) * (1 + 0.2 * Math.sin(t * 13 + i * 2.1)), 0.7 + h * 0.3);
        fm.compose(base[i].p, base[i].q, sc);
        outer.setMatrixAt(i, fm); core.setMatrixAt(i, cm.multiplyMatrices(fm, half));
      }
      outer.instanceMatrix.needsUpdate = core.instanceMatrix.needsUpdate = true;
    };
    g.userData.moving = [outer, core, knobs[1]];
    g.userData.tick(0);
    return g;
  },

  // Cúpula de servir, articulada na borda de trás: `userData.open(0..1)`.
  cloche() {
    const dome = group(ware("cloche"), ware("cloche_knob"));
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

  sauce() { // children[1] é o molho (stir.js tinge e esvazia)
    const g = group(ware("saucebowl"));
    const pool = mesh(new THREE.LatheGeometry([V2(0, 0.42), V2(0.8, 0.41), V2(0.83, 0.39)], 48), glossy({ color: "#7a3e16", roughness: 0.1 }));
    pool.receiveShadow = true;
    g.add(pool);
    const spoon = build.spoon();
    spoon.rotation.set(0.1, 0, -0.75);
    spoon.position.set(0.2, 0.42, 0);
    g.add(spoon);
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
