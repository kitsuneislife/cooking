// Arquivo (leva 6, vidros e garrafas): a garrafa de torno, o saleiro e os frascos de cada
// ingrediente como eram antes do bottles.glb do Blender (ver docs/cozinha/modelos-3d.md). Fica
// aqui, fora do caminho do jogo, para comparar (art/compare-current.html?item=bottles) e para
// voltar atrás se precisar. Nada no jogo importa este arquivo.
import { THREE, mesh, glossy, metal, paint, labelTexture, V2 } from "../kit.js";

// Friso da tampa, pintado (saiu do TEX de kit.js: só a garrafa antiga usava).
let ridges;
const ridgesTex = () => ridges ??= paint(64, (u) => { const g = 128 + 127 * Math.sin(u * Math.PI * 2 * 24); return [g, g, g]; }, { srgb: false });

// Garrafa de vidro com rótulo de papel e tampa frisada.
export function bottle({ r, shoulder, neckR, neckTop, glass, amber, cap, text, band, ink }) {
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
  const c = mesh(capGeo, glossy({ color: cap, bumpMap: ridgesTex(), bumpScale: 1.5 }));
  c.position.y = neckTop - 0.16;
  g.add(c);
  g.userData.mouth = new THREE.Vector3(0, neckTop, 0); // por onde o líquido sai
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
export function saltPepper() {
  const g = new THREE.Group(), salt = shaker("#fffaf0", "#2a8199"), pepper = shaker("#4a3a32", "#e5484d");
  salt.position.x = -0.32; pepper.position.x = 0.32;
  g.add(salt, pepper);
  return g;
}

// Os frascos de cada ingrediente (eram build.soy etc. em kit.js e BOTTLES em foods.js).
export const BOTTLES = {
  soy: () => bottle({ r: 0.42, shoulder: 1.0, neckR: 0.13, neckTop: 1.78, glass: "#2a160b", cap: "#d8392b", text: "SHOYU", band: "#c8352a", ink: "#5a2a1a" }),
  oyster: () => bottle({ r: 0.54, shoulder: 0.82, neckR: 0.2, neckTop: 1.42, glass: "#4a2a12", cap: "#2f7a44", text: "OSTRA", band: "#2f5f8a", ink: "#2f3f5a" }),
  sesame: () => bottle({ r: 0.34, shoulder: 1.08, neckR: 0.1, neckTop: 1.85, glass: "#e8b060", amber: "#e09a2a", cap: "#d4a73a", text: "GERGELIM", band: "#7a2a1a", ink: "#7a4a1a" }),
  teriyaki: () => bottle({ r: 0.4, shoulder: 1.1, neckR: 0.12, neckTop: 1.8, glass: "#1e1410", cap: "#f2c14a", text: "TERIYAKI", band: "#5a3a9a", ink: "#3a2a5a" }),
  oliveOil: () => bottle({ r: 0.36, shoulder: 1.15, neckR: 0.1, neckTop: 1.95, glass: "#9aa83a", amber: "#c2b52a", cap: "#2a1a10", text: "AZEITE", band: "#4a6a1a", ink: "#3a4a1a" }),
  cachaca: () => bottle({ r: 0.4, shoulder: 1.05, neckR: 0.12, neckTop: 1.85, glass: "#e6f4e0", amber: "#f6f2cc", cap: "#2a8199", text: "CACHAÇA", band: "#2f7a44", ink: "#2f5a3a" }),
  honey: () => bottle({ r: 0.46, shoulder: 0.72, neckR: 0.3, neckTop: 1.08, glass: "#f0b040", amber: "#e89a10", cap: "#ffd23f", text: "MEL", band: "#b86a10", ink: "#7a4a10" }),
  ketchup: () => bottle({ r: 0.38, shoulder: 0.95, neckR: 0.14, neckTop: 1.6, glass: "#c8201a", cap: "#fffaf0", text: "KETCHUP", band: "#7a1410", ink: "#7a1410" }),
  tomato: () => bottle({ r: 0.5, shoulder: 0.78, neckR: 0.36, neckTop: 1.12, glass: "#f0705a", amber: "#d02a1c", cap: "#d9b46a", text: "MOLHO", band: "#2f7a44", ink: "#7a2a1a" }),
  cardamom: () => bottle({ r: 0.32, shoulder: 0.6, neckR: 0.22, neckTop: 0.92, glass: "#dff0cc", amber: "#93b060", cap: "#3a7a4a", text: "CARDAMOMO", band: "#3a7a4a", ink: "#3a5a2a" }),
};
