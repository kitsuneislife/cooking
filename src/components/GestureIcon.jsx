// Mãozinha animada que mostra o gesto da etapa (tocar, riscar, segurar, girar…).
// O movimento fica no CSS (`.gesture[data-kind]`); sem animação, fica só a mão parada.
const NAMES = {
  tap: "Tocar", swipe: "Riscar", rapid: "Tocar rápido", hold: "Segurar e soltar", zigzag: "Zigue-zague",
  timing: "Tocar na hora certa", rhythm: "No ritmo", circle: "Girar", plate: "Tocar e arrastar",
};

export default function GestureIcon({ kind }) {
  return (
    <figure className="gesture" data-kind={kind}>
      <span className="gesture-pad" aria-hidden="true">
        <span className="gesture-trail" />
        <svg className="gesture-hand" viewBox="0 0 40 48">
          <path d="M16 4c2.5 0 4 1.8 4 4.2V20l9.6 1.7c3.2.6 5.2 3.6 4.6 6.7L32 40c-.6 3.4-3.6 6-7 6H18c-2.4 0-4.6-1.2-5.9-3.2L5.4 32.6c-1.2-1.8-.7-4.2 1.1-5.4 1.6-1.1 3.8-.8 5.1.7l.4.5V8.2C12 5.8 13.5 4 16 4z" />
        </svg>
      </span>
      <figcaption>{NAMES[kind]}</figcaption>
    </figure>
  );
}
