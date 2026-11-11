import { useEffect, useRef } from "react";
import { art, SHARED_DEFS } from "../art";

// Desenho decorativo: o nome do item sempre aparece em texto ao lado.
export default function Illustration({ name, className = "art" }) {
  const ref = useRef(null);
  useEffect(() => {
    const svg = ref.current;
    svg.replaceChildren();
    art[name](svg);
  }, [name]);
  return <svg ref={ref} className={className} aria-hidden="true" focusable="false" />;
}

export function SharedArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs dangerouslySetInnerHTML={{ __html: SHARED_DEFS }} />
    </svg>
  );
}
