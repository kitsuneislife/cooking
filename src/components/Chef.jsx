import { useId } from "react";

// O chef que acompanha o jogo. `mood`: "idle", "happy" (acerto), "sad" (erro) ou "love" (olhos de coração).
// Pisca, respira e mexe os braços pelo CSS (`.chef` em styles.css); aqui só muda a cara.
const INK = "#4a2410";

const HEART = (x, y, s) => `M${x} ${y + s * 0.9}C${x - s * 2.2} ${y - s * 0.4} ${x - s * 1.1} ${y - s * 2} ${x} ${y - s * 0.8}C${x + s * 1.1} ${y - s * 2} ${x + s * 2.2} ${y - s * 0.4} ${x} ${y + s * 0.9}Z`;

function Eyes({ mood, id }) {
  if (mood === "happy") {
    return <path d="M66 108 Q78 94 90 108 M110 108 Q122 94 134 108" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />;
  }
  if (mood === "love") {
    return (
      <g>
        <path d={HEART(78, 106, 7)} fill="#ff4f8f" stroke="#b8235a" strokeWidth="2" strokeLinejoin="round" />
        <path d={HEART(122, 106, 7)} fill="#ff4f8f" stroke="#b8235a" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="73" cy="101" rx="3" ry="2" fill="#fff" opacity=".9" />
        <ellipse cx="117" cy="101" rx="3" ry="2" fill="#fff" opacity=".9" />
      </g>
    );
  }
  const sad = mood === "sad";
  return (
    <g className="chef-eyes">
      {[78, 122].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={sad ? 108 : 105} rx="9.5" ry={sad ? 10.5 : 13} fill={`url(#${id}-iris)`} />
          <circle cx={x + 3.2} cy={sad ? 104 : 99} r="4" fill="#fff" />
          <circle cx={x - 3.4} cy={sad ? 112 : 111} r="2" fill="#fff" opacity=".85" />
        </g>
      ))}
    </g>
  );
}

const BROWS = {
  idle: "M67 85 Q78 79 89 84 M111 84 Q122 79 133 85",
  happy: "M67 83 Q78 76 89 82 M111 82 Q122 76 133 83",
  love: "M67 83 Q78 76 89 82 M111 82 Q122 76 133 83",
  sad: "M67 90 Q79 87 89 80 M111 80 Q121 87 133 90",
};

function Mouth({ mood }) {
  if (mood === "happy" || mood === "love") {
    return (
      <g>
        <path d="M86 139 Q100 166 114 139 Z" fill="#a3302a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M92 152 Q100 146 108 152 Q104 160 100 160 Q96 160 92 152 Z" fill="#ff8a8a" />
      </g>
    );
  }
  if (mood === "sad") return <path d="M89 150 Q100 141 111 150" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />;
  return <path d="M89 141 Q100 151 111 141" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />;
}

export default function Chef({ mood = "idle" }) {
  const id = "c" + useId().replace(/[^\w-]/g, ""); // o id do React tem símbolos que quebram o url(#…)
  return (
    <svg className="chef" data-mood={mood} viewBox="0 -26 200 262" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-skin`} cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#ffe6cf" />
          <stop offset=".7" stopColor="#ffd0aa" />
          <stop offset="1" stopColor="#f2ad84" />
        </radialGradient>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".6" stopColor="#f3f7fb" />
          <stop offset="1" stopColor="#d6e1ec" />
        </linearGradient>
        <radialGradient id={`${id}-hat`} cx=".4" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".75" stopColor="#f4f7fb" />
          <stop offset="1" stopColor="#d9e3ee" />
        </radialGradient>
        <linearGradient id={`${id}-iris`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e0f06" />
          <stop offset=".55" stopColor="#3b1d0c" />
          <stop offset="1" stopColor="#8a4a22" />
        </linearGradient>
        <linearGradient id={`${id}-scarf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7a8a" />
          <stop offset="1" stopColor="#e0344f" />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a4a22" />
          <stop offset="1" stopColor="#5a2c12" />
        </linearGradient>
        <radialGradient id={`${id}-blush`}>
          <stop offset="0" stopColor="#ff7f9c" stopOpacity=".75" />
          <stop offset="1" stopColor="#ff7f9c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="chef-body">
        {/* braços: giram no ombro pelo CSS (acenar, comemorar) */}
        <g className="chef-arm chef-arm-l">
          <path d="M66 180 C52 188 42 202 40 216 L56 220 C58 208 64 198 74 192 Z" fill={`url(#${id}-cloth)`} stroke="#9fb1c4" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="47" cy="222" r="10" fill={`url(#${id}-skin)`} stroke="#d58f66" strokeWidth="2.5" />
        </g>
        <g className="chef-arm chef-arm-r">
          <path d="M134 180 C148 188 158 202 160 216 L144 220 C142 208 136 198 126 192 Z" fill={`url(#${id}-cloth)`} stroke="#9fb1c4" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="153" cy="222" r="10" fill={`url(#${id}-skin)`} stroke="#d58f66" strokeWidth="2.5" />
        </g>
        <rect x="88" y="150" width="24" height="24" rx="8" fill="#f2ad84" />
        {/* dólmã com botões e lenço */}
        <path d="M54 236 C52 198 68 170 100 168 C132 170 148 198 146 236 Z" fill={`url(#${id}-cloth)`} stroke="#9fb1c4" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 176 C104 196 104 216 100 236" fill="none" stroke="#c5d3e0" strokeWidth="2.5" strokeLinecap="round" />
        {[196, 214].map((y) => [88, 112].map((x) => (
          <g key={`${x}${y}`}>
            <circle cx={x} cy={y} r="4.6" fill="#ffd25a" stroke="#c98a12" strokeWidth="2" />
            <circle cx={x - 1.4} cy={y - 1.6} r="1.4" fill="#fff8" />
          </g>
        )))}
        <path d="M76 166 Q100 182 124 166 L118 190 Q100 180 82 190 Z" fill={`url(#${id}-scarf)`} stroke="#a8263b" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="100" cy="180" r="7" fill="#ff8a98" stroke="#a8263b" strokeWidth="2.5" />
      </g>

      <g className="chef-head">
        <circle cx="42" cy="110" r="12" fill={`url(#${id}-skin)`} stroke="#d58f66" strokeWidth="2.5" />
        <circle cx="158" cy="110" r="12" fill={`url(#${id}-skin)`} stroke="#d58f66" strokeWidth="2.5" />
        <path d="M45 112 Q42 107 46 104" fill="none" stroke="#d58f66" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M155 112 Q158 107 154 104" fill="none" stroke="#d58f66" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="100" cy="104" r="58" fill={`url(#${id}-skin)`} stroke="#d58f66" strokeWidth="2.5" />
        {/* costeletas aparecendo embaixo do chapéu */}
        <path d="M44 70 C42 86 46 100 52 108 C54 96 56 84 62 72 Z" fill={`url(#${id}-hair)`} />
        <path d="M156 70 C158 86 154 100 148 108 C146 96 144 84 138 72 Z" fill={`url(#${id}-hair)`} />
        <ellipse cx="100" cy="70" rx="48" ry="8" fill="#e09a72" opacity=".35" />

        <ellipse cx="62" cy="128" rx="15" ry="10" fill={`url(#${id}-blush)`} />
        <ellipse cx="138" cy="128" rx="15" ry="10" fill={`url(#${id}-blush)`} />
        <path d={BROWS[mood] ?? BROWS.idle} fill="none" stroke="#5a2c12" strokeWidth="4.5" strokeLinecap="round" />
        <Eyes mood={mood} id={id} />
        <ellipse cx="100" cy="122" rx="8" ry="6.5" fill="#f5a57c" stroke="#d58f66" strokeWidth="2" />
        <ellipse cx="97.5" cy="119.5" rx="2.6" ry="1.8" fill="#fff" opacity=".7" />
        <Mouth mood={mood} />
        {/* bigode de pontas enroladas */}
        <path
          d="M100 131 C93 124 80 124 72 132 C67 137 70 144 76 141 C79 139 78 135 82 135 C88 136 94 138 100 136 C106 138 112 136 118 135 C122 135 121 139 124 141 C130 144 133 137 128 132 C120 124 107 124 100 131 Z"
          fill={`url(#${id}-hair)`} stroke="#3e1d0a" strokeWidth="2" strokeLinejoin="round"
        />
        <path d="M84 129 Q90 127 95 130" fill="none" stroke="#b06a3c" strokeWidth="2" strokeLinecap="round" />
        {mood === "sad" && <path d="M150 70 C146 78 144 82 148 85 C152 87 156 83 154 78 Z" fill="#8fd3ff" stroke="#3a8fc8" strokeWidth="2" />}

        {/* chapéu de chef fofo, com prega e um broche de coração */}
        <path
          d="M52 72 C30 68 28 30 56 30 C56 6 82 -10 100 -6 C118 -10 144 6 144 30 C172 30 170 68 148 72 Z"
          fill={`url(#${id}-hat)`} stroke="#9fb1c4" strokeWidth="2.5" strokeLinejoin="round"
        />
        <path d="M74 66 Q70 46 78 30 M100 66 V20 M126 66 Q130 46 122 30" fill="none" stroke="#dbe4ee" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="80" cy="12" rx="12" ry="7" fill="#fff" opacity=".9" />
        <rect x="50" y="58" width="100" height="22" rx="11" fill={`url(#${id}-cloth)`} stroke="#9fb1c4" strokeWidth="2.5" />
        <path d="M56 66 H144" stroke="#e6edf4" strokeWidth="2" strokeLinecap="round" />
        <path d={HEART(126, 70, 5)} fill="#ff5c9a" stroke="#b8235a" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
