// Cópia do item que segue o ponteiro durante o arrasto.
export default function DragGhost({ drag, children }) {
  return (
    <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
      {children}
    </div>
  );
}
