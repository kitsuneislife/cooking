// Ícone de cada corte: mostra o formato dos pedaços.
const SHAPES = {
  "Picado fino": [[8, 10], [16, 8], [24, 12], [32, 9], [11, 18], [20, 17], [29, 19], [8, 26], [17, 25], [26, 27], [33, 25], [13, 32], [23, 33], [31, 31]]
    .map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" />),
  Picado: [[6, 8, 10], [18, 6, -14], [28, 10, 20], [8, 20, -8], [20, 19, 12], [29, 24, -18], [10, 30, 16], [21, 31, -6]]
    .map(([x, y, r], i) => <rect key={i} x={x} y={y} width="6" height="5" rx="1" transform={`rotate(${r} ${x + 3} ${y + 2.5})`} />),
  "Em cubos": [6, 16, 26].flatMap((x) => [6, 16, 26].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="8" height="8" rx="1.5" />)),
  Fatiado: [6, 14, 22, 30].map((x) => <ellipse key={x} cx={x + 2} cy="20" rx="3" ry="13" />),
  Ralado: [[6, 8], [14, 6], [24, 9], [9, 18], [19, 16], [28, 19], [6, 28], [16, 27], [26, 29]]
    .map(([x, y], i) => <path key={i} d={`M ${x} ${y} q 3 3 7 2`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />),
};

export default function CutIcon({ cut }) {
  return (
    <svg viewBox="0 0 40 40" className="cut-icon" aria-hidden="true" fill="currentColor">
      {SHAPES[cut]}
    </svg>
  );
}
