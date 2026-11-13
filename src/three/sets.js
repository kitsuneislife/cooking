// Cenários: a cozinha (onde ficam as estações) e a banca da feira (fase 1).
// Unidade: o tampo da bancada fica em y = 0; a parede de azulejo fica em z = -3.2.
// O que fica parado (bancada, azulejo, prateleiras, janela, coifa, luminárias, miudezas,
// banca, caixotes e barracas do fundo) vem do Blender (art/blender/models, carregado por
// models.js); a versão antiga, toda em código, está em archive/sets.js.
import {
  THREE, RoundedBoxGeometry, build, mesh, food, glossy, metal, woodMat, canvasTex, paint, tex,
  mix, fbm, hash, sstep, seeded, V2, servingPlate, castAll, mergeStatic,
} from "./kit.js";
import { oven, grill, blender, fridge, pastrySlab } from "./gear.js";
import { model, part } from "./models.js";

const repeatTex = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

/* ---------- Texturas do cenário ---------- */
function wallpaper() { // papel de parede menta com listras claras e bolinhas brancas
  return canvasTex(256, 256, (x) => {
    x.fillStyle = "#b8ecd9"; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#d3f6e9";
    for (let i = 0; i < 4; i++) x.fillRect(i * 64 + 8, 0, 30, 256);
    x.fillStyle = "#ffffffcc";
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(i * 64 + 52, j * 64 + (i % 2) * 32 + 16, 4, 0, Math.PI * 2); x.fill(); }
  });
}
// Jogo americano de pano: estampa, costura tracejada a 6% da borda e cantos arredondados.
const MAT_PRINT = {
  gingham: (x, s) => { // xadrez rosa
    x.fillStyle = "#fff4f6"; x.fillRect(0, 0, s, s);
    const n = 14, w = s / n;
    x.fillStyle = "#f8b6c8aa"; for (let i = 0; i < n; i += 2) { x.fillRect(i * w, 0, w, s); x.fillRect(0, i * w, s, w); }
  },
  dots: (x, s) => { // menta com bolinhas brancas
    x.fillStyle = "#a9e6d4"; x.fillRect(0, 0, s, s);
    x.fillStyle = "#ffffff";
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) { x.beginPath(); x.arc((i + (j % 2) * 0.5) * s / 12, (j + 0.5) * s / 12, s / 70, 0, Math.PI * 2); x.fill(); }
  },
  hearts: (x, s) => { // lilás com coraçõezinhos claros
    x.fillStyle = "#cdb8f2"; x.fillRect(0, 0, s, s);
    x.fillStyle = "#efe6ff";
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      const cx = (i + (j % 2) * 0.5) * s / 7, cy = (j + 0.5) * s / 7, r = s / 40;
      x.beginPath(); x.moveTo(cx, cy + r * 1.3);
      x.bezierCurveTo(cx - r * 2, cy, cx - r, cy - r * 1.4, cx, cy - r * 0.5);
      x.bezierCurveTo(cx + r, cy - r * 1.4, cx + r * 2, cy, cx, cy + r * 1.3); x.fill();
    }
  },
};
function placemat(w, d, print) {
  const t = canvasTex(512, 512, (x, s) => {
    MAT_PRINT[print](x, s);
    x.strokeStyle = "#ffffffdd"; x.lineWidth = 5; x.setLineDash([14, 10]);
    x.strokeRect(s * 0.05, s * 0.05, s * 0.9, s * 0.9);
  });
  const m = mesh(new RoundedBoxGeometry(w, 0.024, d, 2, 0.012), food({
    map: t, roughness: 0.9, clearcoat: 0, sheen: 0.5, sheenColor: new THREE.Color("#ffffff"),
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, // o que apoia em cima ganha da toalha
  }));
  m.receiveShadow = true;
  return m;
}
// Toalhinha de renda: círculo com borda em ondas e furinhos, recortado pelo alfa.
function doily(r) {
  const t = canvasTex(512, 512, (x, s) => {
    const c = s / 2, scallop = (a) => c * (0.92 + 0.06 * Math.cos(a * 24));
    x.fillStyle = "#fffdf8"; x.beginPath();
    for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2; x.lineTo(c + Math.cos(a) * scallop(a), c + Math.sin(a) * scallop(a)); }
    x.fill();
    x.globalCompositeOperation = "destination-out"; // furos da renda
    for (const [ring, n, hole] of [[0.86, 48, 7], [0.76, 40, 9], [0.66, 32, 6]]) {
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ring; x.beginPath(); x.arc(c + Math.cos(a) * c * ring, c + Math.sin(a) * c * ring, hole, 0, Math.PI * 2); x.fill(); }
    }
    x.globalCompositeOperation = "source-over";
    x.strokeStyle = "#f2e6d6"; x.lineWidth = 3;
    for (const k of [0.6, 0.71, 0.81]) { x.beginPath(); x.arc(c, c, c * k, 0, Math.PI * 2); x.stroke(); }
  });
  const m = mesh(new THREE.CircleGeometry(r, 96), food({
    map: t, alphaTest: 0.5, roughness: 0.85, clearcoat: 0, sheen: 0.6, sheenColor: new THREE.Color("#ffffff"),
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}
function cobble() {
  return paint(512, (u, v) => {
    const cu = u * 9, cv = v * 9, row = Math.floor(cv);
    const cx = (cu + (row % 2) * 0.5) % 1, cy = cv % 1;
    const edge = Math.min(cx, 1 - cx, cy, 1 - cy);
    const tone = 0.85 + hash(Math.floor(cu + (row % 2) * 0.5), row) * 0.25;
    const c = mix([150, 120, 96], [196, 166, 130], fbm(u * 30, v * 30, 3)).map((k) => k * tone);
    return mix([96, 74, 58], c, sstep(0.02, 0.12, edge));
  });
}
function skyTex() { // céu de fim de tarde com nuvens macias
  return canvasTex(1024, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#7cc6f0"); g.addColorStop(0.6, "#bfe6f7"); g.addColorStop(1, "#ffe7c2");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const rand = seeded(9);
    x.fillStyle = "#ffffffcc";
    for (let i = 0; i < 7; i++) {
      const cx = rand() * w, cy = 60 + rand() * 160, s = 40 + rand() * 40;
      for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(cx + (k - 2) * s * 0.7, cy + Math.abs(k - 2) * 8, s * (1 - Math.abs(k - 2) * 0.18), 0, Math.PI * 2); x.fill(); }
    }
  });
}

function floorTiles() { // piso xadrez creme e rosa
  return canvasTex(128, 128, (x) => {
    for (let i = 0; i < 4; i++) { x.fillStyle = (i + (i >> 1)) % 2 ? "#f6b8c6" : "#fff4e6"; x.fillRect((i % 2) * 64, (i >> 1) * 64, 64, 64); }
    x.strokeStyle = "#eaa2b2"; x.lineWidth = 2; x.strokeRect(0, 0, 64, 64); x.strokeRect(64, 64, 64, 64);
  });
}

// Janela do Blender (caixilho, cortinas de xadrez, bandô, vasos) com o céu atrás do vidro.
function windowUnit(sky) {
  const win = model("window");
  win.add(sky);
  return win;
}

// Luminária pendente do Blender (cúpula, fio) com a lâmpada que brilha e, nas primeiras, a luz.
function pendant(lamp, lit = true) {
  const g = new THREE.Group();
  g.add(part("lamp", lamp));
  const bulb = mesh(new THREE.SphereGeometry(0.22, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff1c8").multiplyScalar(2.2) }));
  bulb.position.y = 0.06; bulb.userData.noShadow = true;
  g.add(bulb);
  if (lit) { // só as primeiras iluminam de verdade: cada luz a mais pesa em todos os materiais
    const light = new THREE.PointLight("#ffe2b8", 5, 9, 1.6);
    light.position.y = -0.3;
    g.add(light);
  }
  return g;
}

function hangingSet() { // barra de utensílios pendurados
  const g = new THREE.Group();
  const rail = mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 12), metal({ color: "#d9b46a", roughness: 0.25 }));
  rail.rotation.z = Math.PI / 2;
  g.add(rail);
  const hang = (obj, x, rotZ = 0) => {
    const hook = mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 16), metal({ color: "#d9b46a" }));
    hook.position.set(x, -0.08, 0);
    obj.position.x = x; obj.rotation.z = rotZ;
    g.add(hook, obj);
  };
  hang(model("utensils", (n) => n === "ladle"), -2.2);
  // tudo pendurado pela ponta do cabo, a parte de trabalho para baixo
  const w = build.whisk(); w.position.y = -1.15; const wg = new THREE.Group(); wg.add(w); hang(wg, -1.2);
  const sp = build.spoon(); sp.position.y = -1.7; const sg = new THREE.Group(); sg.add(sp); hang(sg, -0.4);
  // panela de frente para a câmera, cabo para cima até o gancho
  const pan = build.pan(); pan.scale.setScalar(0.62); pan.rotation.set(0, Math.PI / 2, Math.PI / 2); pan.position.set(0, -1.85, -0.3);
  const pg = new THREE.Group(); pg.add(pan); hang(pg, 1.2);
  const sm = build.pan("coral"); sm.scale.setScalar(0.48); sm.rotation.set(0, Math.PI / 2, Math.PI / 2); sm.position.set(0, -1.45, -0.3);
  const sg2 = new THREE.Group(); sg2.add(sm); hang(sg2, 2.4);
  return g;
}

/* ---------- Cozinha ---------- */
// Onde fica cada estação no tampo (x) e os planos de câmera.
export const STATION_X = { fridge: -13.3, board: -6.2, bowl: -1.2, stove: 3.8, plate: 9, grill: 15.5, oven: 21.5, bench: 27, blender: 32.5, bar: 37.5 };
const LEFT = -11, RIGHT = 40.5, MID = (LEFT + RIGHT) / 2, LENGTH = RIGHT - LEFT; // a bancada, de ponta a ponta

export function buildKitchen() {
  const k = new THREE.Group();

  // bancada: 12 módulos do Blender (tampo de réguas, gaveta, porta com almofada) que dividem
  // geometria e material; separados, a câmera de perto só desenha os módulos que vê
  // o tampo e o chão recuam um pouco na profundidade: o fundo chato de cada peça apoiada
  // fica no mesmo plano do tampo e, sem isso, os dois brigam (z-fighting) na borda
  const under = { polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 };
  const N = 12, step = LENGTH / N; // módulo de 4,3 no Blender
  const counter = Array.from({ length: N }, (_, i) => {
    const unit = part("counter", "counter");
    Object.assign(unit.material, under);
    unit.scale.x = step / 4.3; unit.position.x = LEFT + step * (i + 0.5);
    k.add(unit);
    return unit;
  });
  const floor = mesh(new THREE.PlaneGeometry(90, 30), food({ map: repeatTex(floorTiles(), 30, 10), roughness: 0.5, clearcoat: 0.4, ...under }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(MID, -5.25, 8); floor.receiveShadow = true;
  k.add(floor);
  // parede: placa de azulejo do Blender (faixa de florzinhas e filete no alto) repetida na
  // largura toda; papel de parede menta acima
  const WALL = 68, WALL_X = MID - 1; // sobra para os lados: a câmera nunca vê a ponta
  const tiles = part("wall", "wall"), PLATE = 4.08; // a placa vai de x 0 a 4,08 e fica em z 0,13
  tiles.scale.x = WALL / PLATE; tiles.position.set(WALL_X - WALL / 2, 0, -3.33);
  for (const t of new Set([tiles.material.map, tiles.material.normalMap, tiles.material.roughnessMap])) if (t) repeatTex(t, WALL / PLATE, 1);
  const paintWall = mesh(new THREE.PlaneGeometry(WALL, 12), food({ map: repeatTex(wallpaper(), WALL / 2.4, 5), roughness: 0.85, clearcoat: 0 }));
  paintWall.position.set(WALL_X, 10.1, -3.23); paintWall.receiveShadow = true;
  const lowWall = mesh(new THREE.PlaneGeometry(WALL, 5.3), food({ color: "#fde3e8", roughness: 0.9, clearcoat: 0 }));
  lowWall.position.set(WALL_X, -2.6, -3.24);
  k.add(tiles, paintWall, lowWall);

  // janelas: uma na tigela, outra na bancada de massas, as duas com o mesmo céu
  const sky = mesh(new THREE.PlaneGeometry(4.2, 3.6), new THREE.MeshBasicMaterial({ map: skyTex(), color: new THREE.Color(1.25, 1.25, 1.25) }));
  sky.position.z = -0.06; sky.userData.noShadow = true; // na frente da parede (z -3.2), atrás do caixilho
  const skies = [sky, sky.clone()];
  skies.forEach((s, i) => {
    const win = windowUnit(s);
    win.position.set([STATION_X.bowl, STATION_X.bench][i], 6.4, -3.1);
    k.add(win);
  });
  // luz do sol entrando pela janela
  const sunPatch = new THREE.SpotLight("#fff2d0", 12, 22, 0.55, 0.8, 1.2);
  sunPatch.position.set(STATION_X.bowl - 1, 9, -2.6); sunPatch.target.position.set(STATION_X.bowl + 0.5, 0, 1);
  k.add(sunPatch, sunPatch.target);

  // coifa esmaltada acima do fogão, prateleiras (despensa, pratos, temperos, bar) e miudezas
  // (relógio, manjericão, saleiros, pote de colheres, pano de prato): tudo do Blender, já no lugar
  const hoodLight = new THREE.PointLight("#ffe2b0", 6, 7, 1.5); hoodLight.position.set(STATION_X.stove, 7.4, -1.2);
  k.add(model("hood"), hoodLight, model("shelves"), model("props"));

  const rail = hangingSet(); rail.position.set(11, 3.95, -2.9); rail.scale.setScalar(0.8);
  k.add(rail);

  // luminárias pendentes: tábua e prato iluminam; as outras só brilham
  for (const [x, lamp, lit] of [[STATION_X.board, "lamp_red", true], [STATION_X.plate, "lamp_yellow", true], [STATION_X.oven, "lamp_mint", false], [STATION_X.blender, "lamp_red", false], [STATION_X.bar, "lamp_yellow", false]]) {
    const p = pendant(lamp, lit); p.position.set(x, 8.6, 0.2); k.add(p);
  }

  // estações
  const stations = {};
  const board = build.board({ knife: false }); board.scale.setScalar(1.55); board.position.set(STATION_X.board, 0, 0.3);
  stations.board = board;
  const bowl = build.mixingBowl(); bowl.scale.setScalar(1.2); bowl.position.set(STATION_X.bowl, 0, 0.4);
  stations.bowl = bowl;
  const stove = build.stove(); stove.position.set(STATION_X.stove, 0, 0.1);
  const wok = build.wok(); wok.position.set(STATION_X.stove, stove.userData.top, -0.02); wok.rotation.y = Math.PI * 0.08;
  stations.stove = stove; stations.wok = wok;
  const lace = doily(2.7); lace.position.set(STATION_X.plate, 0.008, 0.3);
  const plate = servingPlate(); plate.position.set(STATION_X.plate, 0.02, 0.3);
  stations.plate = plate;
  // jogos americanos estampados sob as estações de preparo, como na referência
  const mats = [[STATION_X.board, 0.35, 6.6, 3.9, "gingham"], [STATION_X.bowl, 0.5, 4.4, 3.1, "dots"], [STATION_X.blender, 0.3, 3.4, 2.6, "hearts"]].map(([x, z, w, d, print]) => {
    const m = placemat(w, d, print); m.position.set(x, 0, z); return m;
  });
  k.add(board, bowl, stove, wok, lace, plate, ...mats);
  stations.grill = grill(); stations.grill.position.set(STATION_X.grill, 0, 0.1);
  stations.oven = oven(); stations.oven.position.set(STATION_X.oven, 0, -1.6);
  stations.bench = pastrySlab(); stations.bench.position.set(STATION_X.bench, 0, 0.5);
  stations.blender = blender(); stations.blender.position.set(STATION_X.blender, 0, 0.2);
  stations.fridge = fridge(); stations.fridge.position.set(STATION_X.fridge, 0, -0.4);
  // bar: bandeja de madeira com borda
  const bar = new THREE.Group(), tray = woodMat();
  const base = mesh(new RoundedBoxGeometry(3.4, 0.12, 2.4, 2, 0.05), tray); base.position.y = 0.06; base.receiveShadow = true;
  bar.add(base);
  for (const [w, d, x, z] of [[3.4, 0.12, 0, 1.14], [3.4, 0.12, 0, -1.14], [0.12, 2.4, 1.64, 0], [0.12, 2.4, -1.64, 0]]) {
    const edge = mesh(new RoundedBoxGeometry(w, 0.16, d, 2, 0.05), tray); edge.position.set(x, 0.16, z); bar.add(edge);
  }
  bar.userData.top = 0.12;
  bar.position.set(STATION_X.bar, 0, 0.3);
  stations.bar = bar;
  k.add(stations.grill, stations.oven, stations.bench, stations.blender, stations.fridge, bar);

  // itens que esperam a vez ao lado das estações
  const props = {};
  const place = (key, obj, x, z, s = 1, ry = 0) => { obj.scale.multiplyScalar(s); obj.position.set(x, 0, z); obj.rotation.y = ry; k.add(obj); props[key] = obj; };
  place("soy", build.soy(), STATION_X.bowl - 2.3, -1.6, 1.05, 0.3);
  place("oyster", build.oyster(), STATION_X.bowl - 1.1, -2.1, 1.05, -0.2);
  place("sesame", build.sesame(), STATION_X.bowl + 0.1, -2.3, 1.05, 0.1);
  place("cornstarch", build.cornstarch(), STATION_X.bowl + 2.3, -1.2, 0.75, -0.6);
  place("rice", build.rice(), STATION_X.plate + 2.9, -1.4, 1.0);

  castAll(k);
  // paredes, tampo e janela só recebem sombra
  for (const o of [...counter, floor, tiles, paintWall, lowWall, lace, ...mats, ...skies]) o.castShadow = false;
  // menos chamadas de desenho: as estações que dizem o que se mexe (userData.moving) e a
  // decoração parada viram uma malha por material; o resto das estações e os itens à espera
  // ficam como estão, porque os minijogos mexem neles
  for (const st of Object.values(stations)) {
    if (!st.userData.moving) continue;
    for (const m of st.userData.moving) mergeStatic(m);
    mergeStatic(st, st.userData.moving);
  }
  mergeStatic(k, [...Object.values(stations), ...Object.values(props)]);
  return { group: k, stations, props };
}

/* ---------- Feira ---------- */
export function buildMarket() {
  const m = new THREE.Group();
  const ground = mesh(new THREE.PlaneGeometry(60, 40), food({ map: repeatTex(cobble(), 6, 4), roughness: 0.9, clearcoat: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -3.6; ground.receiveShadow = true;
  const backdrop = mesh(new THREE.PlaneGeometry(90, 34), new THREE.MeshBasicMaterial({ map: skyTex() }));
  backdrop.position.set(0, 10, -18); backdrop.userData.noShadow = true;
  m.add(ground, backdrop);

  // banca do Blender (balcão de tábuas, faixa vermelha, três degraus para os caixotes, postes,
  // toldo listrado) e, atrás, a fileira de barracas vizinhas com árvores
  const stalls = model("stalls");
  m.add(model("stand"), stalls);

  // varal de lampadinhas que brilham
  const bulbs = [];
  const bulbBase = new THREE.Color("#ffe39a").multiplyScalar(2.4);
  const bulbMat = new THREE.MeshBasicMaterial({ color: bulbBase.clone() });
  for (let i = 0; i <= 22; i++) {
    const t = i / 22, x = -9 + t * 18, y = 5.5 - Math.sin(t * Math.PI) * 0.8;
    const b = mesh(new THREE.SphereGeometry(0.12, 12, 8), bulbMat);
    b.position.set(x, y, 2.75); b.userData.noShadow = true; bulbs.push(b); m.add(b);
  }
  const wire = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bulbs.map((b) => b.position.clone().add(new THREE.Vector3(0, 0.14, 0)))), 60, 0.02, 4), glossy({ color: "#2a1a10" }));
  m.add(wire);
  const warm = new THREE.PointLight("#ffc98a", 14, 16, 1.4); warm.position.set(0, 4.6, 4.5); m.add(warm);

  // bandeirinhas de festa entre os postes, balançando com o vento
  const flags = [];
  const flagGeo = new THREE.BufferGeometry().setFromPoints([V2(-0.28, 0), V2(0.28, 0), V2(0, -0.62)].map((p) => new THREE.Vector3(p.x, p.y, 0)));
  flagGeo.computeVertexNormals();
  const flagColors = ["#e5484d", "#ffd23f", "#2a8199", "#4cbb5f", "#ff9a1f", "#7a5cc8"];
  for (let i = 0; i < 26; i++) {
    const t = (i + 0.5) / 26, x = -8.8 + t * 17.6, y = 6.1 - Math.sin(t * Math.PI) * 0.35; // acima da banca: não tapa o degrau de cima
    const f = mesh(flagGeo, food({ color: flagColors[i % flagColors.length], roughness: 0.8, clearcoat: 0 }));
    f.position.set(x, y, 3.05); f.userData.noShadow = true; flags.push(f); m.add(f);
  }
  const cord = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
    const t = i / 12; return new THREE.Vector3(-9 + t * 18, 6.1 - Math.sin(t * Math.PI) * 0.35, 3.05);
  })), 60, 0.015, 4), glossy({ color: "#fff6e3" }));
  m.add(cord);

  // cesta de compras no balcão, à direita
  const basket = build.basket({ filled: false }); basket.scale.setScalar(1.05); basket.position.set(7.5, 0, 2.0); basket.rotation.y = 0.5;
  m.add(basket);

  castAll(m);
  ground.castShadow = false;
  stalls.traverse((o) => { o.castShadow = false; }); // longe demais para a sombra alcançar a banca

  // vento nas bandeirinhas e lâmpadas que piscam devagar, cada uma no seu tempo
  const tick = (t) => {
    flags.forEach((f, i) => { f.rotation.x = Math.sin(t * 2.1 + i * 0.7) * 0.25; f.rotation.y = Math.sin(t * 1.3 + i) * 0.15; });
    bulbMat.color.copy(bulbBase).multiplyScalar(1 + Math.sin(t * 1.5) * 0.1);
  };
  return { group: m, basket, stall, tick };
}

/* Banca da partida: `n` caixotes em três degraus, inclinados para o freguês como na feira.
   Devolve o grupo, onde apoiar cada item e a inclinação. */
const CRATE_TILT = 0.3;
const PAPER = ["#9be3c6", "#ffd9a0", "#f7c3cf"];
function stall(n) {
  const g = new THREE.Group(), slots = [];
  const perRow = [0, 1, 2].map((r) => Math.floor(n / 3) + (r >= 3 - (n % 3) ? 1 : 0)); // sobras vão para trás
  const cols = Math.max(...perRow), gap = Math.min(2.55, 12.6 / cols), w = gap - 0.22, d = 1.3;
  const plank = food({ color: "#e2b27a", map: tex("wood"), roughness: 0.7 });
  perRow.forEach((count, tier) => {
    const y = tier * 1.15 + 0.15, z = -tier * 1.5 + 0.9;
    for (let i = 0; i < count; i++) {
      // caixote de ripas do Blender (2,33 de largura), esticado para a largura da fileira
      const crate = model("crate");
      crate.children[0].scale.x = w / 2.33;
      const paper = mesh(new THREE.PlaneGeometry(w - 0.2, d - 0.15), food({ color: PAPER[(i + tier) % 3], roughness: 0.9, clearcoat: 0 }));
      paper.rotation.x = -Math.PI / 2; paper.position.y = 0.11; paper.receiveShadow = true;
      crate.add(paper);
      const x = (i - (count - 1) / 2) * gap, lift = Math.sin(CRATE_TILT) * d / 2; // ergue para a frente não afundar no degrau
      crate.position.set(x, y + lift, z);
      crate.rotation.x = CRATE_TILT;
      const wedge = mesh(new RoundedBoxGeometry(w * 0.9, lift * 2, 0.2, 1, 0.03), plank); // calço sob a borda de trás
      wedge.position.set(x, y + lift, z - d / 2 + 0.15);
      g.add(crate, wedge);
      slots.push({ pos: new THREE.Vector3(x, y + lift + 0.1, z), size: w });
    }
  });
  castAll(g);
  return { group: g, slots, tilt: CRATE_TILT };
}
