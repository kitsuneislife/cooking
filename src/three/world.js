// O palco 3D da partida: um renderizador só, a cozinha e a feira montadas uma vez,
// câmera com planos de cinema, partículas e a entrada do ponteiro para os minijogos.
import { THREE } from "./kit.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildKitchen, buildMarket, STATION_X } from "./sets.js";

export const MARKET_X = -70; // a feira fica longe da cozinha: a câmera "viaja" entre as duas

const v = (x, y, z) => new THREE.Vector3(x, y, z);
// Planos de câmera: posição, para onde olha e abertura vertical (em graus).
export const SHOTS = {
  market: { pos: v(MARKET_X, 6.2, 15.5), look: v(MARKET_X, 1.5, 0), fov: 36 },
  wide: { pos: v(1.5, 6.8, 19), look: v(1.5, 2.8, -1), fov: 42 },
  board: { pos: v(STATION_X.board, 9.2, 5.6), look: v(STATION_X.board, 0.1, 0.55), fov: 32 },
  bowl: { pos: v(STATION_X.bowl, 7.6, 6.4), look: v(STATION_X.bowl, 0.7, -0.2), fov: 36 },
  wok: { pos: v(STATION_X.stove, 8.8, 5.2), look: v(STATION_X.stove, 1.1, 0.1), fov: 34 },
  sear: { pos: v(STATION_X.stove + 0.2, 6.4, 4.4), look: v(STATION_X.stove + 0.2, 0.5, 0.1), fov: 25 }, // mais perto: dá para ler os medidores
  plate: { pos: v(STATION_X.plate, 8.2, 5.4), look: v(STATION_X.plate, 0.3, 0.2), fov: 34 },
  hero: { pos: v(STATION_X.plate + 0.4, 3.4, 5.6), look: v(STATION_X.plate, 0.9, 0.3), fov: 30 },
};

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out: (t) => 1 - (1 - t) ** 3,
  back: (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2,
  linear: (t) => t,
};

/* ---------- Partículas ---------- */
function spriteTex(draw) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  draw(c.getContext("2d"));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const SOFT = () => spriteTex((x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "#fff"); g.addColorStop(0.4, "#ffffffaa"); g.addColorStop(1, "#fff0");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
});
const STAR = () => spriteTex((x) => {
  x.fillStyle = "#fff"; x.translate(32, 32); x.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? 6 : 30, a = i / 8 * Math.PI * 2; x.lineTo(Math.sin(a) * r, -Math.cos(a) * r); }
  x.fill();
});

class Particles {
  constructor(scene) {
    this.scene = scene;
    this.list = [];
    this.tex = { soft: SOFT(), star: STAR() };
    this.bitGeo = new THREE.BoxGeometry(1, 1, 1);
  }
  add(obj, p) { this.scene.add(obj); this.list.push({ obj, age: 0, ...p }); }
  sprite(kind, color, additive) {
    return new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.tex[kind], color, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }));
  }
  // pedacinhos que espirram e quicam no tampo (ou na superfície em `floor`)
  bits(pos, colors, n = 10, { speed = 3, size = 0.09, floor = pos.y - 0.05, up = 3 } = {}) {
    if (calm()) return;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(this.bitGeo, new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.5 }));
      m.scale.setScalar(size * (0.6 + Math.random() * 0.8));
      m.position.copy(pos);
      const a = Math.random() * Math.PI * 2;
      this.add(m, {
        life: 0.9 + Math.random() * 0.5, floor,
        vel: v(Math.cos(a) * speed * Math.random(), up * (0.6 + Math.random() * 0.6), Math.sin(a) * speed * Math.random()),
        spin: v(Math.random() * 9, Math.random() * 9, Math.random() * 9), gravity: 14, shrink: true,
      });
    }
  }
  steam(pos, n = 1, { color = "#ffffff", size = 0.9, rise = 1.6 } = {}) {
    if (calm()) return;
    for (let i = 0; i < n; i++) {
      const s = this.sprite("soft", color);
      s.material.opacity = 0;
      s.position.copy(pos).add(v((Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2));
      s.scale.setScalar(size * 0.4);
      this.add(s, { life: 1.8 + Math.random(), vel: v((Math.random() - 0.5) * 0.3, rise, 0), grow: size, fade: 0.45 });
    }
  }
  // brilhos de acerto: estrelinhas que estouram para fora
  sparkle(pos, n = 12, color = "#ffe27a", spread = 2.6) {
    if (calm()) return;
    for (let i = 0; i < n; i++) {
      const s = this.sprite("star", color, true);
      s.position.copy(pos);
      const a = i / n * Math.PI * 2, e = (Math.random() - 0.3) * 1.2;
      s.scale.setScalar(0.35 + Math.random() * 0.25);
      this.add(s, { life: 0.7 + Math.random() * 0.3, vel: v(Math.cos(a) * spread, 1.5 + e * spread * 0.5, Math.sin(a) * spread * 0.6), drag: 2.5, spin2d: 6, fade: 1 });
    }
  }
  // gotinhas de óleo e faíscas que pulam da panela
  sizzle(pos, n = 4, radius = 0.9) {
    if (calm()) return;
    for (let i = 0; i < n; i++) {
      const s = this.sprite("soft", i % 3 ? "#ffd27a" : "#fff4d0", true);
      const a = Math.random() * Math.PI * 2, r = Math.random() * radius;
      s.position.copy(pos).add(v(Math.cos(a) * r, 0, Math.sin(a) * r));
      s.scale.setScalar(0.08 + Math.random() * 0.08);
      this.add(s, { life: 0.35 + Math.random() * 0.3, vel: v(Math.cos(a) * 0.6, 2 + Math.random() * 2.5, Math.sin(a) * 0.6), gravity: 9, fade: 1 });
    }
  }
  // labareda: línguas de fogo laranja subindo da borda do wok
  flare(pos, n = 18, radius = 1.4) {
    if (calm()) return;
    for (let i = 0; i < n; i++) {
      const s = this.sprite("soft", i % 2 ? "#ff8a2a" : "#ffd24a", true);
      const a = Math.random() * Math.PI * 2, r = radius * (0.7 + Math.random() * 0.3);
      s.position.copy(pos).add(v(Math.cos(a) * r, 0, Math.sin(a) * r));
      s.scale.setScalar(0.5 + Math.random() * 0.5);
      this.add(s, { life: 0.45 + Math.random() * 0.35, vel: v(-Math.cos(a) * 0.6, 3 + Math.random() * 2, -Math.sin(a) * 0.6), grow: 0.2, fade: 1 });
    }
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i], o = p.obj;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) {
        this.scene.remove(o);
        o.material.dispose();
        this.list.splice(i, 1);
        continue;
      }
      if (p.gravity) p.vel.y -= p.gravity * dt;
      if (p.drag) p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt));
      o.position.addScaledVector(p.vel, dt);
      if (p.floor != null && o.position.y < p.floor) { // quica e perde força
        o.position.y = p.floor;
        p.vel.y = Math.abs(p.vel.y) * 0.35; p.vel.x *= 0.6; p.vel.z *= 0.6;
        if (p.spin) p.spin.multiplyScalar(0.5);
      }
      if (p.spin) { o.rotation.x += p.spin.x * dt; o.rotation.y += p.spin.y * dt; o.rotation.z += p.spin.z * dt; }
      if (p.spin2d) o.material.rotation += p.spin2d * dt;
      if (p.grow) o.scale.addScalar(p.grow * dt);
      if (p.fade) o.material.opacity = p.fade * Math.sin(Math.min(1, k) * Math.PI) ** 0.6;
      if (p.shrink && k > 0.7) o.scale.multiplyScalar(1 - dt * 6);
    }
  }
}

/* ---------- Mundo ---------- */
export async function createWorld(host) {
  try { await document.fonts.load('400 60px "Lilita One"'); } catch { /* rótulos caem na fonte do sistema */ }

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true; // a carne fatiada usa planos de corte
  const canvas = renderer.domElement;
  canvas.className = "stage3d-canvas";
  host.append(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f6e3bf");
  scene.fog = new THREE.Fog("#f3dcbc", 40, 120);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight("#fff6ec", "#e9a99c", 0.85));
  const sun = new THREE.DirectionalLight("#fff0da", 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight("#ffd9e6", 0.55);
  fill.position.set(10, 6, 8);
  scene.add(fill);

  const kitchen = buildKitchen();
  const market = buildMarket();
  market.group.position.x = MARKET_X;
  scene.add(kitchen.group, market.group);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // só o que passa do branco (faíscas, chamas, brilhos) floresce; o creme da cozinha fica nítido
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.22, 0.35, 1.3);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const fx = new Particles(scene);

  // ---- câmera: planos com travelling suave, respiração e tremor ----
  const rig = {
    pos: SHOTS.wide.pos.clone(), look: SHOTS.wide.look.clone(), fov: SHOTS.wide.fov,
    move: null, orbit: null, shake: 0, t: 0,
  };
  function go(shot, dur = 1.6, arc = 1.2) {
    const to = typeof shot === "string" ? SHOTS[shot] : shot;
    rig.orbit = null;
    if (calm() || dur <= 0) {
      rig.pos.copy(to.pos); rig.look.copy(to.look); rig.fov = to.fov; rig.move = null;
      return Promise.resolve();
    }
    return new Promise((done) => {
      rig.move = { from: { pos: rig.pos.clone(), look: rig.look.clone(), fov: rig.fov }, to, t: 0, dur, arc, done };
    });
  }
  // gira devagar em volta de um ponto (abertura e prato pronto)
  function orbit(center, radius, height, speed = 0.12, fov = 34) {
    rig.move = null;
    rig.orbit = { center: center.clone(), radius, height, speed, a: 0, fov };
  }
  const shake = (amount = 0.15) => { if (!calm()) rig.shake = Math.max(rig.shake, amount); };

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // tela em pé: abre o campo de visão para caber a mesma largura de cena
  const fovFor = (fov) => {
    const a = camera.aspect, minA = 1.35;
    if (a >= minA) return fov;
    return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * minA / a));
  };

  function updateCamera(dt) {
    rig.t += dt;
    if (rig.move) {
      const m = rig.move;
      m.t += dt / m.dur;
      const k = ease.inOut(Math.min(1, m.t));
      rig.pos.lerpVectors(m.from.pos, m.to.pos, k);
      rig.pos.y += Math.sin(k * Math.PI) * m.arc; // grua: sobe no meio do movimento
      rig.look.lerpVectors(m.from.look, m.to.look, k);
      rig.fov = m.from.fov + (m.to.fov - m.from.fov) * k;
      if (m.t >= 1) { rig.move = null; m.done(); }
    } else if (rig.orbit) {
      const o = rig.orbit;
      o.a += dt * o.speed;
      rig.pos.set(o.center.x + Math.sin(o.a) * o.radius, o.center.y + o.height, o.center.z + Math.cos(o.a) * o.radius);
      rig.look.copy(o.center);
      rig.fov += (o.fov - rig.fov) * Math.min(1, dt * 2);
    }
    const sway = calm() ? 0 : 1; // respiração de câmera na mão
    camera.position.copy(rig.pos).add(v(Math.sin(rig.t * 0.5) * 0.06 * sway, Math.sin(rig.t * 0.7) * 0.04 * sway, 0));
    if (rig.shake > 0.001) {
      camera.position.add(v((Math.random() - 0.5) * rig.shake, (Math.random() - 0.5) * rig.shake, 0));
      rig.shake *= Math.exp(-dt * 9);
    }
    camera.lookAt(rig.look);
    camera.fov = fovFor(rig.fov);
    camera.updateProjectionMatrix();
    // a luz do sol acompanha o foco: sombra nítida onde se joga
    sun.target.position.copy(rig.look);
    sun.position.copy(rig.look).add(v(-5, 12, 7));
  }

  // ---- laço ----
  const tickers = new Set();
  let raf = 0, last = performance.now(), time = 0;
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    for (const f of [...tickers]) f(dt, time);
    kitchen.stations.stove.userData.tick(time);
    fx.update(dt);
    updateCamera(dt);
    composer.render();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const every = (f) => { tickers.add(f); return () => tickers.delete(f); };
  // anima de 0 a 1 em `dur` segundos; com movimento reduzido, pula para o fim
  const tween = (dur, f, e = ease.inOut) => new Promise((done) => {
    if (calm() || dur <= 0) { f(1); return done(); }
    let t = 0;
    const off = every((dt) => {
      t = Math.min(1, t + dt / dur);
      f(e(t));
      if (t >= 1) { off(); done(); }
    });
  });
  const wait = (s) => new Promise((done) => { let t = 0; const off = every((dt) => { t += dt; if (t >= s) { off(); done(); } }); });

  // ---- ponteiro ----
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function rayFrom(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray;
  }
  // onde o ponteiro encosta num plano horizontal de altura y
  const planeHit = (e, y) => rayFrom(e).ray.intersectPlane(new THREE.Plane(v(0, 1, 0), -y), v(0, 0, 0));
  const pick = (e, objects) => rayFrom(e).intersectObjects(objects, true)[0] ?? null;
  const toScreen = (p) => {
    const q = p.clone().project(camera), r = canvas.getBoundingClientRect();
    return { x: r.left + (q.x + 1) / 2 * r.width, y: r.top + (1 - q.y) / 2 * r.height };
  };

  const world = {
    THREE, scene, camera, canvas, kitchen, market, fx,
    input: null, go, orbit, shake, every, tween, wait, planeHit, pick, toScreen,
    dish: {}, // o que um minijogo deixa pronto para o próximo
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      for (const t of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) canvas.removeEventListener(t, handlers[t]);
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
  const handlers = {
    pointerdown: (e) => { if (!world.input?.down) return; canvas.setPointerCapture(e.pointerId); world.input.down(e); },
    pointermove: (e) => world.input?.move?.(e),
    pointerup: (e) => world.input?.up?.(e),
    pointercancel: (e) => world.input?.up?.(e),
  };
  for (const [t, f] of Object.entries(handlers)) canvas.addEventListener(t, f);
  return world;
}
