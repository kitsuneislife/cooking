import { useId } from "react";

// Logotipo: placa recortada com borda de renda, as duas palavras com contorno grosso,
// um chapeuzinho de chef no "C" e brilhos piscando. `as` escolhe a tag (h1 na tela de título).

// Contorno de cookie: um retângulo bem arredondado (superelipse) com ondinhas na borda.
function plate(cx, cy, a, b, bumps, depth, n = 3.2) {
  const pts = [];
  for (let i = 0; i < 360; i++) {
    const t = (i / 360) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const k = 1 + depth * Math.cos(bumps * t);
    pts.push(`${(cx + a * k * Math.sign(c) * Math.abs(c) ** (2 / n)).toFixed(1)} ${(cy + b * k * Math.sign(s) * Math.abs(s) ** (2 / n)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}
// buracos da renda: pontinhos seguindo a mesma forma, por dentro da borda
function holes(cx, cy, a, b, count, n = 3.2) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    return [cx + a * Math.sign(c) * Math.abs(c) ** (2 / n), cy + b * Math.sign(s) * Math.abs(s) ** (2 / n)];
  });
}
const OUTER = plate(200, 118, 192, 104, 34, 0.028);
const INNER = plate(200, 118, 170, 84, 0, 0);
const HOLES = holes(200, 118, 181, 94, 34);
const SPARKLE = "M0 -10 C1.5 -2 2 -1.5 10 0 C2 1.5 1.5 2 0 10 C-1.5 2 -2 1.5 -10 0 C-2 -1.5 -1.5 -2 0 -10 Z";

export default function Logo({ as: Tag = "p", className = "" }) {
  const id = "l" + useId().replace(/[^\w-]/g, ""); // o id do React tem símbolos que quebram o url(#…)
  return (
    <Tag className={`logo ${className}`}>
      <svg viewBox="0 0 400 236" role="img" aria-label="Cozinhe Comigo">
        <defs>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb3d0" />
            <stop offset="1" stopColor="#ff6fa3" />
          </linearGradient>
          <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf7" />
            <stop offset="1" stopColor="#ffeed6" />
          </linearGradient>
          <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff38a" />
            <stop offset=".5" stopColor="#ffd23f" />
            <stop offset="1" stopColor="#ff9a1f" />
          </linearGradient>
          <linearGradient id={`${id}-coral`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff8fa0" />
            <stop offset="1" stopColor="#e8384f" />
          </linearGradient>
        </defs>
        <path d={OUTER} fill={`url(#${id}-rim)`} stroke="#c2386f" strokeWidth="4" strokeLinejoin="round" />
        {HOLES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" fill="#fff" opacity=".85" />)}
        <path d={INNER} fill={`url(#${id}-face)`} stroke="#e8b04a" strokeWidth="3" />
        <path d={plate(200, 118, 162, 77, 0, 0)} fill="none" stroke="#ff9cc0" strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" />

        <g className="logo-word" fontFamily="'Lilita One', 'Fredoka', sans-serif" textAnchor="middle" paintOrder="stroke fill" strokeLinejoin="round">
          <text x="206" y="106" fontSize="62" fill={`url(#${id}-coral)`} stroke="#5a1424" strokeWidth="14">Cozinhe</text>
          <text x="206" y="106" fontSize="62" fill={`url(#${id}-coral)`} stroke="#fff" strokeWidth="5">Cozinhe</text>
          <text x="200" y="186" fontSize="88" fill={`url(#${id}-sun)`} stroke="#4a2410" strokeWidth="16">Comigo</text>
          <text x="200" y="186" fontSize="88" fill={`url(#${id}-sun)`} stroke="#fff" strokeWidth="5">Comigo</text>
        </g>

        {/* chapeuzinho de chef inclinado em cima do "C" */}
        <g transform="translate(104 40) rotate(-18)">
          <path d="M-20 10 C-34 8 -34 -12 -18 -12 C-18 -28 2 -34 6 -26 C14 -34 34 -26 28 -12 C42 -10 40 10 26 10 Z" fill="#fff" stroke="#4a2410" strokeWidth="4" strokeLinejoin="round" />
          <rect x="-20" y="6" width="46" height="12" rx="6" fill="#fff" stroke="#4a2410" strokeWidth="4" />
          <path d="M-4 4 Q-6 -6 -2 -14 M12 4 Q14 -6 10 -14" fill="none" stroke="#d6e1ec" strokeWidth="3" strokeLinecap="round" />
        </g>

        <path className="logo-sparkle" d={SPARKLE} transform="translate(358 50) scale(1.3)" fill="#fff38a" stroke="#e8a21a" strokeWidth="2" />
        <path className="logo-sparkle" d={SPARKLE} transform="translate(40 190) scale(1)" fill="#b9f3e4" stroke="#3fb89a" strokeWidth="2" />
        <path className="logo-sparkle" d={SPARKLE} transform="translate(372 196) scale(.8)" fill="#ffc3d8" stroke="#e0558d" strokeWidth="2" />
      </svg>
    </Tag>
  );
}
