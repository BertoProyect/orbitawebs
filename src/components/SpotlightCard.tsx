import { useRef, useState, type PropsWithChildren, type MouseEventHandler, type TouchEventHandler } from "react";

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
}

/**
 * Tarjeta con una mancha de luz radial (azul de marca) que sigue al cursor/dedo.
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

  // Equivalente táctil: la mancha de luz sigue al dedo al deslizar sobre la
  // tarjeta. No llamamos a preventDefault en ningún momento, así el scroll
  // vertical de la página nunca se ve interrumpido.
  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    setOpacity(1);
  };
  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    handleTouchMove(e);
  };
  const handleTouchEnd = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(53, 90, 207, 0.55) 0%, rgba(53, 90, 207, 0.25) 25%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
