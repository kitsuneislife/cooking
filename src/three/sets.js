// Cenários: a cozinha (onde ficam as estações) e a banca da feira (fase 1).
// Unidade: o tampo da bancada fica em y = 0; a parede de azulejo fica em z = -3.2.
import {
  THREE, RoundedBoxGeometry, build, mesh, food, glossy, metal, woodMat, canvasTex, paint, tex,
  rgb, mix, fbm, hash, sstep, seeded, V2, servingPlate, riceMound, castAll,
} from "./kit.js";

const repeatTex = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

/* ---------- Texturas do cenário ---------- */
function subwayTiles() { // azulejo creme 2:1 com rejunte claro e leve variação
  return canvasTex(512, 512, (x) => {
    x.fillStyle = "#e9dcc6"; x.fillRect(0, 0, 512, 512);
    const rand = seeded(3);
    for (let row = 0; row < 8; row++) for (let col = -1; col < 4; col++) {
      const px = col * 128 + (row % 2) * 64 + 4, py = row * 64 + 4;
      const l = 92 + rand() * 6;
      const g = x.createLinearGradient(0, py, 0, py + 56);
      g.addColorStop(0, `hsl(38 60% ${l}%)`); g.addColorStop(1, `hsl(36 45% ${l - 5}%)`);
      x.fillStyle = g; x.beginPath(); x.roundRect(px, py, 120, 56, 8); x.fill();
      x.fillStyle = "#ffffff99"; x.beginPath(); x.roundRect(px + 8, py + 6, 50, 7, 4); x.fill(); // brilho do esmalte
    }
  });
}
function accentTiles() { // faixa de azulejo decorado: flor de quatro pétalas em azul-petróleo
  return canvasTex(256, 256, (x) => {
    x.fillStyle = "#fbf3e2"; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "#d8c8ac"; x.lineWidth = 6; x.strokeRect(0, 0, 256, 256);
    x.fillStyle = "#2a8199";
    for (let i = 0; i < 4; i++) {
      x.save(); x.translate(128, 128); x.rotate(i * Math.PI / 2);
      x.beginPath(); x.ellipse(0, -46, 26, 44, 0, 0, Math.PI * 2); x.fill(); x.restore();
    }
    x.fillStyle = "#ffd23f"; x.beginPath(); x.arc(128, 128, 20, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#e5484d";
    for (const [cx, cy] of [[0, 0], [256, 0], [0, 256], [256, 256]]) { x.beginPath(); x.arc(cx, cy, 34, 0, Math.PI * 2); x.fill(); }
  });
}
function butcherBlock() { // tampo de réguas coladas, cada uma de um tom
  const tones = ["#c98a4e", "#dba06a", "#b97a40", "#e2ad78", "#c48550", "#d39a60"].map(rgb);
  return paint(512, (u, v) => {
    const strip = Math.floor(v * 10), base = tones[strip % tones.length];
    const grain = 0.5 + 0.5 * Math.sin(u * 90 + fbm(u * 4, v * 40 + strip * 3) * 8);
    let c = mix(base, mix(base, [90, 50, 20], 0.35), grain * 0.5);
    return mix(c, [70, 40, 18], 1 - sstep(0.0, 0.012, Math.abs((v * 10) % 1 - 0.5) - 0.488)); // junta escura
  }, { repeat: 1 });
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
function skyTex(stalls) { // céu de fim de tarde com nuvens macias e, na feira, barracas ao fundo
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
    if (!stalls) return;
    const colors = ["#e5484d", "#2a8199", "#ff9a1f", "#4cbb5f", "#7a5cc8"];
    for (let i = 0; i < 9; i++) { // barraquinhas distantes: toldo listrado e balcão
      const sx = i * 120 - 20 + rand() * 30, sw = 100, top = 330 + rand() * 30;
      x.fillStyle = "#c9a07a"; x.fillRect(sx + 6, top + 26, sw - 12, h - top);
      for (let k = 0; k < 6; k++) { x.fillStyle = k % 2 ? "#fff6e3" : colors[i % colors.length]; x.fillRect(sx + k * sw / 6, top, sw / 6, 30); }
      x.fillStyle = "#00000022"; x.fillRect(sx + 6, top + 30, sw - 12, 10);
    }
  });
}

/* ---------- Peças de decoração ---------- */
function jar(color, h, seed) { // pote de vidro com conteúdo e tampa de madeira
  const g = new THREE.Group(), r = 0.42;
  const glass = new THREE.MeshPhysicalMaterial({ color: "#eaf6ff", roughness: 0.05, transparent: true, opacity: 0.3, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(r, 0), V2(r + 0.03, 0.08), V2(r + 0.03, h), V2(r - 0.05, h + 0.08)], 32), glass));
  const fillH = h * (0.55 + seeded(seed)() * 0.3);
  const stuff = mesh(new THREE.CylinderGeometry(r - 0.03, r - 0.03, fillH, 28), food({ color, roughness: 0.8, clearcoat: 0, bumpMap: tex("speckle"), bumpScale: 3 }));
  stuff.position.y = fillH / 2 + 0.02;
  const lid = mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.04, 0.2, 28), woodMat());
  lid.position.y = h + 0.16;
  g.add(stuff, lid);
  return g;
}

function pottedHerb(seed, leafColor = "#4cae3a", potColor = "#d9693a") {
  const g = new THREE.Group(), rand = seeded(seed);
  g.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.42, 0), V2(0.55, 0.7), V2(0.62, 0.72), V2(0.62, 0.86), V2(0.5, 0.86), V2(0, 0.8)], 32), glossy({ color: potColor, roughness: 0.6, clearcoat: 0.2 })));
  const leafGeo = new THREE.SphereGeometry(0.17, 12, 8).scale(1, 0.35, 1.6);
  const leaf = food({ color: leafColor, roughness: 0.45, clearcoat: 0.5 });
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2, h = 0.9 + rand() * 0.9, r = rand() * 0.45;
    const l = mesh(leafGeo, leaf);
    l.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
    l.rotation.set(rand() - 0.5, a, 0.4 + rand() * 0.6);
    g.add(l);
  }
  return g;
}

function pendant(color) { // luminária pendente: cúpula esmaltada e lâmpada que brilha
  const g = new THREE.Group();
  const cord = mesh(new THREE.CylinderGeometry(0.025, 0.025, 6, 6), glossy({ color: "#2a1a10" }));
  cord.position.y = 3.3;
  const shade = mesh(new THREE.LatheGeometry([V2(0.12, 0.6), V2(0.25, 0.55), V2(0.75, 0.05), V2(0.82, 0), V2(0.78, -0.02)], 40), glossy({ color, roughness: 0.3 }));
  const bulb = mesh(new THREE.SphereGeometry(0.22, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff1c8").multiplyScalar(2.2) }));
  bulb.position.y = 0.06; bulb.userData.noShadow = true;
  const light = new THREE.PointLight("#ffd9a0", 9, 9, 1.6);
  light.position.y = -0.3;
  g.add(cord, shade, bulb, light);
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
  const ladle = new THREE.Group();
  const lh = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 8), metal({ color: "#e6ebf0" })); lh.position.y = -0.95;
  const cup = mesh(new THREE.SphereGeometry(0.28, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), metal({ color: "#e6ebf0" })); cup.position.y = -1.75;
  ladle.add(lh, cup);
  hang(ladle, -2.2);
  const w = build.whisk(); w.rotation.z = Math.PI; w.position.y = -1.05; const wg = new THREE.Group(); wg.add(w); hang(wg, -1.2);
  const sp = build.spoon(); sp.rotation.z = Math.PI; sp.position.y = -0.2; const sg = new THREE.Group(); sg.add(sp); hang(sg, -0.4);
  const pan = build.pan(); pan.scale.setScalar(0.62); pan.rotation.set(Math.PI / 2, 0, -Math.PI / 2); pan.position.set(0, -1.9, -0.25);
  const pg = new THREE.Group(); pg.add(pan); hang(pg, 1.2);
  const sm = build.pan(); sm.scale.setScalar(0.48); sm.rotation.set(Math.PI / 2, 0, -Math.PI / 2); sm.position.set(0, -1.5, -0.2);
  sm.children[0].material = glossy({ color: "#ef6b4a" });
  const sg2 = new THREE.Group(); sg2.add(sm); hang(sg2, 2.4);
  return g;
}

function curtain(side) { // cortina de xadrez franzida, presa por uma fita
  const geo = new THREE.PlaneGeometry(1.4, 4.4, 24, 30), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const pinch = 1 - 0.55 * Math.exp(-((y + 0.6) ** 2) * 2.2); // amarrada na altura da fita
    p.setX(i, (x + side * 0.7) * pinch - side * 0.7);
    p.setZ(i, Math.sin(x * 9 + y * 0.5) * 0.12 * pinch);
  }
  geo.computeVertexNormals();
  const t = tex("gingham").clone(); t.repeat.set(0.7, 2.2); t.needsUpdate = true;
  const m = mesh(geo, food({ map: t, roughness: 0.85, clearcoat: 0, sheen: 0.6, sheenColor: new THREE.Color("#fff") }));
  const tie = mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 20), glossy({ color: "#e5484d" }));
  tie.position.set(side * -0.35, -0.6, 0.1); tie.scale.set(1, 0.5, 1); tie.rotation.x = Math.PI / 2;
  const g = new THREE.Group(); g.add(m, tie);
  return g;
}

function towel() { // pano de prato pendurado na beira da bancada
  const geo = new THREE.PlaneGeometry(1.3, 2.2, 10, 20), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    if (y > 0.4) { p.setZ(i, (y - 0.4) * -1); p.setY(i, 0.4 + 0.02); } // a parte de cima deita no tampo
    p.setZ(i, p.getZ(i) + Math.sin(x * 6) * 0.04);
  }
  geo.computeVertexNormals();
  const t = canvasTex(256, 256, (x) => {
    x.fillStyle = "#fff8ee"; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#e5484d"; for (const y of [40, 64, 192, 216]) x.fillRect(0, y, 256, y % 64 ? 8 : 14);
  });
  return mesh(geo, food({ map: t, roughness: 0.9, clearcoat: 0, sheen: 0.5 }));
}

/* ---------- Cozinha ---------- */
// Onde fica cada estação no tampo (x) e os planos de câmera.
export const STATION_X = { board: -6.2, bowl: -1.2, stove: 3.8, plate: 9 };

export function buildKitchen() {
  const k = new THREE.Group();

  // tampo de réguas e armários de baixo
  const top = mesh(new RoundedBoxGeometry(26, 0.5, 6.2, 3, 0.12), food({ map: repeatTex(butcherBlock(), 3, 1), roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 }));
  top.position.set(2, -0.25, -0.1); top.receiveShadow = true;
  k.add(top);
  const cab = mesh(new THREE.BoxGeometry(25.6, 5, 5.8), glossy({ color: "#fbefd9", roughness: 0.4 }));
  cab.position.set(2, -2.75, -0.3);
  k.add(cab);
  for (let i = 0; i < 6; i++) { // portas com puxador redondo
    const door = mesh(new RoundedBoxGeometry(3.9, 4.2, 0.12, 3, 0.06), glossy({ color: "#7fc6c0", roughness: 0.35 }));
    door.position.set(-9.8 + i * 4.15 + 2, -2.85, 2.6);
    const knob = mesh(new THREE.SphereGeometry(0.16, 16, 12), metal({ color: "#d9b46a" }));
    knob.position.set(door.position.x + (i % 2 ? -1.5 : 1.5), -1.4, 2.72);
    k.add(door, knob);
  }

  // parede: azulejo até a faixa decorada, pintura azul-petróleo acima
  const tiles = mesh(new THREE.PlaneGeometry(30, 3.4), food({ map: repeatTex(subwayTiles(), 15, 1.7), roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }));
  tiles.position.set(2, 1.7, -3.2); tiles.receiveShadow = true;
  const band = mesh(new THREE.PlaneGeometry(30, 0.75), food({ map: repeatTex(accentTiles(), 40, 1), roughness: 0.3, clearcoat: 0.8 }));
  band.position.set(2, 3.77, -3.19); band.receiveShadow = true;
  const paintWall = mesh(new THREE.PlaneGeometry(30, 12), food({ color: "#2f8fa6", roughness: 0.9, clearcoat: 0 }));
  paintWall.position.set(2, 10.1, -3.21); paintWall.receiveShadow = true;
  k.add(tiles, band, paintWall);

  // janela com céu, caixilho branco, cortinas e vaso no peitoril
  const win = new THREE.Group();
  const sky = mesh(new THREE.PlaneGeometry(4.2, 3.6), new THREE.MeshBasicMaterial({ map: skyTex(false), color: new THREE.Color(1.25, 1.25, 1.25) }));
  sky.position.z = -0.25; sky.userData.noShadow = true;
  const frameMat = glossy({ color: "#fffaf0", roughness: 0.3 });
  for (const [w, h, x, y] of [[4.6, 0.25, 0, 1.9], [4.6, 0.25, 0, -1.9], [0.25, 4, -2.2, 0], [0.25, 4, 2.2, 0], [0.12, 3.6, 0, 0], [4.2, 0.12, 0, 0.3]]) {
    const b = mesh(new RoundedBoxGeometry(w, h, 0.3, 2, 0.05), frameMat); b.position.set(x, y, 0); win.add(b);
  }
  const sill = mesh(new RoundedBoxGeometry(5.2, 0.18, 0.9, 2, 0.06), frameMat); sill.position.set(0, -2.05, 0.3);
  const herb = pottedHerb(4); herb.scale.setScalar(0.6); herb.position.set(1.4, -1.96, 0.35);
  const herb2 = pottedHerb(8, "#5fbf4a", "#f2c14a"); herb2.scale.setScalar(0.48); herb2.position.set(-1.6, -1.96, 0.35);
  const cl = curtain(-1), cr = curtain(1);
  cl.position.set(-2.5, -0.1, 0.35); cr.position.set(2.5, -0.1, 0.35);
  win.add(sky, sill, herb, herb2, cl, cr);
  win.position.set(STATION_X.bowl, 6.4, -3.1);
  k.add(win);
  // luz do sol entrando pela janela
  const sunPatch = new THREE.SpotLight("#fff2d0", 30, 22, 0.55, 0.8, 1.2);
  sunPatch.position.set(STATION_X.bowl - 1, 9, -2.6); sunPatch.target.position.set(STATION_X.bowl + 0.5, 0, 1);
  k.add(sunPatch, sunPatch.target);

  // coifa acima do fogão
  const hood = mesh(new THREE.CylinderGeometry(0.9, 2.3, 1.6, 4, 1), metal({ color: "#dfe4e8", roughness: 0.3, roughnessMap: tex("brushed") }));
  hood.rotation.y = Math.PI / 4; hood.scale.set(1.35, 1, 0.75); hood.position.set(STATION_X.stove, 8.4, -2.05);
  const chimney = mesh(new THREE.BoxGeometry(1.5, 4, 1.2), metal({ color: "#dfe4e8", roughness: 0.3 }));
  chimney.position.set(STATION_X.stove, 11, -2.6);
  const hoodLight = new THREE.PointLight("#ffe2b0", 6, 7, 1.5); hoodLight.position.set(STATION_X.stove, 7.4, -1.2);
  k.add(hood, chimney, hoodLight);

  // prateleiras com potes, tigelas e livro de receitas
  const shelfMat = woodMat();
  for (const [x, y, w] of [[-8, 5.2, 5.5], [-8, 7.3, 5.5], [11, 5.6, 5]]) {
    const s = mesh(new RoundedBoxGeometry(w, 0.2, 1.1, 2, 0.06), shelfMat);
    s.position.set(x, y, -2.6); s.receiveShadow = true;
    for (const dx of [-w / 2 + 0.6, w / 2 - 0.6]) {
      const br = mesh(new RoundedBoxGeometry(0.15, 0.6, 0.9, 1, 0.05), shelfMat); br.position.set(x + dx, y - 0.38, -2.65); k.add(br);
    }
    k.add(s);
  }
  [["#f2d27a", 1.1], ["#c2412d", 0.9], ["#fff6e3", 1.3], ["#6a3a1a", 0.8]].forEach(([c, h], i) => {
    const j = jar(c, h, i + 2); j.position.set(-10 + i * 1.15, 5.3, -2.55); k.add(j);
  });
  for (let i = 0; i < 4; i++) { // pilha de tigelas
    const b = mesh(new THREE.LatheGeometry([V2(0.3, 0), V2(0.6, 0.35), V2(0.62, 0.36), V2(0.32, 0.03)], 32), glossy({ color: ["#ef6b4a", "#ffd23f", "#7fc6c0", "#fff6e3"][i] }));
    b.position.set(-6.4, 7.42 + i * 0.12, -2.55); k.add(b);
  }
  const book = mesh(new RoundedBoxGeometry(0.35, 1.5, 1.1, 2, 0.04), glossy({ color: "#e5484d" }));
  book.position.set(-8.9, 8.15, -2.6); book.rotation.z = 0.12;
  const book2 = mesh(new RoundedBoxGeometry(0.3, 1.3, 1.0, 2, 0.04), glossy({ color: "#2a8199" }));
  book2.position.set(-9.3, 8.05, -2.6);
  const ivy = pottedHerb(21, "#3f9a3a", "#fff6e3"); ivy.scale.setScalar(0.7); ivy.position.set(-10.2, 7.4, -2.55);
  k.add(book, book2, ivy);
  for (let i = 0; i < 4; i++) { // pratos de pé na prateleira da direita
    const p = servingPlate(); p.scale.setScalar(0.42); p.rotation.x = -1.35; p.position.set(9.3 + i * 0.5, 6.55, -2.65);
    k.add(p);
  }
  const fruit = new THREE.Group(); // fruteira com limões
  fruit.add(mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.5, 0), V2(1.1, 0.5), V2(1.15, 0.52)], 32), glossy({ color: "#fff6e3" })));
  for (let i = 0; i < 5; i++) {
    const l = mesh(new THREE.SphereGeometry(0.32, 20, 14).scale(1.25, 1, 1), glossy({ color: "#ffd23f", roughness: 0.4 }));
    l.position.set(Math.cos(i * 1.3) * 0.5, 0.45 + (i === 4 ? 0.3 : 0), Math.sin(i * 1.3) * 0.4); l.rotation.y = i;
    fruit.add(l);
  }
  fruit.position.set(12.4, 5.72, -2.5); fruit.scale.setScalar(0.7);
  k.add(fruit);

  const rail = hangingSet(); rail.position.set(11, 3.95, -2.9); rail.scale.setScalar(0.8);
  k.add(rail);

  // luminárias pendentes sobre a tábua e o prato
  for (const [x, c] of [[STATION_X.board, "#e5484d"], [STATION_X.plate, "#ffd23f"]]) {
    const p = pendant(c); p.position.set(x, 8.6, 0.2); k.add(p);
  }

  // detalhes no tampo, longe das estações
  const basil = pottedHerb(14); basil.scale.setScalar(0.9); basil.position.set(13.4, 0, -2.2);
  const tw = towel(); tw.position.set(-9.4, -0.6, 3.05);
  const salt = mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.2, 0), V2(0.22, 0.5), V2(0.12, 0.7), V2(0, 0.72)], 20), glossy({ color: "#fffaf0" }));
  salt.position.set(11.6, 0, -1.6);
  const pepper = salt.clone(); pepper.material = glossy({ color: "#3a2a22" }); pepper.position.x = 12.1;
  const utensilPot = new THREE.Group();
  utensilPot.add(mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.1, 24), glossy({ color: "#2a8199" })));
  for (let i = 0; i < 3; i++) { const s = build.spoon(); s.scale.setScalar(0.9); s.rotation.set(0.15 * (i - 1), 0, Math.PI + 0.12 * (i - 1)); s.position.set((i - 1) * 0.12, 1.85, 0); utensilPot.add(s); }
  utensilPot.position.set(-9.6, 0.55, -2.2);
  k.add(basil, tw, salt, pepper, utensilPot);

  // estações
  const stations = {};
  const board = build.board({ knife: false }); board.scale.setScalar(1.55); board.position.set(STATION_X.board, 0, 0.3);
  stations.board = board;
  const bowl = build.mixingBowl(); bowl.scale.setScalar(1.2); bowl.position.set(STATION_X.bowl, 0, 0.4);
  stations.bowl = bowl;
  const stove = build.stove(); stove.position.set(STATION_X.stove, 0, 0.1);
  const wok = build.wok(); wok.position.set(STATION_X.stove, stove.userData.top, -0.02); wok.rotation.y = Math.PI * 0.08;
  stations.stove = stove; stations.wok = wok;
  const mat = mesh(new THREE.CircleGeometry(2.6, 48), food({ map: repeatTex(tex("weave").clone(), 2, 2), roughness: 0.85, clearcoat: 0 }));
  mat.rotation.x = -Math.PI / 2; mat.position.set(STATION_X.plate, 0.01, 0.3); mat.receiveShadow = true;
  const plate = servingPlate(); plate.position.set(STATION_X.plate, 0.02, 0.3);
  stations.plate = plate;
  k.add(board, bowl, stove, wok, mat, plate);

  // itens que esperam a vez ao lado das estações
  const props = {};
  const place = (key, obj, x, z, s = 1, ry = 0) => { obj.scale.multiplyScalar(s); obj.position.set(x, 0, z); obj.rotation.y = ry; k.add(obj); props[key] = obj; };
  place("soy", build.soy(), STATION_X.bowl - 2.3, -1.6, 1.05, 0.3);
  place("oyster", build.oyster(), STATION_X.bowl - 1.1, -2.1, 1.05, -0.2);
  place("sesame", build.sesame(), STATION_X.bowl + 0.1, -2.3, 1.05, 0.1);
  place("cornstarch", build.cornstarch(), STATION_X.bowl + 2.3, -1.2, 0.75, -0.6);
  place("rice", build.rice({ sticks: false }), STATION_X.plate + 2.9, -1.4, 1.0);

  castAll(k);
  // paredes, tampo e janela só recebem sombra
  for (const o of [top, cab, tiles, band, paintWall, sky]) o.castShadow = false;
  return { group: k, stations, props };
}

/* ---------- Feira ---------- */
export function buildMarket() {
  const m = new THREE.Group();
  const ground = mesh(new THREE.PlaneGeometry(60, 40), food({ map: repeatTex(cobble(), 6, 4), roughness: 0.9, clearcoat: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -3.6; ground.receiveShadow = true;
  const backdrop = mesh(new THREE.PlaneGeometry(90, 34), new THREE.MeshBasicMaterial({ map: skyTex(true) }));
  backdrop.position.set(0, 10, -18); backdrop.userData.noShadow = true;
  m.add(ground, backdrop);

  // balcão de madeira com três degraus de caixotes
  const wood = woodMat();
  const counter = mesh(new RoundedBoxGeometry(18, 3.6, 6, 3, 0.15), food({ map: repeatTex(tex("wood").clone(), 3, 1), color: "#d9a46a", roughness: 0.6 }));
  counter.position.set(0, -1.8, 0); counter.receiveShadow = true;
  const front = mesh(new RoundedBoxGeometry(18.2, 0.9, 0.2, 2, 0.08), glossy({ color: "#e5484d" }));
  front.position.set(0, -0.7, 2.95);
  m.add(counter, front);

  // degraus de madeira: ficam fixos; os caixotes de cada partida vêm de stall()
  for (let tier = 0; tier < 3; tier++) {
    const h = 0.2 + tier * 1.15;
    const step = mesh(new RoundedBoxGeometry(13.6, h, 1.6, 2, 0.06), wood);
    step.position.set(0, h / 2 - 0.05, -tier * 1.5 + 0.9); step.receiveShadow = true;
    m.add(step);
  }

  // postes e toldo listrado, ondulado na borda
  for (const x of [-9, 9]) {
    const post = mesh(new THREE.CylinderGeometry(0.15, 0.17, 10, 12), wood);
    post.position.set(x, 1.4, 2.6); m.add(post);
    const back = post.clone(); back.position.z = -3.5; m.add(back);
  }
  const awnGeo = new THREE.PlaneGeometry(19.5, 7, 70, 12), ap = awnGeo.attributes.position;
  for (let i = 0; i < ap.count; i++) {
    const x = ap.getX(i), y = ap.getY(i);
    ap.setZ(i, -Math.sin((y + 3.5) / 7 * Math.PI) * 0.6);
    if (y < -3.3) ap.setY(i, y - 0.35 * Math.abs(Math.sin(x * 1.6))); // franja em arco
  }
  awnGeo.computeVertexNormals();
  const stripes = canvasTex(512, 64, (x) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? "#fff6e3" : "#e5484d"; x.fillRect(i * 32, 0, 32, 64); } });
  const awning = mesh(awnGeo, food({ map: stripes, roughness: 0.8, clearcoat: 0, sheen: 0.4 }));
  awning.rotation.x = -Math.PI / 2 + 0.45; awning.position.set(0, 6.8, -0.4);
  m.add(awning);

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
      const crate = new THREE.Group();
      // fundo, frente baixa (deixa ver o que tem dentro), fundo alto e laterais
      for (const [bw, bh, bd, px, py, pz] of [[w, 0.1, d, 0, 0.05, 0], [w, 0.22, 0.1, 0, 0.16, d / 2 - 0.05], [w, 0.55, 0.1, 0, 0.32, -d / 2 + 0.05], [0.1, 0.4, d, w / 2 - 0.05, 0.25, 0], [0.1, 0.4, d, -w / 2 + 0.05, 0.25, 0]]) {
        const p = mesh(new RoundedBoxGeometry(bw, bh, bd, 1, 0.03), plank);
        p.position.set(px, py, pz); crate.add(p);
      }
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
