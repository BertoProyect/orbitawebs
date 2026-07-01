export function OrbitVisual() {
  return (
    <div className="orbit-3d relative mx-auto aspect-square w-full max-w-[640px]">
      {/* Ambient glow behind the scene */}
      <div className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(53,90,207,0.35),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-[18%] rounded-full bg-white/50 blur-3xl" />

      {/* 3D stage */}
      <div className="orbit-stage absolute inset-0">
        {/* Central sphere / planet */}
        <div className="orbit-planet">
          <div className="orbit-planet-shine" />
          <div className="orbit-planet-glow" />
        </div>

        {/* Ring 1 — tilt X, spin slow */}
        <div className="orbit-ring orbit-ring-1">
          <div className="orbit-ring-track" />
          <div className="orbit-moon orbit-moon-a" />
        </div>

        {/* Ring 2 — tilt Y, counter spin */}
        <div className="orbit-ring orbit-ring-2">
          <div className="orbit-ring-track" />
          <div className="orbit-moon orbit-moon-b" />
        </div>

        {/* Ring 3 — diagonal, thin */}
        <div className="orbit-ring orbit-ring-3">
          <div className="orbit-ring-track" />
          <div className="orbit-moon orbit-moon-c" />
        </div>

        {/* Floating particles */}
        <span className="orbit-dot orbit-dot-1" />
        <span className="orbit-dot orbit-dot-2" />
        <span className="orbit-dot orbit-dot-3" />
        <span className="orbit-dot orbit-dot-4" />
        <span className="orbit-dot orbit-dot-5" />
      </div>
    </div>
  );
}
