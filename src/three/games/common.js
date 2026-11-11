// Peças comuns aos minijogos 3D.
import { THREE } from "../kit.js";
import { ease } from "../world.js";

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

// Nota pela velocidade: terminar com folga vale 1; perto do fim do tempo, cai até `floor`.
export const speedScore = (used, total, floor = 0.55) => Math.max(floor, Math.min(1, 1 - (used / total - 0.55) / 0.45 * (1 - floor)));
