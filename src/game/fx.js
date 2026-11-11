// Efeitos visuais soltos na tela (voo, pontos, faíscas, confete).
// São só enfeite: quem prefere menos movimento não recebe nenhum.
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLORS = ["#ffd23f", "#ff9a1f", "#e5484d", "#4cbb5f", "#4aa6ff", "#ffffff"];
const at = (x, y, extra = "") => `translate(-50%, -50%) translate(${x}px, ${y}px) ${extra}`;

export const itemEl = (id) => document.querySelector(`[data-item="${id}"]`);
export const zoneEl = (zone) => document.querySelector(`[data-zone="${zone}"]`);

// Aceita um elemento ou um ponto { x, y } da tela.
function center(target) {
  if (!(target instanceof Element)) return target;
  const r = target.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function spawn(className, point, frames, options) {
  const node = document.createElement("div");
  node.className = `fx ${className}`;
  node.style.left = `${point.x}px`;
  node.style.top = `${point.y}px`;
  document.body.append(node);
  node.animate(frames, { fill: "both", ...options }).onfinish = () => node.remove();
  return node;
}

// Texto que sobe e some: "+10", "x2"…
export function pop(target, text, kind = "good") {
  if (calm()) return;
  spawn(`fx-pop ${kind}`, center(target), [
    { transform: at(0, 0, "scale(.4)"), opacity: 0 },
    { transform: at(0, -34, "scale(1.25)"), opacity: 1, offset: 0.25 },
    { transform: at(0, -90, "scale(1)"), opacity: 0 },
  ], { duration: 950, easing: "ease-out" }).textContent = text;
}

// Pedacinhos que espirram do alvo.
export function burst(target, colors = COLORS, count = 9) {
  if (calm()) return;
  const point = center(target);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2, far = 40 + Math.random() * 60;
    const x = Math.cos(angle) * far, y = Math.sin(angle) * far - 30;
    spawn("fx-bit", point, [
      { transform: at(0, 0, "scale(1)"), opacity: 1 },
      { transform: at(x, y, `rotate(${Math.random() * 540}deg) scale(.3)`), opacity: 0 },
    ], { duration: 450 + Math.random() * 250, easing: "cubic-bezier(.2,.7,.4,1)" })
      .style.background = colors[i % colors.length];
  }
}

// Cópia do desenho `art` voando em arco de `from` até `to`.
export function fly(from, to, art) {
  if (calm()) return;
  const a = center(from), b = center(to);
  const dx = b.x - a.x, dy = b.y - a.y;
  spawn("fx-fly", a, [
    { transform: at(0, 0, "scale(1)") },
    { transform: at(dx / 2, dy / 2 - 90, "scale(1.15) rotate(-14deg)"), offset: 0.5 },
    { transform: at(dx, dy, "scale(.4) rotate(8deg)"), opacity: 0.7 },
  ], { duration: 480, easing: "ease-in-out" }).append(art.cloneNode(true));
}

export function shake(element) {
  if (calm()) return;
  element.animate(
    [0, -10, 9, -6, 5, 0].map((x) => ({ transform: `translateX(${x}px)` })),
    { duration: 360, easing: "ease-out" },
  );
}

export function confetti() {
  if (calm()) return;
  for (let i = 0; i < 70; i++) {
    const drift = (Math.random() - 0.5) * 240;
    spawn("fx-bit fx-confetti", { x: Math.random() * innerWidth, y: -20 }, [
      { transform: at(0, 0), opacity: 1 },
      { transform: at(drift, innerHeight + 60, `rotate(${Math.random() * 1080}deg)`), opacity: 1 },
    ], { duration: 1800 + Math.random() * 1800, delay: Math.random() * 700, easing: "cubic-bezier(.3,.2,.6,1)" })
      .style.background = COLORS[i % COLORS.length];
  }
}
