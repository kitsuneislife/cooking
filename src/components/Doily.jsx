// Foto do prato no meio de uma toalhinha de renda, como o prato pronto da referência.
// A renda é decorativa; a foto leva o texto alternativo.
const around = (n, r) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return [Math.cos(a) * r, Math.sin(a) * r];
});
const SCALLOPS = around(24, 42.5);
const HOLES = around(24, 42.5);
const PINS = around(48, 37);

export default function Doily({ src, alt, className = "" }) {
  return (
    <div className={`doily ${className}`}>
      <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
        <g className="doily-lace">
          <circle r="43" />
          {SCALLOPS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6.2" />)}
        </g>
        {HOLES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.1" className="doily-hole" />)}
        {PINS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" className="doily-hole" />)}
        <circle r="33.5" className="doily-ring" />
      </svg>
      <img src={src} alt={alt} />
    </div>
  );
}
