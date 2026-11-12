// Arquivo: modelos procedurais que o jogo já não usa, trocados pelos .glb do Blender
// (ver docs/cozinha/modelos-3d.md). Ficam aqui, fora do caminho do jogo, para comparar
// (art/compare-current.html) e para voltar atrás se precisar. Nada no jogo importa este arquivo.
import {
  THREE, RoundedBoxGeometry, mergeGeometries, mesh, food, glossy, metal, paint, rgb, mix, fbm, sstep, seeded, V2, tex,
  servingPlate, beefStrip, searedMat, labelTexture,
} from "../kit.js";
import { packTex } from "../foods.js";

const cache = {};
const once = (key, make) => cache[key] ??= make();

/* ---------- Brócolis (leva 2): ~48 mil triângulos, 13 bolinhas calombentas ---------- */
const floretTex = () => once("floret", () => {
  const a = rgb("#2d7a26"), b = rgb("#6cc24a"), dark = rgb("#1f5419");
  return paint(256, (u, v) => mix(mix(a, b, fbm(u * 8, v * 8)), dark, sstep(0.6, 0.75, fbm(u * 40, v * 40, 2)) * 0.6));
});
const stemTex = () => once("stem", () => paint(128, (u, v) => mix(rgb("#9ccc63"), rgb("#d4ecaa"), fbm(u * 18, v * 2, 3))));

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

const broccoliGeos = () => once("broccoliGeos", () => {
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
  return {
    stem, crown,
    stemMat: food({ map: stemTex(), clearcoat: 0.2 }),
    crownMat: food({ map: floretTex(), vertexColors: true, roughness: 0.6, clearcoat: 0.25, sheen: 0.5, sheenColor: new THREE.Color("#c8f0a0") }),
  };
});

export function broccoli() {
  const { stem, crown, stemMat, crownMat } = broccoliGeos();
  const g = new THREE.Group();
  g.add(mesh(stem, stemMat), mesh(crown, crownMat));
  g.rotation.z = 0.1;
  return g;
}

/* ---------- Manga e limão (leva 2) ---------- */
const mangoTex = () => once("mango", () => {
  const green = rgb("#8fbf3a"), yellow = rgb("#ffc42e"), red = rgb("#ee4f2c");
  return paint(128, (u, v) => {
    const c = mix(green, yellow, sstep(0.05, 0.45, v + (fbm(u * 6, v * 6) - 0.5) * 0.3));
    const blush = sstep(0.35, 0.85, 0.5 + 0.5 * Math.sin(u * Math.PI * 2)) * sstep(0.15, 0.7, v);
    return mix(c, red, blush * 0.85);
  });
});

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

export function lime() {
  const g = new THREE.Group(), skin = food({ color: "#6cba2c", roughness: 0.45, clearcoat: 0.7, bumpMap: tex("speckle"), bumpScale: 0.5 });
  const prof = [V2(0, -0.44), V2(0.2, -0.41), V2(0.4, -0.24), V2(0.47, 0), V2(0.4, 0.24), V2(0.2, 0.41), V2(0.05, 0.45), V2(0, 0.46)];
  const fruit = mesh(new THREE.LatheGeometry(prof, 36), skin);
  fruit.rotation.z = Math.PI / 2; fruit.position.y = 0.47;
  g.add(fruit);
  return g;
}

/* ---------- Pratos prontos que nunca entraram no jogo (leva 2) ---------- */
export function seared() {
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
}

export function stirfry() {
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
      const b = broccoli(); b.scale.setScalar(0.24);
      b.position.set(x, y - 0.05, z); b.rotation.set(rand() * 0.6 - 0.3, rand() * 6, rand() * 0.6 - 0.3);
      g.add(b);
    } else {
      const s = beefStrip(mat); s.scale.setScalar(0.7);
      s.position.set(x, y, z); s.rotation.set(rand() * 0.6 - 0.3, rand() * Math.PI, rand() * 0.6 - 0.3);
      g.add(s);
    }
  }
  return g;
}

/* ---------- Embalagens (leva 7): trocadas por packs.glb; o amido da feira virou a tigela da bancada ---------- */
export function tub(text, band, lid) { // pote de plástico com tampa de alumínio
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.48, 0), V2(0.52, 0.04), V2(0.62, 0.84), V2(0.67, 0.86), V2(0.67, 0.92), V2(0, 0.92)], 40), glossy({ color: "#fffdf8", roughness: 0.3 })));
  const label = mesh(new THREE.CylinderGeometry(0.606, 0.546, 0.52, 40, 1, true, -1.7, 3.4), new THREE.MeshStandardMaterial({ map: labelTexture(text, band, band), roughness: 0.6 }));
  label.position.y = 0.46;
  const foil = mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.035, 40), metal({ color: lid, roughness: 0.35 }));
  foil.position.y = 0.935;
  g.add(label, foil);
  return g;
}
export function carton(text, band, cap) { // caixa de leite com telhadinho
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
export function sack(text, band) { // saco de papel dobrado em cima
  const g = new THREE.Group();
  const body = mesh(new RoundedBoxGeometry(0.95, 1.1, 0.62, 4, 0.14), new THREE.MeshStandardMaterial({ map: packTex(text, "#fff6e6", band), roughness: 0.8 }));
  body.position.y = 0.55;
  const fold = mesh(new RoundedBoxGeometry(0.9, 0.2, 0.3, 3, 0.08), food({ color: "#f3e3c8", roughness: 0.85, clearcoat: 0 }));
  fold.position.set(0, 1.14, 0.02); fold.rotation.x = 0.25;
  g.add(body, fold);
  return g;
}
export function tin(text, band, body) { // lata com tampa de metal
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
export function cornstarchBox() { // caixa de amido com rótulo
  const box = mesh(new RoundedBoxGeometry(1, 1.4, 0.6, 3, 0.06), new THREE.MeshStandardMaterial({ map: packTex("AMIDO", "#ffd23f", "#2a8199"), roughness: 0.5 }));
  box.position.y = 0.7;
  const g = new THREE.Group(); g.add(box);
  return g;
}
