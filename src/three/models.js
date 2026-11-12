// Modelos feitos no Blender (art/blender/, ver docs/cozinha/pipeline-blender.md), em
// public/models/<nome>.glb. Carregam uma vez, antes da cena ser montada; depois disso `model`
// é síncrono e cada cópia divide geometria, material e textura com as outras (só o nó é novo).
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const MODELS = [
  "broccoli", "lime", "mango", "stirfry", "chicken", "tiramisu", // ingredientes e pratos
  "counter", "wall", "shelves", "window", "hood", "lamp", "props", // cozinha
  "stand", "crate", "stalls", // feira
];
const loaded = {};

export async function loadModels(base = import.meta.env.BASE_URL) {
  const loader = new GLTFLoader();
  await Promise.all(MODELS.map(async (name) => {
    loaded[name] = (await loader.loadAsync(`${base}models/${name}.glb`)).scene;
  }));
}

// Cópia do modelo `name`; `keep` escolhe as partes pelo nome do nó (o prato pronto deixa o
// paninho de fora, porque na cozinha ele fica sobre a toalhinha de renda).
export function model(name, keep = () => true) {
  const src = loaded[name];
  if (!src) throw new Error(`Modelo não carregado: ${name} (falta loadModels antes da cena)`);
  const g = new THREE.Group();
  for (const part of src.children) if (keep(part.name)) g.add(part.clone());
  if (!g.children.length) throw new Error(`Nenhuma parte de ${name} passou no filtro`);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// Tudo o que veio do Blender, para compilar shaders e subir texturas antes de aparecer.
export const loadedModels = () => Object.values(loaded);

// Prato pronto (refogado, frango, tiramisù) do tamanho do prato da cozinha (raio 1,99).
export function dish(name) {
  const g = model(name, (part) => !part.includes("cloth"));
  const box = new THREE.Box3().setFromObject(g), r = Math.max(-box.min.x, box.max.x, -box.min.z, box.max.z);
  g.scale.setScalar(1.99 / r);
  return g;
}
