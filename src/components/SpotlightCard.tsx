import { useRef, useState, type PropsWithChildren, type MouseEventHandler } from "react";

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
  /** Si es false, solo se muestra el resplandor de borde, sin la mancha radial que sigue al cursor. */
  showSpotlight?: boolean;
}

/**
 * Tarjeta con dos efectos al pasar el cursor/dedo:
 * 1. Un resplandor radial que sigue al puntero (azul de marca, muy sutil).
 * 2. Un resplandor de borde: el contorno se ilumina en azul al enfocar/hacer hover.
 * Adaptado de react-bits (SpotlightCard) a la paleta cerrada de Órbita Webs.
 */
export function SpotlightCard({
  children,
  className = "",
  showSpotlight = true,
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };
  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card spotlight-border relative overflow-hidden ${className}`}
      style={{ ["--spotlight-opacity" as string]: opacity }}
    >
      {/* mancha radial que sigue al cursor (opcional) */}
      {showSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity,
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(53, 90, 207, 0.55) 0%, rgba(53, 90, 207, 0.25) 25%, transparent 60%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
