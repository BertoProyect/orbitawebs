export function OrbitVisual() {
  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* Ambient soft disc */}
      <div className="absolute inset-[8%] rounded-full bg-white/40 blur-2xl" />

      <svg
        viewBox="0 0 500 500"
        className="relative h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ring-blue" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#355acf" />
            <stop offset="1" stopColor="#355acf" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Faint concentric orbits */}
        <g fill="none" stroke="#355acf" strokeOpacity="0.12" strokeWidth="1">
          <circle cx="250" cy="250" r="230" />
          <circle cx="250" cy="250" r="180" />
          <circle cx="250" cy="250" r="130" />
        </g>

        {/* Main circle — slow spin */}
        <g
          style={{
            transformOrigin: "250px 250px",
            animation: "orbit-spin 60s linear infinite",
          }}
        >
          <circle
            cx="250"
            cy="250"
            r="170"
            fill="none"
            stroke="url(#ring-blue)"
            strokeWidth="22"
          />
          {/* nodes on main circle */}
          <circle cx="420" cy="250" r="7" fill="#355acf">
            <animate
              attributeName="r"
              values="6;9;6"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Diagonal orbit — counter-spin */}
        <g
          style={{
            transformOrigin: "250px 250px",
            animation: "orbit-spin-rev 45s linear infinite",
          }}
        >
          <g transform="rotate(-30 250 250)">
            <ellipse
              cx="250"
              cy="250"
              rx="210"
              ry="82"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <circle cx="460" cy="250" r="6" fill="#1a1a2e" />
            <circle cx="40" cy="250" r="6" fill="#1a1a2e" />
          </g>
        </g>

        {/* Small floating nodes */}
        <g>
          <circle cx="120" cy="120" r="5" fill="#355acf" opacity="0.7">
            <animate attributeName="cy" values="120;110;120" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="400" r="4" fill="#1a1a2e" opacity="0.6">
            <animate attributeName="cx" values="380;390;380" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="360" r="3" fill="#355acf" opacity="0.5" />
          <circle cx="420" cy="90" r="3" fill="#355acf" opacity="0.5" />
        </g>

        {/* Thin connecting lines */}
        <g stroke="#355acf" strokeOpacity="0.25" strokeWidth="1" fill="none">
          <line x1="120" y1="120" x2="250" y2="250" strokeDasharray="2 4" />
          <line x1="380" y1="400" x2="250" y2="250" strokeDasharray="2 4" />
        </g>
      </svg>
    </div>
  );
}
