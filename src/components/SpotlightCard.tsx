import { useRef, useState, type PropsWithChildren, type MouseEventHandler } from "react";

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
}

/**
 * Tarjeta con una mancha de luz radial (azul de marca) que sigue al cursor.
 * Solo en escritorio: en móvil no se monta el listener ni el gradiente, así
 * no hay coste de renderizado de más en dispositivos táctiles (el efecto
 * dependía de gestos táctiles que GSAP normalizeScroll no dejaba seguir bien
 * al dedo, así que se quitó ahí en vez de seguir intentando arreglarlo).
 * Adaptado de react-bits (SpotlightCard) a la paleta cerrada de Órbita Webs.
 */
export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
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
      className={`relative overflow-hidden ${className}`}
    >
      {/* hidden en móvil (sm:block): en táctil ni se pinta el gradiente */}
      <div
        className="pointer-events-none absolute inset-0 hidden transition-opacity duration-300 ease-out sm:block"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(53, 90, 207, 0.55) 0%, rgba(53, 90, 207, 0.25) 25%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
