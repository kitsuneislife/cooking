import { useEffect, useRef, useState } from "react";
import { cookZone, COOK_READY, COOK_BURNT } from "../game/rules";
import { sfx } from "../game/sound";
import { burst } from "../game/fx";

// Botão de ação de uma estação (campo `action` do passo, em data/games.js).
// - "tap": tocar `taps` vezes; o anel enche a cada toque.
// - "timer": o ponteiro gira por `seconds`; tem que tocar quando estiver no verde.
export default function ActionControl({ action, onDone, onFail }) {
  const button = useRef(null);
  const clock = useRef({ start: 0, progress: 0 });
  const [count, setCount] = useState(0);
  const fail = useRef(onFail);
  fail.current = onFail;
  const timed = action.type === "timer";

  useEffect(() => {
    button.current.focus();
    if (!timed) return;
    sfx.sizzle();
    clock.current.start = performance.now();
    let raf;
    const frame = (now) => {
      let progress = (now - clock.current.start) / (action.seconds * 1000);
      if (progress >= 1) {
        fail.current("Queimou! Tente de novo.");
        clock.current.start = now;
        progress = 0;
      }
      clock.current.progress = progress;
      // direto no elemento: 60 atualizações por segundo sem renderizar o React
      button.current.style.setProperty("--p", progress);
      button.current.dataset.cook = cookZone(progress);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [action, timed]);

  function press() {
    if (!timed) {
      sfx.chop();
      burst(button.current, undefined, 5);
      if (count + 1 >= action.taps) return onDone();
      return setCount(count + 1);
    }
    const zone = cookZone(clock.current.progress);
    if (zone === "ready") return onDone();
    if (zone === "raw") return onFail("Ainda está cru. Espere o ponteiro chegar no verde!");
    clock.current.start = performance.now();
    onFail("Queimou! Tente de novo.");
  }

  const style = timed
    ? { "--ready": COOK_READY, "--burnt": COOK_BURNT }
    : { "--p": count / action.taps };

  return (
    <button
      ref={button}
      type="button"
      className={`action action-${action.type}`}
      style={style}
      onClick={press}
      aria-label={timed ? `${action.label}: toque quando o ponteiro estiver no verde` : `${action.label}: toque ${action.taps - count} vezes`}
    >
      <span className="action-face" key={count}>
        {action.label}
        {!timed && <small>{count}/{action.taps}</small>}
      </span>
    </button>
  );
}
