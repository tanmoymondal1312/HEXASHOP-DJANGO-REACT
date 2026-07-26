export default function HexLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.12)} viewBox="0 0 34 38" fill="none" className="mx-auto mb-4">
      <defs>
        <linearGradient id="hxGoldAuth" x1="0" y1="0" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5d778" />
          <stop offset="45%" stopColor="#e9b949" />
          <stop offset="70%" stopColor="#fff3c4" />
          <stop offset="100%" stopColor="#c9971c" />
        </linearGradient>
        <filter id="hxGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon points="17,1 33,10 33,28 17,37 1,28 1,10"
        fill="none" stroke="url(#hxGoldAuth)" strokeWidth="1.8" filter="url(#hxGlow)" />
      <polygon points="17,5.5 28.5,12 28.5,26 17,32.5 5.5,26 5.5,12"
        fill="rgba(233,185,73,0.06)" stroke="rgba(233,185,73,0.4)" strokeWidth="0.8" />
      <text x="17" y="24" textAnchor="middle" fill="url(#hxGoldAuth)"
        fontSize="14" fontWeight="700"
        fontFamily="var(--font-cinzel), Georgia, serif">H</text>
    </svg>
  );
}
