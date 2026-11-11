// Efeitos soltos na tela, por cima do palco 3D: pontos que sobem e confete.
// São só enfeite: quem prefere menos movimento não recebe nenhum.
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLORS = ["#ffd23f", "#ff9a1f", "#e5484d", "#4cbb5f", "#4aa6ff", "#ffffff"];
const at = (x, y, extra = "") => `translate(-50%, -50%) translate(${x}px, ${y}px) ${extra}`;

function spawn(className, point, frames, options) {
  const node = document.createElement("div");
  node.className = `fx ${className}`;
  node.style.left = `${point.x}px`;
  node.style.top = `${point.y}px`;
  document.body.append(node);
  node.animate(frames, { fill: "both", ...options }).onfinish = () => node.remove();
  return node;
}

// Texto que sobe e some ("+10", "Ops!") a partir de um ponto { x, y } da tela.
export function pop(point, text, kind = "good") {
  if (calm()) return;
  spawn(`fx-pop ${kind}`, point, [
    { transform: at(0, 0, "scale(.4)"), opacity: 0 },
    { transform: at(0, -34, "scale(1.25)"), opacity: 1, offset: 0.25 },
    { transform: at(0, -90, "scale(1)"), opacity: 0 },
  ], { duration: 950, easing: "ease-out" }).textContent = text;
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
