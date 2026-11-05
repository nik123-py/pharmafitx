/**
 * Original vector composition of pharmaceutical packaging (carton, bottle,
 * blister strip, capsules) on a soft organic shape. Pure SVG: crisp, ~6 KB,
 * no stock photography.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 520" className={className} role="img" aria-label="Pharmaceutical packaging illustration">
      <defs>
        <linearGradient id="hx-blob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E6F1E6" />
          <stop offset="1" stopColor="#D3E6D5" />
        </linearGradient>
        <linearGradient id="hx-bottle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F6F9F5" />
          <stop offset="1" stopColor="#E3ECE3" />
        </linearGradient>
        <linearGradient id="hx-box-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#EEF4EE" />
          <stop offset="1" stopColor="#DDE8DE" />
        </linearGradient>
        <linearGradient id="hx-cap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5E9A70" />
          <stop offset="1" stopColor="#3F7450" />
        </linearGradient>
        <filter id="hx-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#2E4A36" floodOpacity="0.14" />
        </filter>
        <filter id="hx-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#2E4A36" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* organic backdrop */}
      <path
        d="M292 34c86-10 176 34 214 110 40 80 22 186-38 252-58 64-158 96-246 84-90-12-170-76-190-160C12 236 52 150 112 96 162 52 222 42 292 34Z"
        fill="url(#hx-blob)"
      />
      <circle cx="470" cy="92" r="26" fill="#8BBE91" opacity="0.35" />
      <circle cx="78" cy="400" r="14" fill="#8BBE91" opacity="0.4" />
      <circle cx="505" cy="380" r="8" fill="#4F8B61" opacity="0.35" />

      {/* ground shadow */}
      <ellipse cx="290" cy="452" rx="210" ry="18" fill="#2E4A36" opacity="0.08" />

      {/* carton box */}
      <g filter="url(#hx-shadow)">
        <path d="M150 196 L292 168 L292 440 L150 452 Z" fill="#FFFFFF" />
        <path d="M292 168 L356 190 L356 430 L292 440 Z" fill="url(#hx-box-side)" />
        <path d="M150 196 L292 168 L356 190 L214 220 Z" fill="#F6F9F5" />
        <path d="M150 268 L292 246 L292 300 L150 320 Z" fill="#4F8B61" />
        <path d="M292 246 L356 262 L356 314 L292 300 Z" fill="#3F7450" />
        <rect x="170" y="216" width="70" height="9" rx="4.5" fill="#252B27" opacity="0.8" transform="skewY(-11) translate(0 34)" />
        <rect x="170" y="236" width="44" height="7" rx="3.5" fill="#777F78" opacity="0.5" transform="skewY(-11) translate(0 34)" />
        <g transform="translate(188 282) skewY(-8)">
          <rect x="0" y="0" width="34" height="34" rx="9" fill="#FFFFFF" opacity="0.95" />
          <path d="M17 8v18M8 17h18" stroke="#4F8B61" strokeWidth="4" strokeLinecap="round" />
        </g>
        <rect x="236" y="293" width="44" height="6" rx="3" fill="#E6F1E6" opacity="0.9" transform="skewY(-8) translate(0 30)" />
        <rect x="236" y="305" width="30" height="6" rx="3" fill="#E6F1E6" opacity="0.6" transform="skewY(-8) translate(0 30)" />
        <rect x="168" y="372" width="96" height="6" rx="3" fill="#E9EEE9" />
        <rect x="168" y="386" width="70" height="6" rx="3" fill="#E9EEE9" />
        <rect x="168" y="400" width="84" height="6" rx="3" fill="#E9EEE9" />
      </g>

      {/* bottle */}
      <g filter="url(#hx-shadow)">
        <rect x="350" y="214" width="122" height="228" rx="34" fill="url(#hx-bottle)" />
        <rect x="370" y="186" width="82" height="40" rx="10" fill="#EEF4EE" />
        <rect x="362" y="140" width="98" height="56" rx="16" fill="url(#hx-cap)" />
        <g opacity="0.25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
          <path d="M378 150v36M392 150v36M406 150v36M420 150v36M434 150v36M448 150v36" />
        </g>
        <rect x="364" y="276" width="94" height="104" rx="14" fill="#FFFFFF" />
        <rect x="364" y="276" width="94" height="30" rx="14" fill="#E6F1E6" />
        <rect x="364" y="292" width="94" height="14" fill="#E6F1E6" />
        <circle cx="384" cy="291" r="7" fill="#4F8B61" />
        <rect x="378" y="320" width="64" height="7" rx="3.5" fill="#252B27" opacity="0.75" />
        <rect x="378" y="334" width="46" height="6" rx="3" fill="#777F78" opacity="0.45" />
        <rect x="378" y="356" width="30" height="10" rx="5" fill="#8BBE91" opacity="0.7" />
        <rect x="360" y="232" width="10" height="190" rx="5" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* blister strip */}
      <g filter="url(#hx-soft)" transform="translate(70 360) rotate(-10)">
        <rect x="0" y="0" width="210" height="86" rx="18" fill="#F4F7F4" stroke="#E0E8E0" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${28 + i * 50} 43)`}>
            <ellipse rx="17" ry="24" fill="#FFFFFF" stroke="#E0E8E0" strokeWidth="2" />
            <ellipse rx="10" ry="16" fill={i % 2 ? "#E6F1E6" : "#FFFFFF"} stroke="#CFE0D1" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* capsules */}
      <g filter="url(#hx-soft)">
        <g transform="translate(118 150) rotate(-32)">
          <rect x="-34" y="-14" width="68" height="28" rx="14" fill="#FFFFFF" />
          <path d="M0 -14h20a14 14 0 0 1 0 28H0Z" fill="#4F8B61" />
        </g>
        <g transform="translate(486 214) rotate(28)">
          <rect x="-26" y="-11" width="52" height="22" rx="11" fill="#FFFFFF" />
          <path d="M0 -11h15a11 11 0 0 1 0 22H0Z" fill="#8BBE91" />
        </g>
        <g transform="translate(520 300)">
          <circle r="14" fill="#FFFFFF" />
          <path d="M-8 0h16" stroke="#D6E8D7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g transform="translate(220 120)">
          <circle r="11" fill="#FFFFFF" />
          <path d="M-6 0h12" stroke="#D6E8D7" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
