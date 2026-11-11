// O chef que acompanha a partida. `mood`: "idle", "happy" (acerto) ou "sad" (erro).
const EYES = {
  idle: (
    <>
      <ellipse cx="48" cy="62" rx="4" ry="5" fill="#3a2212" />
      <ellipse cx="72" cy="62" rx="4" ry="5" fill="#3a2212" />
      <circle cx="46.6" cy="60" r="1.4" fill="#fff" />
      <circle cx="70.6" cy="60" r="1.4" fill="#fff" />
    </>
  ),
  happy: <path d="M43 63 Q48 56 53 63 M67 63 Q72 56 77 63" fill="none" stroke="#3a2212" strokeWidth="3" strokeLinecap="round" />,
  sad: (
    <>
      <ellipse cx="48" cy="64" rx="3.6" ry="4.4" fill="#3a2212" />
      <ellipse cx="72" cy="64" rx="3.6" ry="4.4" fill="#3a2212" />
      <path d="M42 57 L54 54 M78 57 L66 54" stroke="#6b3a1c" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};
const MOUTH = {
  idle: <path d="M53 86 Q60 91 67 86" fill="none" stroke="#8a3a2a" strokeWidth="2.6" strokeLinecap="round" />,
  happy: <path d="M50 84 Q60 99 70 84 Z" fill="#8a2a22" stroke="#6b1d16" strokeWidth="1.5" strokeLinejoin="round" />,
  sad: <path d="M53 91 Q60 85 67 91" fill="none" stroke="#8a3a2a" strokeWidth="2.6" strokeLinecap="round" />,
};

export default function Chef({ mood = "idle" }) {
  return (
    <svg className="chef" data-mood={mood} viewBox="0 0 120 124" aria-hidden="true" focusable="false">
      <path d="M18 124 C18 102 38 96 60 96 C82 96 102 102 102 124 Z" fill="#fff" stroke="#b9c4cc" strokeWidth="2" />
      <path d="M44 97 L60 110 L76 97 L72 92 L48 92 Z" fill="#e5484d" stroke="#a8262b" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="29" cy="68" r="6" fill="#f0b98c" stroke="#c98d62" strokeWidth="1.5" />
      <circle cx="91" cy="68" r="6" fill="#f0b98c" stroke="#c98d62" strokeWidth="1.5" />
      <circle cx="60" cy="66" r="31" fill="#f8cfa6" stroke="#c98d62" strokeWidth="2" />
      <path d="M34 42 C20 38 20 14 40 17 C44 1 76 1 80 17 C100 14 100 38 86 42 L86 50 L34 50 Z" fill="#fff" stroke="#b9c4cc" strokeWidth="2" strokeLinejoin="round" />
      <rect x="32" y="42" width="56" height="11" rx="4" fill="#eef2f5" stroke="#b9c4cc" strokeWidth="2" />
      <path d="M44 20 Q46 30 44 40 M60 12 V40 M76 20 Q74 30 76 40" fill="none" stroke="#d5dde3" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="76" r="6.5" fill="#ff8f7a" opacity=".55" />
      <circle cx="80" cy="76" r="6.5" fill="#ff8f7a" opacity=".55" />
      {EYES[mood]}
      {MOUTH[mood]}
      <path d="M60 78 C53 71 42 75 37 82 C46 84 54 83 60 80 C66 83 74 84 83 82 C78 75 67 71 60 78 Z" fill="#6b3a1c" />
    </svg>
  );
}
