// Arquivo (levas 4 e 5, estações): louça, panelas e utensílios como eram antes dos .glb do
// Blender (tableware.glb e utensils.glb, ver docs/cozinha/modelos-3d.md). Mesma API e mesmo
// referencial dos que o jogo usa hoje (build.* em kit.js, utensílios em gear.js, a concha do
// varal em sets.js). Fica aqui, fora do caminho do jogo, para comparar e para voltar atrás se
// precisar. Nada no jogo importa este arquivo.
import {
  THREE, RoundedBoxGeometry, mergeGeometries, build, mesh, food, glossy, metal, woodMat, canvasTex, paint, V2,
  tex as kitTex, rgb, mix, fbm, sstep, seeded, searedMat, riceMound,
} from "../kit.js";

// Texturas que só estes modelos usavam (saíram do TEX de kit.js).
const OWN = {
  // madeira clara de tábua: veio reto ao longo de u (a emenda espelhada some no sentido do veio)
  maple: () => {
    const a = rgb("#e4b37a"), b = rgb("#f6d9ab"), line = rgb("#c98a4c");
    return paint(256, (u, v) => {
      const w = v * 22 + fbm(u * 1.5, v * 6, 3) * 1.6;
      let c = mix(a, b, 0.5 + 0.5 * Math.sin(w * Math.PI * 2));
      c = mix(c, line, (1 - sstep(0.0, 0.08, Math.abs((w % 1 + 1) % 1 - 0.5))) * 0.35);
      return mix(c, line, sstep(0.6, 0.85, fbm(u * 40, v * 3, 2)) * 0.15);
    }, { repeat: 0.3 });
  },
  brushed: () => paint(256, (u, v) => { const g = 120 + fbm(u * 2, v * 90, 3) * 90; return [g, g, g]; }, { srgb: false }),
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
const tex = (k) => (OWN[k] ? cache[k] ??= OWN[k]() : kitTex(k));

export function bowlGeo(R, H) {
  return new THREE.LatheGeometry([V2(0, 0), V2(R * 0.45, 0), V2(R * 0.5, 0.05), V2(R * 0.86, H * 0.45), V2(R * 0.98, H * 0.88),
    V2(R, H), V2(R * 0.97, H + 0.03), V2(R * 0.93, H * 0.96), V2(R * 0.82, H * 0.5), V2(R * 0.42, H * 0.14), V2(0, H * 0.12)], 56);
}

export function servingPlate() {
  const plate = new THREE.Group();
  const porcelain = new THREE.MeshPhysicalMaterial({ color: "#fdfcfa", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const well = mesh(new THREE.LatheGeometry([V2(0, 0.08), V2(1.15, 0.08), V2(1.3, 0.14)], 96), porcelain);
  const rim = mesh(new THREE.LatheGeometry([V2(1.3, 0.14), V2(1.6, 0.19), V2(1.9, 0.24), V2(1.97, 0.25)], 96), glossy({ color: "#7cc4e8", roughness: 0.2 }));
  const under = mesh(new THREE.LatheGeometry([V2(1.97, 0.25), V2(1.99, 0.22), V2(1.7, 0.1), V2(1.2, 0.02), V2(0, 0.02)], 96), porcelain);
  for (const m of [well, rim, under]) { m.receiveShadow = true; plate.add(m); }
  const gold = metal({ color: "#f0c060", roughness: 0.22 });
  for (const [r, y] of [[1.31, 0.143], [1.95, 0.25], [1.62, 0.193]]) {
    const t = mesh(new THREE.TorusGeometry(r, 0.016, 8, 128), gold);
    t.rotation.x = Math.PI / 2; t.position.y = y; plate.add(t);
  }
  return plate;
}

export function knife() {
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
}

export function pan() {
  const g = new THREE.Group();
  const outer = [V2(0, 0), V2(0.9, 0), V2(1.0, 0.02), V2(1.08, 0.08), V2(1.13, 0.2), V2(1.18, 0.36), V2(1.22, 0.44), V2(1.25, 0.47)];
  const inner = [V2(1.25, 0.47), V2(1.21, 0.5), V2(1.14, 0.46), V2(1.07, 0.24), V2(1.01, 0.14), V2(0.9, 0.1), V2(0, 0.1)];
  g.add(mesh(new THREE.LatheGeometry(outer, 64), glossy({ color: "#22a58d" })));
  const inside = mesh(new THREE.LatheGeometry(inner, 64), new THREE.MeshPhysicalMaterial({ map: tex("speckle"), roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3, side: THREE.DoubleSide }));
  inside.receiveShadow = true;
  g.add(inside);
  const neck = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 20), metal({ color: "#c9d1dc" }));
  neck.rotation.z = -Math.PI / 2 + 0.14; neck.position.set(1.3, 0.4, 0);
  const handle = mesh(new THREE.CapsuleGeometry(0.13, 1.25, 8, 20), woodMat());
  handle.rotation.z = -Math.PI / 2 + 0.14; handle.position.set(2.05, 0.5, 0);
  g.add(neck, handle);
  return g;
}

export function cornstarch() {
  const g = new THREE.Group();
  g.add(mesh(bowlGeo(1.0, 0.62), glossy({ color: "#fbf3e2", roughness: 0.25 })));
  const heap = mesh(new THREE.LatheGeometry([V2(0, 1.02), V2(0.18, 0.99), V2(0.4, 0.86), V2(0.65, 0.68), V2(0.92, 0.56)], 48),
    food({ map: tex("powder"), roughness: 0.95, clearcoat: 0 }));
  heap.receiveShadow = true;
  g.add(heap);
  const s = spoon();
  s.rotation.set(0.15, 0, -0.95);
  s.position.set(0.3, 0.86, 0.05);
  g.add(s);
  return g;
}

export function spoon() {
  const wood = woodMat(), g = new THREE.Group();
  const handle = mesh(new THREE.CapsuleGeometry(0.05, 1.3, 6, 12), wood);
  handle.position.y = 0.9;
  const head = mesh(new THREE.SphereGeometry(0.2, 24, 12), wood);
  head.scale.set(1, 1.35, 0.3);
  g.add(handle, head);
  return g;
}

export function rice({ sticks = true } = {}) {
  const g = new THREE.Group();
  const outer = mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.42, 0), V2(0.46, 0.06), V2(0.8, 0.3), V2(0.97, 0.6), V2(1.0, 0.72)], 56),
    glossy({ map: tex("riceBowl"), roughness: 0.2 }));
  const inner = mesh(new THREE.LatheGeometry([V2(1.0, 0.72), V2(0.97, 0.75), V2(0.93, 0.7), V2(0.78, 0.38), V2(0.4, 0.14), V2(0, 0.12)], 56),
    glossy({ color: "#fbfdff", roughness: 0.2 }));
  g.add(outer, inner);
  const dome = (r) => 0.66 + 0.4 * (1 - (r / 0.92) ** 2);
  g.add(riceMound(dome, 0.92, 360, 5));
  if (sticks) for (const dz of [-0.05, 0.05]) {
    const stick = mesh(new THREE.CylinderGeometry(0.022, 0.035, 2.2, 10), food({ color: "#4a2c1a", roughness: 0.35, clearcoat: 0.8 }));
    stick.rotation.set(0, 0.3 + dz, Math.PI / 2 - 0.12);
    stick.position.set(0.25, 0.86, 0.55 + dz * 3);
    g.add(stick);
  }
  return g;
}

export function board({ knife: withKnife = true } = {}) {
  const g = new THREE.Group();
  const W = 1.5, H = 0.95, r = 0.25, s = new THREE.Shape();
  s.moveTo(-W + r, -H); s.lineTo(W - r, -H); s.quadraticCurveTo(W, -H, W, -H + r);
  s.lineTo(W, -0.3); s.quadraticCurveTo(W + 0.5, -0.32, W + 0.55, 0); s.quadraticCurveTo(W + 0.5, 0.32, W, 0.3);
  s.lineTo(W, H - r); s.quadraticCurveTo(W, H, W - r, H); s.lineTo(-W + r, H); s.quadraticCurveTo(-W, H, -W, H - r);
  s.lineTo(-W, -H + r); s.quadraticCurveTo(-W, -H, -W + r, -H);
  const hole = new THREE.Path(); hole.absarc(W + 0.24, 0, 0.1, 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 5, curveSegments: 24 });
  geo.rotateX(-Math.PI / 2); geo.translate(0, 0.06, 0);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.6 + 1.7, uv.getY(i) * 0.6 + 1.7);
  const top = mesh(geo, food({ map: tex("maple"), bumpMap: tex("maple"), bumpScale: 0.12, roughness: 0.5, clearcoat: 0.3 }));
  top.receiveShadow = true;
  g.add(top);
  if (withKnife) {
    const k = knife(); k.scale.setScalar(0.55); k.position.set(-0.2, 0.24, 0.35); k.rotation.y = 0.15;
    g.add(k);
  }
  g.userData.top = 0.26;
  return g;
}

export function whisk() {
  const loop = new THREE.CatmullRomCurve3([[0, 0], [0.12, -0.3], [0.28, -0.75], [0.3, -1.05], [0.18, -1.3], [0, -1.36],
    [-0.18, -1.3], [-0.3, -1.05], [-0.28, -0.75], [-0.12, -0.3], [0, 0]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const wires = [];
  for (let i = 0; i < 4; i++) wires.push(new THREE.TubeGeometry(loop, 80, 0.018, 6).rotateY(i / 4 * Math.PI));
  const g = new THREE.Group();
  g.add(mesh(mergeGeometries(wires), metal({ color: "#e4e9ee", roughness: 0.2 })));
  const ferrule = mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.16, 16), metal({ color: "#c9d1dc" }));
  ferrule.position.y = 0.05;
  const handle = mesh(new THREE.CapsuleGeometry(0.085, 0.8, 8, 16), glossy({ color: "#5a3420" }));
  handle.position.y = 0.55;
  g.add(ferrule, handle);
  return g;
}

export function mixingBowl({ whisk: withWhisk = false } = {}) {
  const g = new THREE.Group(), R = 1.1, H = 0.75;
  g.add(mesh(bowlGeo(R, H), glossy({ color: "#a8d4ec", roughness: 0.22 })));
  const liquid = mesh(new THREE.CircleGeometry(1, 48), glossy({ color: "#8a4a1e", roughness: 0.12, side: THREE.FrontSide }));
  liquid.rotation.x = -Math.PI / 2; liquid.receiveShadow = true; liquid.visible = false;
  g.add(liquid);
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
  g.userData.rim = R * 0.9;
  g.userData.top = H;
  g.userData.surface = () => liquid.position.y;
  g.userData.fill = (level) => {
    const y = 0.1 + level * 0.5;
    liquid.visible = level > 0.005;
    liquid.position.y = y;
    liquid.scale.setScalar(innerR(y) * 0.98);
  };
  if (withWhisk) {
    g.userData.fill(0.55);
    const w = whisk(); w.rotation.z = -0.6; w.position.set(0.45, 1.3, 0);
    g.add(w);
  }
  return g;
}

export function wok({ filled = false } = {}) {
  const g = new THREE.Group();
  const iron = glossy({ color: "#35b4d8", roughness: 0.22, clearcoatRoughness: 0.08 });
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.4, 0), V2(0.8, 0.12), V2(1.15, 0.35), V2(1.4, 0.62), V2(1.48, 0.72), V2(1.5, 0.76), V2(1.46, 0.78)], 64), iron));
  const inside = mesh(new THREE.LatheGeometry([V2(1.46, 0.78), V2(1.12, 0.42), V2(0.78, 0.2), V2(0.4, 0.09), V2(0, 0.07)], 64),
    new THREE.MeshPhysicalMaterial({ map: tex("speckle"), roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.25, side: THREE.DoubleSide }));
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
  neck.rotation.z = -Math.PI / 2 + 0.16; neck.position.set(1.62, 0.76, 0);
  const handle = mesh(new THREE.CapsuleGeometry(0.12, 1.2, 8, 20), woodMat());
  handle.rotation.z = -Math.PI / 2 + 0.16; handle.position.set(2.42, 0.89, 0);
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
}

export function spatula() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0); s.quadraticCurveTo(-0.34, 0.5, -0.12, 0.62); s.lineTo(0.12, 0.62); s.quadraticCurveTo(0.34, 0.5, 0.32, 0);
  s.quadraticCurveTo(0, -0.06, -0.32, 0);
  const head = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 3, curveSegments: 16 });
  const p = head.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + p.getX(i) ** 2 * 0.6);
  head.computeVertexNormals();
  g.add(mesh(head, metal({ color: "#e6ebf0", roughness: 0.22 })));
  const neck = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10), metal({ color: "#c9d1dc" }));
  neck.position.set(0, 0.95, 0.12); neck.rotation.x = 0.3;
  const handle = mesh(new THREE.CapsuleGeometry(0.08, 0.9, 6, 14), woodMat());
  handle.position.set(0, 1.7, 0.38); handle.rotation.x = 0.3;
  g.add(neck, handle);
  return g;
}

export function cloche() {
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
}

export function sauce() {
  const g = new THREE.Group();
  g.add(mesh(bowlGeo(0.95, 0.62), glossy({ color: "#fdfcfa", roughness: 0.2 })));
  const pool = mesh(new THREE.LatheGeometry([V2(0, 0.42), V2(0.8, 0.41), V2(0.83, 0.39)], 48), glossy({ color: "#7a3e16", roughness: 0.1 }));
  pool.receiveShadow = true;
  g.add(pool);
  const s = spoon();
  s.rotation.set(0.1, 0, -0.75);
  s.position.set(0.2, 0.42, 0);
  g.add(s);
  return g;
}

export function rollingPin() {
  const g = new THREE.Group(), wood = woodMat();
  const body = mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.3, 28).rotateZ(Math.PI / 2), wood);
  g.add(body);
  for (const x of [-1, 1]) {
    const h = mesh(new THREE.CapsuleGeometry(0.1, 0.5, 6, 14).rotateZ(Math.PI / 2), glossy({ color: "#e5484d" }));
    h.position.x = x * 1.55;
    g.add(h);
  }
  g.userData.r = 0.24;
  return g;
}

export function sieve() {
  const g = new THREE.Group(), steel = metal({ color: "#e6ebf0", roughness: 0.22 });
  const ring = mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 48).rotateX(Math.PI / 2), steel);
  const wire = canvasTex(64, 64, (x) => { x.fillStyle = "#000"; x.fillRect(0, 0, 64, 64); x.fillStyle = "#fff"; x.fillRect(0, 0, 64, 14); x.fillRect(0, 0, 14, 64); });
  wire.wrapS = wire.wrapT = THREE.RepeatWrapping; wire.repeat.set(26, 9);
  const net = mesh(new THREE.SphereGeometry(0.62, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(1, 0.55, 1),
    new THREE.MeshStandardMaterial({ color: "#cfd6dc", metalness: 0.7, roughness: 0.4, alphaMap: wire, alphaTest: 0.4, side: THREE.DoubleSide }));
  const handle = mesh(new THREE.CapsuleGeometry(0.06, 0.9, 6, 12).rotateZ(Math.PI / 2), glossy({ color: "#e5484d" }));
  handle.position.x = 1.2;
  g.add(ring, net, handle);
  return g;
}

export function muddler() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.19, 0), V2(0.2, 0.3), V2(0.11, 0.5), V2(0.1, 1.5), V2(0.16, 1.7), V2(0.14, 1.95), V2(0, 2)], 24), woodMat()));
  return g;
}

export function barSpoon() {
  const g = new THREE.Group(), steel = metal({ color: "#e6ebf0", roughness: 0.18 });
  const stem = mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 8), steel);
  stem.position.y = 1.3;
  const head = mesh(new THREE.SphereGeometry(0.13, 16, 10).scale(1, 1.4, 0.35), steel);
  head.position.y = 0.18;
  const cap = mesh(new THREE.SphereGeometry(0.07, 12, 8), glossy({ color: "#e5484d" }));
  cap.position.y = 2.52;
  g.add(stem, head, cap);
  return g;
}

export function pizzaWheel() {
  const g = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 40).rotateX(Math.PI / 2), metal({ color: "#eef2f6", roughness: 0.15 }));
  disc.position.y = 0.34;
  const hub = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16).rotateX(Math.PI / 2), glossy({ color: "#e5484d" }));
  hub.position.y = 0.34;
  const arm = mesh(new RoundedBoxGeometry(0.09, 0.5, 0.05, 2, 0.02), metal({ color: "#c9d1dc" }));
  arm.position.set(0.18, 0.55, 0); arm.rotation.z = -0.7;
  const handle = mesh(new THREE.CapsuleGeometry(0.09, 0.7, 6, 14), glossy({ color: "#e5484d" }));
  handle.position.set(0.72, 0.95, 0); handle.rotation.z = -1.0;
  g.add(disc, hub, arm, handle);
  g.userData.disc = disc;
  return g;
}

// A concha pendurada no varal (sets.hangingSet).
export function ladle() {
  const g = new THREE.Group();
  const lh = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 8), metal({ color: "#e6ebf0" })); lh.position.y = -0.95;
  const cup = mesh(new THREE.SphereGeometry(0.28, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), metal({ color: "#e6ebf0" })); cup.position.set(-0.26, -1.75, 0);
  g.add(lh, cup);
  return g;
}
