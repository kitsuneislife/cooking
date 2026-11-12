// Peças comuns aos minijogos 3D.
import { THREE } from "../kit.js";
import { ease } from "../world.js";
import { STATION_X } from "../sets.js";
import { glass } from "../gear.js";
import { sfx } from "../../game/sound.js";

export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// Tudo que um minijogo põe na cena ou no laço passa por aqui, para sair junto no fim.
// `keep` marca o que fica para a etapa seguinte (a carne fatiada, o molho pronto…).
export function scope(world) {
  const objects = new Set(), offs = new Set(), kept = new Set();
  const s = {
    alive: true,
    add(obj, parent = world.scene) { parent.add(obj); objects.add(obj); return obj; },
    keep(obj) { kept.add(obj); return obj; },
    every(f) { const off = world.every((dt, t) => { if (s.alive) f(dt, t); }); offs.add(off); return off; },
    dispose() {
      s.alive = false;
      offs.forEach((off) => off());
      objects.forEach((o) => { if (!kept.has(o)) o.removeFromParent(); });
    },
  };
  return s;
}

// Voo em arco de `from` até `to`, girando de leve: o jeito de um item "pular" para outro lugar.
export function hop(world, obj, to, { height = 2, dur = 0.6, spin = 0, turn = 0 } = {}) {
  const from = obj.position.clone(), r0 = obj.rotation.clone();
  return world.tween(dur, (k) => {
    obj.position.lerpVectors(from, to, k);
    obj.position.y += Math.sin(k * Math.PI) * height;
    obj.rotation.x = r0.x + spin * k;
    obj.rotation.y = r0.y + turn * k;
  }, ease.inOut);
}

// Amassa e volta, como borracha: chamado quando algo cai ou é tocado.
export function squash(world, obj, amount = 0.25, dur = 0.35) {
  const base = obj.scale.clone();
  return world.tween(dur, (k) => {
    const s = Math.sin(k * Math.PI) * amount * (1 - k);
    obj.scale.set(base.x * (1 + s), base.y * (1 - s), base.z * (1 + s));
  }, ease.linear);
}

// Anel que se completa (cozimento, progresso), sempre virado para a câmera.
export function ring(radius = 0.32) {
  const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.RingGeometry(radius * 0.72, radius, 40), new THREE.MeshBasicMaterial({ color: "#2a1a10", transparent: true, opacity: 0.45, depthTest: false }));
  const fill = new THREE.Mesh(new THREE.RingGeometry(radius * 0.72, radius, 40, 1, Math.PI / 2, 0.001), new THREE.MeshBasicMaterial({ color: "#ffffff", depthTest: false }));
  back.renderOrder = fill.renderOrder = 10;
  g.add(back, fill);
  g.userData.set = (k, color) => {
    fill.geometry.dispose();
    fill.geometry = new THREE.RingGeometry(radius * 0.72, radius, 40, 1, Math.PI / 2, -Math.max(0.001, Math.min(1, k)) * Math.PI * 2);
    fill.material.color.set(color);
  };
  return g;
}

// Linha tracejada no tampo (guia de corte), feita de pastilhas que pulsam.
export function dashes(length, axis = "z", color = "#ffffff") {
  const g = new THREE.Group(), n = Math.round(length / 0.22);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: 0.9, depthWrite: false });
  for (let i = 0; i < n; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(axis === "z" ? 0.05 : 0.12, 0.01, axis === "z" ? 0.12 : 0.05), mat);
    d.position[axis] = -length / 2 + (i + 0.5) * (length / n);
    g.add(d);
  }
  g.userData.mat = mat;
  return g;
}

// Jorro de líquido de `from` até `to`: um cilindro esticado que balança de leve.
export function stream(color) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1, 12, 1, true), new THREE.MeshPhysicalMaterial({ color, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92 }));
  m.visible = false;
  m.userData.aim = (from, to, width = 1) => {
    const d = to.clone().sub(from), len = d.length();
    m.position.copy(from).addScaledVector(d, 0.5);
    m.scale.set(width, len, width);
    m.quaternion.setFromUnitVectors(v3(0, 1, 0), d.normalize());
  };
  return m;
}

/* ---------- Recipientes ----------
   Os minijogos pedem o recipiente pelo nome; copos nascem na primeira vez que alguém pede. */
export function vessels(world, name) {
  const { stations } = world.kitchen;
  if (name === "bowl") return [stations.bowl];
  if (name === "blender") return [stations.blender.userData.jar];
  if (!world.dish[name]) {
    const g = new THREE.Group();
    if (name === "tumbler") {
      const t = glass(); t.scale.setScalar(1.35);
      g.add(t);
      g.position.set(STATION_X.bar, stations.bar.userData.top, stations.bar.position.z);
    } else if (name === "glasses") {
      for (const x of [-0.85, 0.85]) { const t = glass({ r: 0.42, h: 1.6 }); t.scale.setScalar(1.25); t.position.x = x; g.add(t); }
      g.position.set(STATION_X.plate, 0.02, 0.3);
      stations.plate.visible = false; // os copos ocupam o lugar do prato
    } else throw new Error(`Recipiente desconhecido: ${name}`);
    world.scene.add(g);
    world.dish[name] = g;
  }
  return world.dish[name].children.filter((c) => c.userData.fill);
}
// Onde ficam os pedaços sólidos dentro de um recipiente (gomos, gelo, cubos).
export function inside(v) {
  if (!v.userData.inside) { v.userData.inside = new THREE.Group(); v.add(v.userData.inside); }
  return v.userData.inside;
}
// Medidas do recipiente no mundo: centro da boca, raio da boca e altura do líquido.
export const mouthOf = (v) => v.localToWorld(v3(0, v.userData.top, 0));
export const rimOf = (v) => v.userData.rim * v.getWorldScale(v3(0, 0, 0)).x;
export const surfaceOf = (v) => v.localToWorld(v3(0, v.userData.surface(), 0));

// Vai e vem do ponteiro (ou das setas): chama `stroke(direção)` a cada troca de sentido no eixo.
export function zigzag(axis, stroke, live) {
  const at = axis === "x" ? "clientX" : "clientY", keys = axis === "x" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
  let last = null, dir = 0;
  const turn = (d) => { if (d !== dir) { dir = d; stroke(d); } };
  return {
    input: {
      down: (e) => { last = e[at]; dir = 0; },
      move: (e) => {
        if (last == null || !live()) return;
        const d = e[at] - last;
        if (Math.abs(d) < 25) return;
        turn(Math.sign(d));
        last = e[at];
      },
      up: () => { last = null; },
    },
    key(e, down) {
      const i = keys.indexOf(e.key);
      if (i < 0) return;
      e.preventDefault();
      if (down && live() && !e.repeat) turn(i ? 1 : -1);
    },
  };
}

// Camada pintada por cima de uma superfície redonda `{ y, r }` ou retangular `{ y, w, d }`:
// um canvas que vai sendo desenhado (molho, creme, cacau, temperos). Coordenadas locais da superfície.
export function layer(face, lift = 0.004) {
  const S = 256, w = face.r ? face.r * 2 : face.w, d = face.r ? face.r * 2 : face.d;
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = S;
  const x = canvas.getContext("2d");
  x.beginPath();
  if (face.r) x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); else x.rect(0, 0, S, S);
  x.clip(); // nada vaza para fora da superfície
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ map, transparent: true, depthWrite: false, roughness: 0.35, clearcoat: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.position.y = face.y + lift;
  m.receiveShadow = true;
  const px = (lx) => (lx / w + 0.5) * S, pz = (lz) => (lz / d + 0.5) * S;
  Object.assign(m.userData, {
    w, d, ctx: x, px, pz,
    within: (lx, lz) => (face.r ? Math.hypot(lx, lz) <= face.r : Math.abs(lx) <= w / 2 && Math.abs(lz) <= d / 2),
    dot(lx, lz, r, color, alpha = 1) {
      x.globalAlpha = alpha; x.fillStyle = color;
      x.beginPath(); x.ellipse(px(lx), pz(lz), r / w * S, r / d * S, 0, 0, Math.PI * 2); x.fill();
      map.needsUpdate = true;
    },
    // `n` pontinhos ao acaso, de tamanho `size` (unidades da cena)
    sprinkle(n, colors, size) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, k = Math.sqrt(Math.random());
        const lx = face.r ? Math.cos(a) * k * face.r : (Math.random() - 0.5) * w, lz = face.r ? Math.sin(a) * k * face.r : (Math.random() - 0.5) * d;
        m.userData.dot(lx, lz, size * (0.6 + Math.random() * 0.8), colors[i % colors.length], 0.9);
      }
    },
    flood(color) { x.globalAlpha = 1; x.fillStyle = color; x.fillRect(0, 0, S, S); map.needsUpdate = true; },
  });
  return m;
}

// Nova camada em cima de `obj` (que tem `userData.face`): cada uma fica um fio acima da anterior.
export function addLayer(obj) {
  const u = obj.userData, n = u.layers = (u.layers ?? 0) + 1;
  const m = layer({ ...u.face, y: u.face.y + n * 0.012 });
  m.renderOrder = n;
  (u.top?.isObject3D ? u.top : obj).add(m); // nos copos, `top` é a altura da boca

  return m;
}

// O prato pronto: de onde a câmera olha e a comemoração. `key` é o que ficou em `world.dish`.
export function hero(world, key) {
  const obj = world.dish[key];
  if (!obj) throw new Error(`Nada pronto para servir em dish.${key}`);
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(v3(0, 0, 0)), size = box.getSize(v3(0, 0, 0));
  const r = Math.max(size.x, size.y, size.z);
  world.dish.hero = { center: c, radius: Math.max(4.4, r * 1.8) };
  return {
    shot: { pos: c.clone().add(v3(0.4, 1.4 + r * 0.6, 2.6 + r * 1.5)), look: c, fov: 30 },
    async show() {
      obj.traverse((o) => o.userData.garnish?.());
      sfx.reveal();
      world.fx.sparkle(c.clone().add(v3(0, size.y / 2 + 0.3, 0)), 22);
      await world.wait(1.5);
    },
  };
}

// Nota pela velocidade: terminar com folga vale 1; perto do fim do tempo, cai até `floor`.
export const speedScore = (used, total, floor = 0.55) => Math.max(floor, Math.min(1, 1 - (used / total - 0.55) / 0.45 * (1 - floor)));
