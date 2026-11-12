// Equipamentos e utensílios das estações novas: forno, grelha, liquidificador, geladeira,
// copos e ferramentas. Tudo apoiado em y = 0 (o tampo), como o resto do kit.
import { THREE, RoundedBoxGeometry, mesh, food, glossy, metal, woodMat, canvasTex, V2, seeded } from "./kit.js";

const C = (hex) => new THREE.Color(hex);
const box = (w, h, d, mat, x = 0, y = 0, z = 0, r = 0.05) => {
  const m = mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01)), mat);
  m.position.set(x, y, z);
  return m;
};
const glassMat = (o) => new THREE.MeshPhysicalMaterial({ color: "#eaf6ff", roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.26, depthWrite: false, side: THREE.DoubleSide, ...o });
const glow = (hex, k) => new THREE.MeshBasicMaterial({ color: C(hex).multiplyScalar(k) });

/* ---------- Recipientes ----------
   Todo recipiente que recebe líquido fala a mesma língua da tigela do kit:
   `fill(0..1)`, `liquid` (a malha), `rim` (raio da boca), `top` (altura da boca), `surface()`. */
function vessel(g, { r, h, floor, rBase = r }) {
  const liquid = mesh(new THREE.CylinderGeometry(r, rBase, 1, 40).translate(0, 0.5, 0), glossy({ color: "#ffffff", roughness: 0.3 }));
  liquid.position.y = floor; liquid.visible = false;
  g.add(liquid);
  Object.assign(g.userData, {
    liquid, rim: r, top: h, floor,
    surface: () => floor + liquid.scale.y,
    fill(level) {
      liquid.visible = level > 0.005;
      liquid.scale.y = Math.max(0.001, level * (h - floor - 0.12));
    },
  });
  return g;
}

// Copo de vidro: baixo e largo (caipirinha) ou alto (lassi).
export function glass({ r = 0.55, h = 1.3 } = {}) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(r * 0.84, 0), V2(r * 0.88, 0.05), V2(r, h), V2(r - 0.045, h), V2(r * 0.84 - 0.03, 0.14), V2(0, 0.14)], 48), glassMat()));
  vessel(g, { r: r * 0.9, rBase: r * 0.8, h, floor: 0.145 });
  // enfeite que só aparece na hora de servir
  const straw = mesh(new THREE.CylinderGeometry(0.035, 0.035, h * 1.5, 10), glossy({ color: "#e5484d" }));
  straw.position.set(r * 0.3, h * 0.78, -r * 0.2); straw.rotation.z = -0.22;
  straw.visible = false;
  g.add(straw);
  g.userData.garnish = () => { straw.visible = true; };
  return g;
}

// Travessa de vidro retangular; `face` é onde a camada de cima encosta.
export function glassDish(w = 2.5, d = 1.8, h = 0.62) {
  const g = new THREE.Group(), m = glassMat({ opacity: 0.3 }), t = 0.08;
  g.add(box(w, t, d, m, 0, t / 2), box(w, h, t, m, 0, h / 2, d / 2 - t / 2), box(w, h, t, m, 0, h / 2, -d / 2 + t / 2),
    box(t, h, d, m, w / 2 - t / 2, h / 2, 0), box(t, h, d, m, -w / 2 + t / 2, h / 2, 0));
  g.userData.inner = { w: w - t * 2 - 0.04, d: d - t * 2 - 0.04, y: t };
  return g;
}

/* ---------- Liquidificador ---------- */
export function blender() {
  const g = new THREE.Group(), H = 1.8;
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.8, 0), V2(0.84, 0.06), V2(0.7, 0.62), V2(0.62, 0.72), V2(0, 0.72)], 48), glossy({ color: "#7fc6c0", roughness: 0.3 })));
  const dial = mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.12, 24).rotateX(Math.PI / 2), metal({ color: "#eef2f7", roughness: 0.2 }));
  dial.position.set(0, 0.3, 0.76);
  const tick = box(0.04, 0.16, 0.04, glossy({ color: "#30353b" }), 0, 0.05, 0.07, 0.01);
  dial.add(tick);
  g.add(dial);

  const jar = new THREE.Group();
  jar.position.y = 0.72;
  jar.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.56, 0), V2(0.62, 0.06), V2(0.7, H), V2(0.66, H), V2(0.58, 0.1), V2(0, 0.1)], 48), glassMat()));
  const grip = mesh(new THREE.TorusGeometry(0.42, 0.07, 10, 24, Math.PI).rotateZ(-Math.PI / 2), glossy({ color: "#7fc6c0", roughness: 0.3 }));
  grip.position.set(0.66, H * 0.55, 0);
  jar.add(grip);
  vessel(jar, { r: 0.62, rBase: 0.56, h: H, floor: 0.11 });
  const blades = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const b = box(0.7, 0.03, 0.12, metal({ color: "#e6ebf0", roughness: 0.2 }), 0, 0, 0, 0.01);
    b.rotation.set(0.25, i * Math.PI / 2, 0.2);
    blades.add(b);
  }
  blades.position.y = 0.2;
  const lid = new THREE.Group();
  lid.add(mesh(new THREE.CylinderGeometry(0.73, 0.71, 0.14, 40), glossy({ color: "#30353b", roughness: 0.4 })));
  const plug = mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 24), glossy({ color: "#7fc6c0" }));
  plug.position.y = 0.13;
  lid.add(plug);
  lid.position.y = H + 0.06;
  jar.add(blades, lid);
  Object.assign(jar.userData, {
    mouth: new THREE.Vector3(-0.64, H, 0), // bico: por onde despeja quando inclina
    open(k) { lid.position.set(k * 1.5, H + 0.06 + Math.sin(k * Math.PI) * 0.7 - k * (H + 0.6), -k * 0.9); lid.rotation.z = -k * 0.4; },
    lid,
  });
  g.add(jar);
  g.userData.jar = jar;
  g.userData.speed = 0; // 0 = parado, 1 = no máximo
  g.userData.tick = (t) => {
    const s = g.userData.speed;
    if (jar.parent !== g) return; // a jarra saiu para servir
    blades.rotation.y = t * 50 * s;
    dial.rotation.z = -s * 2.2;
    jar.position.x = Math.sin(t * 95) * 0.012 * s;
    jar.rotation.z = Math.sin(t * 71) * 0.008 * s;
  };
  return g;
}

/* ---------- Forno ----------
   Caixa oca com porta de vidro que deita para a frente: `open(0..1)`, `heat(0..1)`, `setTemp(n)`. */
export function oven() {
  const g = new THREE.Group(), W = 3.7, H = 2.7, D = 3.0, t = 0.14, panel = 0.52;
  const enamel = glossy({ color: "#e5484d", roughness: 0.3 }), chrome = metal({ color: "#e6ebf0", roughness: 0.22 });
  g.add(box(W, t, D, enamel, 0, 0.2 + t / 2), box(W, t, D, enamel, 0, H - t / 2), box(t, H - 0.2, D, enamel, -W / 2 + t / 2, 0.2 + (H - 0.2) / 2),
    box(t, H - 0.2, D, enamel, W / 2 - t / 2, 0.2 + (H - 0.2) / 2), box(W, H - 0.2, t, enamel, 0, 0.2 + (H - 0.2) / 2, -D / 2 + t / 2));
  for (const x of [-W / 2 + 0.3, W / 2 - 0.3]) for (const z of [-D / 2 + 0.3, D / 2 - 0.3]) g.add(box(0.3, 0.2, 0.3, chrome, x, 0.1, z));
  // forro escuro que acende quando esquenta
  const liner = mesh(new THREE.BoxGeometry(W - t * 2, H - 0.2 - t * 2, D - t * 2), new THREE.MeshStandardMaterial({ color: "#3a2a24", roughness: 0.8, side: THREE.BackSide, emissive: "#ff6a1a", emissiveIntensity: 0 }));
  liner.position.set(0, 0.2 + (H - 0.2) / 2, 0); liner.userData.noShadow = true;
  g.add(liner);
  const barMat = new THREE.MeshBasicMaterial({ color: "#2a1a14" }), bars = [];
  for (const z of [-0.7, 0.7]) for (const y of [0.48, H - 0.36]) {
    const b = mesh(new THREE.CylinderGeometry(0.045, 0.045, W - 0.6, 10).rotateZ(Math.PI / 2), barMat);
    b.position.set(0, y, z); b.userData.noShadow = true; bars.push(b); g.add(b);
  }
  const rackY = 0.92;
  for (let i = 0; i < 9; i++) {
    const r = mesh(new THREE.CylinderGeometry(0.02, 0.02, W - 0.34, 6).rotateZ(Math.PI / 2), chrome);
    r.position.set(0, rackY, -D / 2 + 0.35 + i * (D - 0.7) / 8);
    g.add(r);
  }
  // painel: mostrador de temperatura e botão
  g.add(box(W, panel, 0.16, enamel, 0, H - panel / 2, D / 2 + 0.02));
  const screen = document.createElement("canvas"); screen.width = 256; screen.height = 96;
  const screenTex = new THREE.CanvasTexture(screen); screenTex.colorSpace = THREE.SRGBColorSpace;
  const display = mesh(new THREE.PlaneGeometry(1.1, 0.34), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  display.position.set(-0.7, H - panel / 2, D / 2 + 0.105);
  const knob = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 24).rotateX(Math.PI / 2), chrome);
  knob.position.set(1.0, H - panel / 2, D / 2 + 0.14);
  knob.add(box(0.04, 0.16, 0.04, glossy({ color: "#30353b" }), 0, 0.06, 0.08, 0.01));
  g.add(display, knob);
  // porta: moldura, vidro e puxador, articulada embaixo
  const door = new THREE.Group(), dh = H - panel - 0.24, dw = W - 0.06, f = 0.3;
  door.position.set(0, 0.22, D / 2 + 0.02);
  door.add(box(dw, f, 0.14, enamel, 0, f / 2, 0.02), box(dw, f, 0.14, enamel, 0, dh - f / 2, 0.02), box(f, dh, 0.14, enamel, -dw / 2 + f / 2, dh / 2, 0.02), box(f, dh, 0.14, enamel, dw / 2 - f / 2, dh / 2, 0.02));
  const pane = mesh(new THREE.PlaneGeometry(dw - f * 2 + 0.04, dh - f * 2 + 0.04), glassMat({ color: "#ffe9d0", opacity: 0.18 }));
  pane.position.set(0, dh / 2, 0.02); pane.userData.noShadow = true;
  const handle = mesh(new THREE.CapsuleGeometry(0.06, dw - 1.2, 6, 12).rotateZ(Math.PI / 2), chrome);
  handle.position.set(0, dh - 0.15, 0.24);
  for (const x of [-dw / 2 + 0.7, dw / 2 - 0.7]) door.add(box(0.08, 0.08, 0.2, chrome, x, dh - 0.15, 0.14, 0.02));
  door.add(pane, handle);
  g.add(door);

  let shown = -1;
  Object.assign(g.userData, {
    slot: new THREE.Vector3(0, rackY + 0.03, 0), // onde a assadeira apoia
    mouth: new THREE.Vector3(0, rackY + 0.03, D / 2 + 1.75), // na bancada, em frente à porta
    open(k) { door.rotation.x = k * 1.5; },
    heat(k) {
      liner.material.emissiveIntensity = k * 0.9;
      barMat.color.set("#2a1a14").lerp(C("#ff7a1a").multiplyScalar(2.2), k);
    },
    setTemp(n) {
      knob.rotation.z = -n / 300 * 4;
      const v = Math.round(n / 5) * 5;
      if (v === shown) return;
      shown = v;
      const x = screen.getContext("2d");
      x.fillStyle = "#1c1410"; x.fillRect(0, 0, 256, 96);
      x.fillStyle = v > 60 ? "#ffb347" : "#7a5a40"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = '400 64px "Lilita One", sans-serif';
      x.fillText(`${v}°C`, 128, 52);
      screenTex.needsUpdate = true;
    },
  });
  g.userData.setTemp(0);
  return g;
}

/* ---------- Grelha a carvão ---------- */
export function grill() {
  const g = new THREE.Group(), W = 3.3, D = 2.4, top = 0.78;
  const iron = metal({ color: "#2a2e33", metalness: 0.6, roughness: 0.45 });
  g.add(box(W, 0.5, D, glossy({ color: "#2a8199", roughness: 0.35 }), 0, 0.43, 0, 0.12));
  for (const x of [-W / 2 + 0.35, W / 2 - 0.35]) for (const z of [-D / 2 + 0.3, D / 2 - 0.3]) g.add(box(0.22, 0.2, 0.22, iron, x, 0.1, z));
  for (const x of [-1, 1]) { // alças de madeira
    const h = mesh(new THREE.CapsuleGeometry(0.07, 0.9, 6, 12).rotateX(Math.PI / 2), woodMat());
    h.position.set(x * (W / 2 + 0.2), 0.5, 0);
    g.add(h, box(0.24, 0.06, 0.08, iron, x * (W / 2 + 0.08), 0.5, 0.42, 0.02), box(0.24, 0.06, 0.08, iron, x * (W / 2 + 0.08), 0.5, -0.42, 0.02));
  }
  const bed = mesh(new THREE.PlaneGeometry(W - 0.3, D - 0.3).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#1a1412", roughness: 1 }));
  bed.position.y = 0.685;
  g.add(bed);
  // brasas: pedras escuras com miolo aceso
  const rand = seeded(11), hot = [], coalGeo = new THREE.DodecahedronGeometry(0.11, 1);
  for (let i = 0; i < 70; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: "#2a1c18", roughness: 0.9, emissive: i % 5 ? "#d8400c" : "#ff9a20", emissiveIntensity: 1 });
    const c = mesh(coalGeo, mat);
    c.position.set((rand() - 0.5) * (W - 0.7), 0.69 + rand() * 0.04, (rand() - 0.5) * (D - 0.7));
    c.rotation.set(rand() * 3, rand() * 3, rand() * 3); c.scale.setScalar(0.7 + rand() * 0.7); c.scale.y *= 0.5;
    c.userData.noShadow = true;
    hot.push({ mat, phase: rand() * 6 });
    g.add(c);
  }
  for (let i = 0; i < 15; i++) { // grade
    const bar = mesh(new THREE.CylinderGeometry(0.03, 0.03, D - 0.16, 8).rotateX(Math.PI / 2), iron);
    bar.position.set(-W / 2 + 0.2 + i * (W - 0.4) / 14, top - 0.03, 0);
    g.add(bar);
  }
  for (const z of [-1, 1]) g.add(box(W - 0.1, 0.07, 0.07, iron, 0, top - 0.03, z * (D / 2 - 0.06), 0.02));
  g.userData.top = top; // onde a comida encosta
  g.userData.floor = () => top;
  g.userData.heat = 1;
  g.userData.tick = (t) => hot.forEach(({ mat, phase }) => { mat.emissiveIntensity = g.userData.heat * (0.45 + 0.4 * Math.sin(t * 2.3 + phase)); }); // some apagam e reacendem
  return g;
}

/* ---------- Geladeira ----------
   Fica no chão, ao lado da bancada; y = 0 é a altura do tampo. `open(0..1)` gira a porta de cima. */
export function fridge() {
  const g = new THREE.Group(), W = 4.2, D = 4.6, lo = -5.25, mid = -0.9, hi = 4.7, t = 0.2, front = D / 2;
  const enamel = glossy({ color: "#ffd9a0", roughness: 0.28 }), chrome = metal({ color: "#e6ebf0", roughness: 0.2 });
  const tall = hi - lo;
  g.add(box(W, tall, t, enamel, 0, lo + tall / 2, -front + t / 2), box(t, tall, D, enamel, -W / 2 + t / 2, lo + tall / 2, 0), box(t, tall, D, enamel, W / 2 - t / 2, lo + tall / 2, 0),
    box(W, t, D, enamel, 0, hi - t / 2, 0, 0.1), box(W, t, D, enamel, 0, mid, 0), box(W, mid - lo - 0.1, 0.3, enamel, 0, lo + (mid - lo) / 2, front + 0.1, 0.14));
  const lowHandle = mesh(new THREE.CapsuleGeometry(0.07, 1.6, 6, 12).rotateZ(Math.PI / 2), chrome);
  lowHandle.position.set(0, mid - 0.7, front + 0.36);
  g.add(lowHandle);
  // por dentro: forro branco que brilha de leve, prateleiras de vidro e mantimentos
  const liner = mesh(new THREE.BoxGeometry(W - t * 2, hi - mid - t * 1.5, D - t * 2), new THREE.MeshStandardMaterial({ color: "#f4fbff", roughness: 0.6, side: THREE.BackSide, emissive: "#cfeaff", emissiveIntensity: 0.55 }));
  liner.position.set(0, (hi + mid) / 2, 0); liner.userData.noShadow = true;
  g.add(liner);
  const shelfY = 0.95;
  for (const y of [shelfY, 2.9]) g.add(box(W - t * 2 - 0.04, 0.07, D - t * 2 - 0.5, glassMat({ opacity: 0.4 }), 0, y, -0.15, 0.02));
  const rand = seeded(6);
  [["#fffaf0", 0.9], ["#e5484d", 0.7], ["#4cae3a", 0.6], ["#ffd23f", 1.0], ["#7a5cc8", 0.75]].forEach(([c, h], i) => {
    const b = mesh(new THREE.CylinderGeometry(0.26, 0.28, h, 20), glossy({ color: c }));
    b.position.set(-1.4 + i * 0.7, 2.94 + h / 2, -1.2 + rand() * 0.5);
    g.add(b);
  });
  for (let i = 0; i < 3; i++) {
    const b = box(0.7, 0.5, 0.9, glossy({ color: ["#7fc6c0", "#f7c3cf", "#9be3c6"][i] }), -1.1 + i * 1.1, mid + t / 2 + 0.25, -0.9, 0.1);
    g.add(b);
  }
  const door = new THREE.Group();
  door.position.set(-W / 2, 0, front);
  door.add(box(W, hi - mid - 0.1, 0.3, enamel, W / 2, (hi + mid) / 2 + 0.05, 0.1, 0.14));
  const handle = mesh(new THREE.CapsuleGeometry(0.07, 1.8, 6, 12), chrome);
  handle.position.set(W - 0.45, (hi + mid) / 2, 0.36);
  const badge = box(0.9, 0.22, 0.04, chrome, 0.9, hi - 0.7, 0.26, 0.02);
  door.add(handle, badge);
  g.add(door);
  Object.assign(g.userData, {
    slot: new THREE.Vector3(0, shelfY + 0.04, 0.4),
    mouth: new THREE.Vector3(0, shelfY + 0.6, front + 2.2),
    open(k) { door.rotation.y = -k * 1.75; },
    heat() {},
  });
  return g;
}

/* ---------- Utensílios ---------- */
export function rollingPin() { // eixo ao longo de x, apoiado em y = 0
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

export function sieve() { // peneira de mão: aro, tela e cabo
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

export function muddler() { // socador de madeira; a ponta fica na origem
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.19, 0), V2(0.2, 0.3), V2(0.11, 0.5), V2(0.1, 1.5), V2(0.16, 1.7), V2(0.14, 1.95), V2(0, 2)], 24), woodMat()));
  return g;
}

export function barSpoon() { // colher bailarina; a ponta fica na origem
  const g = new THREE.Group(), steel = metal({ color: "#e6ebf0", roughness: 0.18 });
  const stem = mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 8), steel);
  stem.position.y = 1.3;
  const head = mesh(new THREE.SphereGeometry(0.13, 16, 10).scale(1, 0.35, 1.4), steel);
  head.position.y = 0.06;
  const cap = mesh(new THREE.SphereGeometry(0.07, 12, 8), glossy({ color: "#e5484d" }));
  cap.position.y = 2.52;
  g.add(stem, head, cap);
  return g;
}

export function pizzaWheel() { // cortador de pizza: o disco roda sobre o eixo z
  const g = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 40).rotateX(Math.PI / 2), metal({ color: "#eef2f6", roughness: 0.15 }));
  disc.position.y = 0.34;
  const hub = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16).rotateX(Math.PI / 2), glossy({ color: "#e5484d" }));
  hub.position.y = 0.34;
  const arm = box(0.09, 0.5, 0.05, metal({ color: "#c9d1dc" }), 0.18, 0.55, 0, 0.02);
  arm.rotation.z = -0.7;
  const handle = mesh(new THREE.CapsuleGeometry(0.09, 0.7, 6, 14), glossy({ color: "#e5484d" }));
  handle.position.set(0.72, 0.95, 0); handle.rotation.z = -1.0;
  g.add(disc, hub, arm, handle);
  g.userData.disc = disc;
  return g;
}

// Tampo de mármore da bancada de massas, levemente enfarinhado.
export function pastrySlab() {
  const marble = canvasTex(512, 512, (x) => {
    x.fillStyle = "#f6f1ea"; x.fillRect(0, 0, 512, 512);
    const rand = seeded(21);
    x.strokeStyle = "#cfc6ba"; x.lineWidth = 2; x.globalAlpha = 0.55;
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      let px = rand() * 512, py = 0; x.moveTo(px, py);
      while (py < 512) { px += (rand() - 0.5) * 70; py += 30 + rand() * 40; x.lineTo(px, py); }
      x.stroke();
    }
    x.globalAlpha = 0.5; x.fillStyle = "#ffffff";
    for (let i = 0; i < 240; i++) { x.beginPath(); x.arc(rand() * 512, rand() * 512, 1 + rand() * 3, 0, Math.PI * 2); x.fill(); }
  });
  const g = new THREE.Group();
  const slab = box(4.6, 0.16, 3.6, food({ map: marble, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 }), 0, 0.08, 0, 0.07);
  slab.receiveShadow = true;
  g.add(slab);
  g.userData.top = 0.16;
  return g;
}
