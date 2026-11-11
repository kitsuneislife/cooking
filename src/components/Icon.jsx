// Ícones pequenos do painel do jogo. Sempre decorativos: o texto fica ao lado ou no aria-label.
const SHAPES = {
  coin: (
    <>
      <circle cx="12" cy="12" r="10" fill="#ffd23f" stroke="#b9770a" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#e89c0e" strokeWidth="2" />
      <path d="M8 7 Q10 5 13 5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="13" r="9" fill="#fff" stroke="#e5484d" strokeWidth="3" />
      <path d="M12 8 V13 L15.5 15" fill="none" stroke="#4b2a12" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M9 2 H15" stroke="#e5484d" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  close: <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />,
  sound: (
    <>
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor" />
      <path d="M16 8.5 Q19 12 16 15.5 M18.5 6 Q23 12 18.5 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor" />
      <path d="M16.5 9 L22 15 M22 9 L16.5 15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
};

export default function Icon({ name }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{SHAPES[name]}</svg>;
}
